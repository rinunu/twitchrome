
/**
 * 含まれる Status をサーバが管理する Timeline
 */
tw.ServerTimeline = function(store, uri, options){
    tw.Timeline.call(this, store, uri, options);
};

util.extend(tw.ServerTimeline, tw.Timeline);

/**
 * サーバと通信し、リストの内容を最新にする
 * 取得する件数は options.count で指定する
 * 
 * 前回の呼出から時間を開けずに呼び出した場合、何も行わない
 */
tw.ServerTimeline.prototype.refresh = function(options){
    options = $.extend({count: 100, force: false}, options);
    var name = this.name_ + "の TL 取得";
    
    if(this.refreshedAt_ && !options.force && 
       (new Date - this.refreshedAt_ < 30 * 1000)){
	console.log("頻繁なため無視しました", name, this.refreshedAt_);
	return;
    }
    if(tw.ajax.command(name)){
	console.log("実行中のため無視しました: " + name);
	return;	
    }
    
    var params = {};
    if(this.refreshedAt_ && this.statuses_.length >=1){
	// refreshedAt_ も見るのは、一度も refresh されていないときはすべて取得するため
	params.since_id = this.statuses_[0].id;
    }
    params.count = options.count;
    tw.ajax.ajax(
	{
	    type: "GET",
	    name: name,
	    url: "/twitter_api" + this.uri_ + ".json",
	    params: params, 
	    callback: util.bind(this, this.onRefresh)
	});
};

tw.ServerTimeline.prototype.newCount = function(){
    // TODO
};

// ----------------------------------------------------------------------
// protected

/**
 * サーバから取得した json を Statuses のリストに変換する
 */
tw.ServerTimeline.prototype.toStatuses = function(json){
    return json;
};

// ----------------------------------------------------------------------
// private

tw.ServerTimeline.prototype.onRefresh = function(json){
    var newStatuses = this.toStatuses(json);
    this.store_.addStatuses(this, newStatuses);
    this.insert(newStatuses);
    this.refreshedAt_ = new Date;
};
