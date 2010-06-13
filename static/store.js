
/**
 * Status を保存する
 *
 * また、各種タイムラインを生成する
 */
tw.Store = function(){
    this.statuses_ = {};

    this.timelines = {};
    this.timelines.homeTimeline = new tw.ServerList("/statuses/home_timeline.json");
    this.timelines.mentions = new tw.ServerList("/statuses/mentions.json");
    this.timelines.sent = new tw.ServerList("/statuses/user_timeline.json");

    setInterval(util.bind(this, this.refreshAll), 10 * 1000);
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
    jQuery.post(url, params, util.bind(this, this.onUpdate, callback), "json");
};

/**
 * ローカルの DB へ Status を追加する
 */
tw.Store.prototype.addStatus = function(status){
    this.statuses_[status.id] = status;
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
    $.getJSON("/twitter_api" + url, params, callback);
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
 * userId が指定されなかった場合は、自分のものを作成する
 */
tw.Store.prototype.getFavorites = function(userId){
    var url = "/favorites.json";
    if(userId){
	url = "/favorites/" + userId + ".json";
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

tw.Store.prototype.refreshAll = function(){
    for(var a in this.timelines){
        var list = this.timelines[a];
	var nextRefresh = new Date(list.interval() + list.updatedAt().getTime());
	if(new Date() >= nextRefresh){
	    list.refresh();
	    break; // 1度に更新するのはひとつだけ
	}
    }
};

tw.Store.prototype.onGetStatus = function(callback, json){
    console.log("onGetStatus", json);
    this.addStatus(json);
    callback(json);
};
