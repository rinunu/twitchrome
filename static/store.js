
/**
 * - すべての Status を保存する
 * - タイムラインを管理する
 * - サーバとの通信を行う
 * 
 * Status について
 * Status は Twitter API の Status をそのまま使用する。
 * ただし、以下のプロパティを追加で保持する。
 * - 処理中かどうか
 * 
 * Status の変更について
 * 変更が正常に完了すると statusRefresh イベントを発生させる
 */
tw.Store = function(){
    this.statuses_ = {};
    this.statusesCount_ = 0;

    this.timelines = {};
    this.timelines.homeTimeline = new tw.ServerList("/statuses/home_timeline.json");
    this.timelines.mentions = new tw.ServerList("/statuses/mentions.json");
    this.timelines.sent = new tw.ServerList("/statuses/user_timeline.json");

    tw.ajax.addAutoRefresh(this.timelines.homeTimeline);
    tw.ajax.addAutoRefresh(this.timelines.mentions);
};

/**
 * 自分の status を更新する
 * inReplyTo は status の先頭に「@対象ユーザ 」という文字が入っている場合のみ有効。
 */
tw.Store.prototype.update = function(status, inReplyTo, callback){
    console.assert(status);

    var url = "/twitter_api/statuses/update.json";
    var params = {
	status: status
    };
    if(inReplyTo &&
       status.indexOf("@" + inReplyTo.user.screen_name + " ") == 0){
	console.log("in_reply_to", inReplyTo);
	params.in_reply_to_status_id = inReplyTo.id;
    }
    tw.ajax.ajax(
	{
	    type: "POST",
	    name: "ツイート", 
	    url: url, 
	    params: params, 
	    callback: util.bind(this, this.onUpdate, callback),
	    target: status
	});
};

/**
 * お気に入りにする
 * 
 */
tw.Store.prototype.favorite = function(status){
    tw.ajax.ajax(
	{
	    type: "POST",
	    name: "お気に入りに追加する",
	    url: "/twitter_api/favorites/create/" + status.id + ".json",
	    callback: util.bind(this, this.onStatusRefresh),
	    target: status
	});
};

/**
 * お気に入りを解除する
 */
tw.Store.prototype.unfavorite = function(status){
    tw.ajax.ajax(
	{
	    type: "POST",
	    name: "お気に入りから削除する",
	    url: "/twitter_api/favorites/destroy/" + status.id + ".json",
	    callback: util.bind(this, this.onStatusRefresh),
	    target: status
	});
};

/**
 * Status を削除する
 */
tw.Store.prototype.destroy = function(status){
};

/**
 * ローカルの DB へ Status を追加する
 * 
 * すでに DB に存在する場合は、それを更新し、 return する
 */
tw.Store.prototype.addStatus = function(status){
    var old = this.statuses_[status.id];
    if(old){
	$.extend(old, status); // overwrite
	return old;
    }
    this.statusesCount_++;
    this.statuses_[status.id] = status;
    console.log("addStatus", this.statusesCount_);
    return status;
};

/**
 * Status を取得する
 * ローカルに保持している場合は、それを取得する
 */
tw.Store.prototype.getStatus = function(id, callback){
    console.log("getStatus");

    var status = this.statuses_[id];
    if(status){
	console.log("use cache");
	setTimeout(function(){callback(status);}, 100);
    }else{
	this.get("/statuses/show/" + id + ".json", {},
		 util.bind(this, this.onGetStatus, callback));
    }
};

/**
 */
tw.Store.prototype.get = function(url, params, callback){
    console.log("refresh", url);
    tw.ajax.ajax(
	{
	    type: "GET",
	    name: "取得", 
	    url: "/twitter_api" + url,
	    params: params, 
	    callback: callback
	});
};

// ----------------------------------------------------------------------

tw.Store.prototype.createHomeTimeline = function(){
    return this.timelines.homeTimeline;
};

tw.Store.prototype.createMentions = function(){
    return this.timelines.mentions;
};

/**
 * 指定されたユーザの Timeline を取得する
 */
tw.Store.prototype.getUserTimeline = function(user){
    var userId = user;
    if(user.id){
	userId = user.id;
    }
    var url = "/statuses/user_timeline/" + userId + ".json";
    return new tw.ServerList(url);
};

tw.Store.prototype.getFriends = function(user){
    var url = "/statuses/friends/" + user.id + ".json";
    return new tw.Users(url);
};

tw.Store.prototype.getFollowers = function(user){
    var url = "/statuses/followers/" + user.id + ".json";
    return new tw.Users(url);
};

/**
 * 指定されたユーザの favorites を作成する
 * user が指定されなかった場合は、自分のものを作成する
 */
tw.Store.prototype.getFavorites = function(user){
    var url = "/favorites.json";
    if(user){
	url = "/favorites/" + user.id + ".json";
    }
    return new tw.ServerList(url);
};

tw.Store.prototype.getConversation = function(status){
    return new tw.ConversationTimeline(status);
};

// ----------------------------------------------------------------------

tw.Store.isStatus = function(object){
    console.assert(object);
    return !!object.user;
};

// ----------------------------------------------------------------------
// private

tw.Store.prototype.onUpdate = function(callback, json){
    console.log("on update");
    callback();
};

tw.Store.prototype.onGetStatus = function(callback, json){
    console.log("onGetStatus", json);
    json = this.addStatus(json);
    callback(json);
};

/**
 * Status の変更が完了した際に呼び出される
 */
tw.Store.prototype.onStatusRefresh = function(json){
    console.log("store on status refresh");
    json = this.addStatus(json);

    util.Event.trigger(this, "statusRefresh", json);
};
