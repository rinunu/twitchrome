
/**
 * 含まれる Status をサーバが管理する List
 */
tw.ServerList = function(url){
    this.url_ = url;
    this.statuses_ = [];

    // 最終更新時間
    this.updatedAt_ = new Date("1999/01/01");

    // 更新間隔(ms)
    this.interval_ = 30 * 1000;
    
};

util.extend(tw.ServerList, tw.List);

/**
 * 更新間隔を取得する(ミリ秒)
 */
tw.ServerList.prototype.interval = function(){
    return this.interval_;
};

tw.ServerList.prototype.updatedAt = function(){
    return this.updatedAt_;
};

/**
 * サーバと通信し、リストの内容を最新にする
 * 取得する件数は count で指定する
 * 
 * 前回の呼出から時間を開けずに呼び出した場合、何も行わない
 */
tw.ServerList.prototype.refresh = function(count){
    if(new Date - this.updatedAt_ < 30 * 1000){
	console.log("頻繁な refresh を無視しました");
	return;
    }
    
    var params = {};
    if(this.statuses_.length >=1){
	params.since_id = this.statuses_[0].id;
    }
    params.count = count || 100;
    tw.store.get(this.url_, params, util.bind(this, this.onRefresh));
};

tw.ServerList.prototype.statuses = function(){
    return this.statuses_;
};

tw.ServerList.prototype.newCount = function(){
    // TODO
};

/**
 * 指定されたステータスより新しい Status を列挙する
 * 列挙順は古い順
 */
tw.ServerList.prototype.eachNew = function(fn, origin){
    origin = origin ? origin.id : 0;

    var length = this.statuses_.length;
    for(var i = 0; i < length; i++){
      	var status = this.statuses_[i];
	if(status.id <= origin){
	    break;
	}
    }
    for(i--; i >= 0; i--){
	fn(this.statuses_[i]);
    }
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
    this.statuses_ = this.toStatuses(json).concat(this.statuses_);
    this.updatedAt_ = new Date;
    util.Event.trigger(this, "refresh");
};
