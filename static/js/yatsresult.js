
/**
 * http://pcod.no-ip.org/yats/ を使用した検索結果
 */
tw.YatsResult = function(store, text){
    var options = {name: text + " の検索結果"};
    this.text = text;
    tw.ServerTimeline.call(this, store, tw.YatsResult.uri(text), options);
};

util.extend(tw.YatsResult, tw.ServerTimeline);

/**
 * 本 Timeline を表す uri を生成する
 */
tw.YatsResult.uri = function(text){
    return "/search/" + text;
};

// ----------------------------------------------------------------------
// protected

tw.YatsResult.prototype.request = function(command){
    command.params.query = this.text;
    command.jsonp = "json";
    command.url = "http://pcod.no-ip.org/yats/search";
    command.dataType = "jsonp";
    tw.ajax.ajax(command);
};

tw.YatsResult.prototype.toStatuses = function(source){
    var statuses = [];
    for(var i = 0, length = source.length; i < length; i++){
	var a = source[i];
	var status = {
	    id: a.id,
	    created_at: a.time,
	    text: a.content};
	var user = this.store_.hasUser(a.user);
	if(!user){
	    user = {
		screen_name: a.user,
		profile_image_url: a.image
	    };
	}
	status.user = user;
	statuses.push(status);
    }
    console.log("yats", statuses);
    return statuses;
};
