
/**
 * - すべての Status を保存する
 * - タイムラインを管理する
 * - サーバとの通信を行う
 * 
 * Status について
 * Status は Twitter API の Status をそのまま使用する。
 * ただし、以下のプロパティを追加で保持する。
 * - replies: その Status への返信の map
 * 
 * Status の種類
 * - 完全な Status
 * - 検索結果(不完全。 ただし表示するには十分。 可能なら完全データで更新すべき)
 * - ID と replies のみもっている。 言及はされたがデータは持っていないもの。
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
 * 
 * file にはアップロードする <input> を指定する
 */
tw.Store.prototype.update = function(text, inReplyTo, file){
    console.assert(text);

    var params = {
	status: text
    };
    if(inReplyTo &&
       text.indexOf("@" + inReplyTo.user.screen_name + " ") == 0){
	console.log("in_reply_to", inReplyTo);
	params.in_reply_to_status_id = inReplyTo.id;
    }

    var command = new tw.AsyncCommand(
	function(){
	    if(file){
		var upload = tw.Twitpic.upload(file, text);
		upload.success(util.bind(this, this.onUpload));
		upload.error(util.bind(this, this.onError));
	    }else{
		this.update();
	    }
	});

    command.update = function(){
	tw.ajax.ajax(
	    {
		type: "update",
		method: "POST",
		name: "ツイート", 
		url: "/twitter_api/statuses/update.json",
		params: params,
		callback: util.bind(this, this.onUpdate),
		error: util.bind(this, this.onError)
	    });
    };

    command.onUpload = function(result){
	console.log("on upload");
	console.assert(result.url);
	params.status += " " + result.url;
	this.update();
    };

    command.onUpdate = function(result){
	this.onSuccess(result);
    };

    command.execute();
    return command;
};

/**
 * 公式 RT を行う
 */
tw.Store.prototype.retweet = function(status, callback){
    console.log("retweet", status);

    tw.ajax.ajax(
	{
	    type: "retweet",
	    method: "POST",
	    name: "リツイート",
	    url: "/twitter_api/statuses/retweet/" + status.id + ".json",
	    callback: util.bind(this, this.onUpdate, callback)
	});
};

/**
 * お気に入りにする
 * 
 */
