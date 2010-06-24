
/**
 * List の取得等を行う
 * 
 * List の管理は Store にて行う
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

// ----------------------------------------------------------------------
// private

tw.Lists.prototype.onGetLists = function(callback, json){
    var lists = json.lists;
    var result = [];
    for(var i = 0; i < lists.length; i++){
	var list = tw.store.list(lists[i].full_name, lists[i]);
	result.push(list);
    }
    callback(result);
};
