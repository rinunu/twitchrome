
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

    // {screen_name : User}
    this.users_ = {};
    this.usersCount_ = 0;
    
    this.timelines_ = [];
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
 * Status を取得する
 * ローカル DB にある場合は、それを取得する
 */
tw.Store.prototype.getStatus = function(id, callback){
    console.log("getStatus");

    var status = this.statuses_[id];
    if(status){
	console.log("use cache");
	setTimeout(function(){callback(status);}, 10);
    }else{
	tw.ajax.ajax(
	    {
		type: "GET",
		name: "ステータスの取得", 
		url: "/twitter_api" + "/statuses/show/" + id + ".json",
		callback: util.bind(this, this.onGetStatus, callback)
	    });
    }
};

/**
 * User を取得する
 * ローカル DB にある場合は、それを取得する
 * 
 * TODO 現在ローカルに存在する場合にのみ正常に動く
 */
tw.Store.prototype.user = function(screenName, callback){
    var user = this.users_[screenName];
    if(user){
	console.log("use cache");
	setTimeout(function(){callback(user);}, 10);
    }else{
	// TODO
    }
};

/**
 * ローカルの DB へ statuses を追加する
 * 
 * すでに DB に存在する場合は、それを更新する。
 * その場合、 statuses の当該 Status は、DB に存在するオブジェクトで置き換えられる。
 * 
 * timeline には、呼び出し元の Timeline を指定する。
 * 
 * また、addStatuses(timeline, statuses) イベント通知を行う
 */
tw.Store.prototype.addStatuses = function(timeline, statuses){
    for(var i = 0; i < statuses.length; i++){
	statuses[i] = this.addStatus(statuses[i]);
    }

    util.Event.trigger(this, "addStatuses", timeline, statuses);
};

// ----------------------------------------------------------------------
// Timeline の取得

tw.Store.prototype.homeTimeline = function(){
    var uri = "/statuses/home_timeline";
    return this.getOrCreateTimeline(uri, tw.ServerList, uri);
};

tw.Store.prototype.mentions = function(){
    var uri = "/statuses/mentions";
    return this.getOrCreateTimeline(uri, tw.ServerList, uri);
};

/**
 * 指定されたユーザの TL を取得する
 */
tw.Store.prototype.userTimeline = function(user){
    var uri = "/statuses/user_timeline/" + (user.screen_name ? user.screen_name : user);
    return this.getOrCreateTimeline(uri, tw.ServerList, uri);
};

/**
 * 指定されたユーザの favorites を作成する
 * user が指定されなかった場合は、自分のものを作成する
 */
tw.Store.prototype.favorites = function(user){
    var uri = "/favorites";
    if(user){
	uri = "/favorites/" + user.screen_name;
    }
    return this.getOrCreateTimeline(uri, tw.ServerList, uri);
};

/**
 * 指定されたユーザの friends TL を取得する
 */
tw.Store.prototype.friends = function(user){
    var uri = "/statuses/friends/" + user.screen_name;
    return this.getOrCreateTimeline(uri, tw.Users, uri);
};

tw.Store.prototype.followers = function(user){
    var uri = "/statuses/followers/" + user.screen_name;
    return this.getOrCreateTimeline(uri, tw.Users, uri);
};

tw.Store.prototype.getConversation = function(status){
    var uri = "/conversations/" + status.id;
    return this.getOrCreateTimeline(uri, tw.ConversationTimeline, status);
};

// ----------------------------------------------------------------------

tw.Store.isStatus = function(object){
    console.assert(object);
    return !!object.user;
};

// ----------------------------------------------------------------------
// private

/**
 * ローカルの DB へ User を追加する
 * 
 * すでに DB に存在する場合は、それを更新し、 return する
 */
tw.Store.prototype.addUser = function(user){
    var old = this.users_[user.screen_name];
    if(old){
	$.extend(old, user); // overwrite
	user = old;
    }else{
	this.usersCount_++;
	this.users_[user.screen_name] = user;
	console.log("addUser", this.usersCount_);
    }
    return user;
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
	status = old;
    }else{
	this.statusesCount_++;
	this.statuses_[status.id] = status;
	console.log("addStatus", this.statusesCount_);
    }
    status.user = this.addUser(status.user);
    return status;
};

/**
 * Timeline を取得する
 * 存在しない場合は null を返す
 */
tw.Store.prototype.timeline = function(uri){
    for(var i = 0; i < this.timelines_.length; i++){
	var timeline = this.timelines_[i];
	if(timeline.uri() == uri){
	    return timeline;
	}
    }
    return null;
};

/**
 * Timeline をキャッシュへ追加する
 */
tw.Store.prototype.addTimeline = function(timeline){
    console.assert(!this.timeline(timeline));
    this.timelines_.push(timeline);
};

/**
 * Timeline を取得する
 * 存在しない場合は作成する
 */
tw.Store.prototype.getOrCreateTimeline = function(uri, constructor, param){
    var timeline = this.timeline(uri);
    if(timeline){
	return timeline;
    }
    timeline = new constructor(this, param);
    this.addTimeline(timeline);
    return timeline;
};

// ----------------------------------------------------------------------
// イベントハンドラ

tw.Store.prototype.onUpdate = function(callback, json){
    console.log("on update");
    callback();
};

tw.Store.prototype.onGetStatus = function(callback, json){
    console.log("onGetStatus", json);
    var statuses = [json];
    this.addStatuses(null, statuses);
    callback(statuses[0]);
};

/**
 * Status の変更が完了した際に呼び出される
 */
tw.Store.prototype.onStatusRefresh = function(json){
    console.log("store on status refresh");
    json = this.addStatus(json);

    util.Event.trigger(this, "statusRefresh", json);
};
