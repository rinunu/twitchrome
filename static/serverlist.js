
/**
 * 含まれる Status をサーバが管理する List
 */
tw.ServerList = function(url){
    tw.List.call(this);
    
    this.url_ = url;

    // 更新間隔(ms)
    this.interval_ = 60 * 1000;
};

util.extend(tw.ServerList, tw.List);

/**
 * 更新間隔を取得する(ミリ秒)
 */
tw.ServerList.prototype.interval = function(){
    return this.interval_;
};

/**
 * サーバと通信し、リストの内容を最新にする
 * 取得する件数は options.count で指定する
 * 
 * 前回の呼出から時間を開けずに呼び出した場合、何も行わない
 */
tw.ServerList.prototype.refresh = function(options){
    options = $.extend({count: 100, force: false}, options);
    
    if(!options.force && new Date - this.updatedAt_ < 30 * 1000){
	console.log("頻繁な refresh を無視しました");
	return;
    }
    
    var params = {};
    if(this.statuses_.length >=1){
	params.since_id = this.statuses_[0].id;
    }
    params.count = options.count;
    tw.store.get(this.url_, params, util.bind(this, this.onRefresh));
};

tw.ServerList.prototype.newCount = function(){
    // TODO
};

// ----------------------------------------------------------------------
// protected

/**
 * サーバから取得した json を Statuses のリストに変換する
 */
tw.ServerList.prototype.toStatuses = function(json){
    return json;
};

// ----------------------------------------------------------------------
// private

tw.ServerList.prototype.onRefresh = function(json){
    console.log("on refresh");
    var newStatuses = this.toStatuses(json);

    this.statuses_ = newStatuses.concat(this.statuses_);
    this.addNew(newStatuses);
};
