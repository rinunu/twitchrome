
/**
 * 含まれる Status をサーバが管理する Timeline
 */
tw.ServerTimeline = function(store, uri, options){
    tw.Timeline.call(this, store, uri, options);

    // 更新間隔(ms)
    this.interval_ = 60 * 1000;
};

util.extend(tw.ServerTimeline, tw.Timeline);

/**
 * 更新間隔を取得する(ミリ秒)
 */
tw.ServerTimeline.prototype.interval = function(){
    return this.interval_;
};

/**
 * サーバと通信し、リストの内容を最新にする
 * 取得する件数は options.count で指定する
 * 
 * 前回の呼出から時間を開けずに呼び出した場合、何も行わない
 */
tw.ServerTimeline.prototype.refresh = function(options){
    options = $.extend({count: 100, force: false}, options);
    
    if(this.updatedAt_ && !options.force && new Date - this.updatedAt_ < 30 * 1000){
	console.log("頻繁な refresh を無視しました");
	return;
    }
    
    var params = {};
    if(this.updatedAt_ && this.statuses_.length >=1){
	// updatedAt_ も見るのは、一度も refresh されていないときは強制的に行うため
	params.since_id = this.statuses_[0].id;
    }
    params.count = options.count;
    tw.ajax.ajax(
	{
	    type: "GET",
	    name: "TL の更新", 
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
    this.statuses_ = newStatuses.concat(this.statuses_);
    this.statuses_.sort(function(a, b){return b.id - a.id;});
    this.addNew(newStatuses);
};
