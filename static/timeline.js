
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
 * options: {
 *   filter: Status をこの Timeline に含めるか判断する関数,
 *   name: この TL の名称
 * }
 */
tw.Timeline = function(store, uri, options){
    options = $.extend({}, options);
    console.assert(uri);
    this.statuses_ = [];
    this.store_ = store;
    this.uri_ = uri;
    this.filter_ = options.filter;
    this.name_ = options.name;

    // 最終 refresh 時間
    this.refreshedAt_ = null;
};

tw.Timeline.prototype.uri = function(){
    return this.uri_;
};

tw.Timeline.prototype.refreshedAt = function(){
    return this.refreshedAt_;
};

/**
 * statuses(object) を本 Timeline に追加する
 * 
 * 追加するのは opitons.filter が true を返すもの。
 *
 * refresh イベントを通知する
 */
tw.Timeline.prototype.addStatuses = function(statuses){
    if(!this.filter_){
	console.log("no filter");
	return;
    }

    var newStatuses = [];
    for(var i in statuses){
	var status = statuses[i];
	if(this.filter_(status)){
	    newStatuses.push(status);
	}
    }
    
    this.sort(newStatuses);
    this.insert(newStatuses);
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
 * statuses を適切な位置へ追加する
 * 
 * 前提
 * - this.statuses, newStatuses が Status 作成日の降順になっている
 * - もしくは this.statuses が空である
 * - newStatuses は作成日の降順になっている
 * - newStatuses に値の重複はない
 *
 * 更新通知を行う
 */
tw.Timeline.prototype.insert = function(newStatuses){
    if(newStatuses.length == 0){
	return;
    }

    var result = [];
    var aStatuses = newStatuses;
    var bStatuses = this.statuses_;
    
    // a, b を result へマージ
    var iResult = 0,
    iA = 0,
    lA = aStatuses.length,
    iB = 0,
    lB = bStatuses.length;
    for(;;){
	var aStatus = aStatuses[iA];
	var bStatus = bStatuses[iB];
	if(!aStatus && !bStatus){
	    break;
	}else if(aStatus && (!bStatus || aStatus.id > bStatus.id)){
	    result[iResult++] = aStatus;
	    iA++;
	}else if(bStatus && (!aStatus || aStatus.id < bStatus.id)){
	    result[iResult++] = bStatus;
	    iB++;
	}else{
	    result[iResult++] = aStatus;
	    iA++;
	    iB++;
	}
    }

    this.statuses_ = result;
    util.Event.trigger(this, "refresh", newStatuses);
};

// ----------------------------------------------------------------------
// private

/**
 * Status の作成日の降順にソートする
 */
tw.Timeline.prototype.sort = function(statuses){
    statuses.sort(function(a, b){return b.id - a.id;});
};