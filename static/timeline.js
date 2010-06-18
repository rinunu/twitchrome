
/**
 * Status のリストを表す
 *
 * 以下の情報を持つ
 * - リストに含まれる Status
 * - リストを識別する URI
 * 
 * イベント
 * refresh(newStatuses):
 *   更新された際に通知する。newStatuses は作成日の降順に並んでいる
 * 
 * options: {filter: Status をこの Timeline に含めるか判断する関数}
 */
tw.Timeline = function(store, uri, options){
    options = $.extend({}, options);
    console.assert(uri);
    this.statuses_ = [];
    this.store_ = store;
    this.uri_ = uri;
    this.filter_ = options.filter;

    // 最終更新時間
    this.updatedAt_ = null;
};

tw.Timeline.prototype.uri = function(){
    return this.uri_;
};

tw.Timeline.prototype.updatedAt = function(){
    return this.updatedAt_;
};

/**
 * statuses(object) を本 Timeline に追加する
 * 
 * 追加するのは opitons.filter が true を返すもの。
 */
tw.Timeline.prototype.addStatuses = function(statuses){
    if(!this.filter_){
	console.log("no filter");
	return;
    }
    
    for(var i in statuses){
	var status = statuses[i];
	if(this.filter_(status)){
	    this.statuses_.push(status);
	}
    }
};

tw.Timeline.prototype.statuses = function(){
    return this.statuses_;
};

/**
 * status の Timeline 内での位置を取得する
 * 存在しない場合は -1
 */
tw.Timeline.prototype.indexOf = function(status){
    return $.inArray(status, this.statuses_);
};

// ----------------------------------------------------------------------
// protected

/**
 * 新しい Status を追加した際に呼び出す
 * (実際の追加は効率のためサブクラスにて行う)
 * 
 * 更新通知を行う
 */
tw.Timeline.prototype.addNew = function(statuses){
    this.updatedAt_ = new Date;
    util.Event.trigger(this, "refresh", statuses);
};
