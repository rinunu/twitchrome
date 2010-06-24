
/**
 * List を管理する
 */
tw.Lists = function(){
};

/**
 * 指定した user の所有するリストの一覧を取得する
 */
tw.Lists.prototype.lists = function(user, callback){
    var screenName = user.screen_name || user;
    tw.ajax.ajax(
	{
	    type: "lists",
	    name: screenName + "の所有リスト取得",
	    url: "/twitter_api/" + screenName + "/lists.json",
	    callback: util.bind(this, this.onGetLists, callback)
	});
};

/**
 * 指定した user の購読している List の一覧を取得する
 */
tw.Lists.prototype.subscriptions = function(user, callback){
    var screenName = user.screen_name || user;
    tw.ajax.ajax(
	{
	    type: "lists",
	    name: screenName + "の購読リスト取得",
	    url: "/twitter_api/" + screenName + "/lists/subscriptions.json",
	    callback: util.bind(this, this.onGetLists, callback)
	});
};

tw.Lists.prototype.onGetLists = function(callback, json){
    var lists = json.lists;
    for(var i = 0; i < lists; i++){
	var list = lists[i];
	list.user = tw.store.addUser(list.user);
    }

    callback(lists);
};
