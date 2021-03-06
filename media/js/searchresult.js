/**
 * 検索結果をあらわす Timeline
 */
tw.SearchResult = function(store, text){
    var options = {
	name: text + " の検索結果",
	hasSinceId: true,
	countParam: "rpp"
    };
    this.text = text;
    tw.ServerTimeline.call(this, store, tw.SearchResult.uri(text), options);
};

util.extend(tw.SearchResult, tw.ServerTimeline);

/**
 * 本 Timeline を表す uri を生成する
 */
tw.SearchResult.uri = function(text){
    return "/search/" + text;
};

// ----------------------------------------------------------------------
// protected

tw.SearchResult.prototype.setCommonParams = function(request, options){
    request.params.q = this.text;
    request.url = "http://search.twitter.com/search.json";
    request.dataType = "jsonp";
    tw.ServerTimeline.prototype.setCommonParams.apply(this, arguments);
};

/**
 * サーバから取得した json を Statuses のリストに変換する
 */
tw.SearchResult.prototype.toStatuses = function(json){
    console.log(json);

    // フォーマットがだいぶ異なる
    var statuses = json.results;
    for(var i = 0, length = statuses.length; i < length; i++){
	var status = statuses[i];
	status.source = status.source ? status.source.
	    replace(/&lt;/g, "<").replace(/&gt;/g, ">") : null;
	
	var user = this.store_.hasUser(status.from_user);
	if(!user){
	    user = {
		screen_name: status.from_user,
		profile_image_url: status.profile_image_url
	    };
	}
	status.user = user;
    }
    return statuses;
};
