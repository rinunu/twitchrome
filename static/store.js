
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
 * Status が存在しているならそれを取得する
 * 存在しないなら undefined
 */
tw.Store.prototype.hasStatus = function(id){
    return this.statuses_[id];
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
 * User が存在するならそれを返す
 * 存在しないなら null を返す
 */
tw.Store.prototype.hasUser = function(screenName){
    return this.users_[screenName];
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
 * ローカルの DB へ User を追加する
 * 
 * すでに DB に存在する場合は、それを更新し、 return する
 */
tw.Store.prototype.addUser = function(user){
    var old = this.users_[user.screen_name];
    if(old){
	if(!old.statuses_count || user.statuses_count > old.statuses_count){
	    $.extend(old, user); // overwrite
	}
	user = old;
    }else{
	this.usersCount_++;
	this.users_[user.screen_name] = user;
    }
    return user;
};

/**
 * ローカルの DB へ statuses を追加する
 * 
 * すでに DB に存在する場合は、それを更新する。
 * その場合、 statuses の当該 Status は、DB に存在するオブジェクトで置き換えられる。
 * 
 * timeline には、呼び出し元の Timeline を指定する。
 * 
 * その他の処理
 * - 指定された timeline 以外の Timeline に statuses を追加する
 */
tw.Store.prototype.addStatuses = function(timeline, statuses){
    var statusMap = {};
    for(var i = 0; i < statuses.length; i++){
	var status = this.addStatus(statuses[i]);
	statuses[i] = status;
	statusMap[status.id] = status;
    }

    for(i = 0; i < this.timelines_.length; i++){
	var otherTimeline = this.timelines_[i];
	if(otherTimeline != timeline){
	    otherTimeline.addStatuses(statusMap);
	}
    }
};

// ----------------------------------------------------------------------
// Timeline の取得

/**
 * 指定された URI の Timeline が存在するならそれを返す
 * 
 * 存在しないなら null を返す
 */
tw.Store.prototype.hasTimeline = function(uri){
    for(var i = 0; i < this.timelines_.length; i++){
	var timeline = this.timelines_[i];
	if(timeline.uri() == uri){
	    return timeline;
	}
    }
    return null;
};

/**
 * Timeline を取得する
 * 存在しない場合は作成する
 */
tw.Store.prototype.timeline = function(uri){
    var timeline = this.hasTimeline(uri);
    if(timeline){
	return timeline;
    }

    // uri を解析し、適切な TL を取得する
    var m = null;
    if(uri == "/statuses/home_timeline"){
	return this.homeTimeline();
    }else if(uri == "/statuses/mentions"){
	return this.mentions();
    }else if((m = /\/statuses\/user_timeline\/(\w+)/.exec(uri))){
	return this.userTimeline(m[1]);
    }else if((m = /\/favorites\/(\w+)/.exec(uri))){
	return this.favorites(m[1]);
    }else if((m = /\/statuses\/friends\/(\w+)/.exec(uri))){
	return this.friends(m[1]);
    }else if((m = /\/statuses\/followers\/(\w+)/.exec(uri))){
	return this.followers(m[1]);
    }else if((m = /\/conversations\/(\w+)/.exec(uri))){
	return this.conversation(m[1]);
    }else if((m = /\/search\/(.*)/.exec(uri))){
	return this.search(m[1]);
    }else{
	console.error("タイムラインの指定が不正です", uri);
	return this.homeTimeline();
    }
};

tw.Store.prototype.homeTimeline = function(){
    var uri = "/statuses/home_timeline";
    var options = {name: "ホーム"};
    return this.getOrCreateTimeline(uri, tw.ServerTimeline, uri, options);
};

tw.Store.prototype.mentions = function(){
    var uri = "/statuses/mentions";
    var options = {name: "あなた宛"};
    return this.getOrCreateTimeline(uri, tw.ServerTimeline, uri, options);
};

/**
 * 指定されたユーザの TL を取得する
 * 
 * user は User もしくは screenName
 */
tw.Store.prototype.userTimeline = function(user){
    var screenName = user.screen_name || user;
    var uri = "/statuses/user_timeline/" + screenName;
    var options = {
	name: screenName + "の TL",
	filter: function(status){
	    return status.user.screen_name == screenName;
	}
    };
    return this.getOrCreateTimeline(uri, tw.ServerTimeline, uri, options);
};

/**
 * 指定されたユーザの favorites を作成する
 * user は User もしくは screenName
 */
tw.Store.prototype.favorites = function(user){
    var screenName = user.screen_name || user;
    var uri = "/favorites/" + screenName;
    var options = {name: screenName + " のお気に入り"};
    return this.getOrCreateTimeline(uri, tw.ServerTimeline, uri, options);
};

/**
 * 指定されたユーザの friends TL を取得する
 * user は User もしくは screenName
 */
tw.Store.prototype.friends = function(user){
    var screenName = user.screen_name || user;
    var uri = "/statuses/friends/" + screenName;
    var options = {name: screenName + " の following"};
    return this.getOrCreateTimeline(uri, tw.Users, uri, options);
};

/**
 * 指定されたユーザの followers TL を取得する
 * user は User もしくは screenName
 */
tw.Store.prototype.followers = function(user){
    var screenName = user.screen_name || user;
    var uri = "/statuses/followers/" + screenName;
    var options = {name: screenName + " の followers"};
    return this.getOrCreateTimeline(uri, tw.Users, uri, options);
};

/**
 * 指定された status の conversation TL を取得する
 * status は Status もしくは statusId
 */
tw.Store.prototype.conversation = function(status){
    var statusId = status.id || status;
    var uri = "/conversations/" + statusId;
    var options = {name: statusId + " から始まる会話"};
    return this.getOrCreateTimeline(uri, tw.ConversationTimeline, statusId, options);
};

/**
 * 指定された text を検索する TL を取得する
 */
tw.Store.prototype.search = function(text){
    var uri = tw.SearchResult.uri(text);
    return this.getOrCreateTimeline(uri, tw.SearchResult, text);
};

// ----------------------------------------------------------------------

tw.Store.isStatus = function(object){
    console.assert(object);
    return !!object.user;
};

// ----------------------------------------------------------------------
// private

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
    }
    status.user = this.addUser(status.user);
    return status;
};

/**
 * Timeline をキャッシュへ追加する
 */
tw.Store.prototype.addTimeline = function(timeline){
    console.assert(!this.hasTimeline(timeline.uri()));
    this.timelines_.push(timeline);
};

/**
 * Timeline を取得する
 * 存在しない場合は作成する
 */
tw.Store.prototype.getOrCreateTimeline = function(uri, constructor, param, options){
    var timeline = this.hasTimeline(uri);
    if(timeline){
	return timeline;
    }
    timeline = new constructor(this, param, options);
    timeline.addStatuses(this.statuses_);
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
