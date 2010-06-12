
/**
 * Status を保存する
 *
 * また、各種タイムラインを生成する
 */
tw.Store = function(){
    this.timelines = {};
    this.timelines.homeTimeline = new tw.ServerList("/statuses/home_timeline.json");
    this.timelines.mentions = new tw.ServerList("/statuses/mentions.json");
    this.timelines.sent = new tw.ServerList("/statuses/user_timeline.json");

    setInterval(util.bind(this, this.refresh), 5 * 1000);
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

tw.Store.prototype.createHomeTimeline = function(){
    return this.timelines.homeTimeline;
};

tw.Store.prototype.createMentions = function(){
    return this.timelines.mentions;
};

/**
 * 指定されたユーザの Timeline を作成する
 */
tw.Store.prototype.createUserTimeline = function(user){
    var userId = user;
    if(user.id){
	userId = user.id;
    }
    var url = "/statuses/user_timeline/" + userId + ".json";
    return new tw.ServerList(url);
};

/**
 * 指定されたユーザの favorites を作成する
 * userId が指定されなかった場合は、自分のものを作成する
 */
tw.Store.prototype.createFavorites = function(userId){
    var url = "/favorites.json";
    if(userId){
	url = "/favorites/" + userId + ".json";
    }
    return new tw.ServerList(url);
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

tw.Store.prototype.refresh = function(){
    console.log("auto refresh");
    for(var a in this.timelines){
        var list = this.timelines[a];
	var nextRefresh = new Date(list.interval() + list.updatedAt().getTime());
	if(new Date() >= nextRefresh){
	    list.refresh();
	    break; // 1度に更新するのはひとつだけ
	}
    }
};