tw.Store.prototype.favorite = function(status){
    tw.ajax.ajax(
	{
	    type: "favorite",
	    method: "POST",
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
	    type: "unfavorite",
	    method: "POST",
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
 * 存在しないなら false
 */
tw.Store.prototype.hasStatus = function(id){
    var status = this.statuses_[id];
    return (status && status.user) ? status : null;
};

/**
 * Status を取得する
 * ローカル DB にある場合は、それを取得する
 */
tw.Store.prototype.getStatus = function(id, callback){
    console.log("getStatus");

    var status = this.hasStatus(id);
    if(status){
	console.log("use cache");
	setTimeout(function(){callback(status);}, 10);
    }else{
	tw.ajax.ajax(
	    {
		type: "getStatus",
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
	var command = {
	    type: "getUser",
	    name: screenName + " のユーザ情報取得",
	    url: "/twitter_api/users/show/" + screenName + ".json",
	    callback: util.bind(this, this.onGetUser, callback)
	};
	tw.ajax.ajax(command);
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

tw.Store.prototype.statusesCount = function(){
    return this.statusesCount_;
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
    var added = [];
    var addedMap = {};
    for(var i = 0; i < statuses.length; i++){
	var old = statuses[i];
	var status = this.addStatus(old);
	statuses[i] = status;
	if(old != status){ // 既存なら
	    continue;
	}
	added.push(status);
	addedMap[status.id] = status;
    }

    if(added.length == 0){
	return;
    }

    tw.unread.addStatuses(timeline, added);

    for(i = 0; i < this.timelines_.length; i++){
	var otherTimeline = this.timelines_[i];
	if(otherTimeline != timeline){
	    otherTimeline.addStatuses(addedMap);
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
 * すべての Timeline を取得する
 */
tw.Store.prototype.timelines = function(){
    return this.timelines_;
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

    // uri を解析し、適切な TL を生成する
    var m = null;
    if(uri == "/statuses/home_timeline"){
	return this.homeTimeline();
    }else if(uri == "/statuses/mentions"){
	return this.mentions();
    }else if((m = /\/statuses\/user_timeline\/([\w-]+)/.exec(uri))){
	return this.userTimeline(m[1]);
    }else if((m = /\/favorites\/([\w-]+)/.exec(uri))){
	return this.favorites(m[1]);
    }else if((m = /\/statuses\/friends\/([\w-]+)/.exec(uri))){
	return this.friends(m[1]);
    }else if((m = /\/statuses\/followers\/([\w-]+)/.exec(uri))){
	return this.followers(m[1]);
    }else if((m = /\/conversations\/([\w-]+)/.exec(uri))){
	return this.conversation(m[1]);
    }else if((m = /\/search\/(.*)/.exec(uri))){
	return this.search(m[1]);
    }else if((m = /\/([\w-]+)\/lists\/([\w-]+)\/statuses/.exec(uri))){
	return this.list("@" + m[1] + "/" + m[2]);
    }else{
	console.error("タイムラインの指定が不正です", uri);
	return this.homeTimeline();
    }
};

tw.Store.prototype.homeTimeline = function(){
    var uri = "/statuses/home_timeline";
    var options = {
	name: "ホーム",
	hasSinceId: true,
	hasMaxId: true,
	countParam: "count"
    };
    return this.getOrCreateTimeline(uri, tw.ServerTimeline, uri, options);
};

tw.Store.prototype.mentions = function(){
    var uri = "/statuses/mentions";
    var options = {
	name: "あなた宛",
	hasSinceId: true,
	hasMaxId: true,
	countParam: "count"
    };
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
	hasSinceId: true,
	hasMaxId: true,
	countParam: "count",
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
    var options = {
	name: screenName + " のお気に入り",
	countParam: "count"
    };
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
    return this.getOrCreateTimeline(uri, tw.settings.searchResult, text);
};

tw.Store.prototype.list = function(fullName, raw){
    var uri = tw.List.uri(fullName);
    var options = {raw: raw};
    return this.getOrCreateTimeline(uri, tw.List, fullName, options);
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
 * 
 * text をパースし、 entities 情報を追加する
 */
tw.Store.prototype.addStatus = function(status){
    var old = this.statuses_[status.id];
    // すでに存在し、内容が十分で、内容も変わっていない場合
    if(old && old.user && old.user.created_at &&
       old.favorited == status.favorited){
	return old;
    }

    this.addEntities(status);
    
    // 内容が変わっている場合は上書きする
    if(old){
	$.extend(old, status);
	status = old;
	util.Event.trigger(this, "statusRefresh", status);
    }else{
	this.statusesCount_++;
	this.statuses_[status.id] = status;
    }

    // in_reply_to の宛先に情報を追加する
    var inReplyTo = status.in_reply_to_status_id;
    if(inReplyTo){
	var dest = this.statuses_[inReplyTo];
	if(!dest){
	    dest = {
		id: inReplyTo
	    };
	    this.statuses_[inReplyTo] = dest;
	}
	dest.replies = dest.replies || {};
	dest.replies[status.id] = status;
	if(dest.user){ // dest が完全な Status の場合のみ
	    util.Event.trigger(this, "statusRefresh", dest);
	}
    }

    status.user = this.addUser(status.user);
    return status;
};

/**
 * 正規表現にマッチする部分を取得する
 */
tw.Store.prototype.findAll = function(re, string, callback){
    re.lastIndex = 0;
    var result = [];
    var m;
    while ((m = re.exec(string)) != null) {
	result.push(callback(m));
    }
    return result;
};

/**
 * 
 */
tw.Store.URL_RE = /https?:[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g;
tw.Store.USER_RE = /@(\w+)/g;
tw.Store.HASH_RE = /([^&]|^)#(\w+)/g;
tw.Store.prototype.addEntities = function(status){
    if(!status.text || status.entities){
	return;
    }

    status.entities = {};

    status.entities.hashtags = this.findAll(
	tw.Store.HASH_RE,
	status.text,
	function(m){
	    var start = m.index + m[1].length;
	    return {
		text: m[2],
		indices: [start, start + 1 + m[2].length]
	    };
	});

    status.entities.urls = this.findAll(
	tw.Store.URL_RE,
	status.text,
	function(m){
	    return {
		url: m[0],
		indices: [m.index, m.index + m[0].length]
	    };
	});

    status.entities.user_mentions = this.findAll(
	tw.Store.USER_RE,
	status.text,
	function(m){
	    var start = m.index;
	    return {
		screen_name: m[1],
		indices: [m.index, m.index + 1 + m[1].length]
	    };
	});
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

/**
 * update / retweet 完了時の処理
 */
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

tw.Store.prototype.onGetUser = function(callback, json){
    console.log("onGetUser", json);
    var user = this.addUser(json);
    callback(user);
};

/**
 * Status の変更が完了した際に呼び出される
 */
tw.Store.prototype.onStatusRefresh = function(json){
    console.log("store on status refresh");
    this.addStatus(json);
};
