
/**
 * Status のリストを表す
 *
 * 以下の情報を持つ
 * - リストに含まれる Status
 * - リストを取得した条件
 * - ユーザのリスト内での選択位置
 * 
 * イベント
 * refresh(newStatuses):
 * 更新された際に通知する。newStatuses は作成日の降順に並んでいる
 */
tw.List = function(){
    this.focus_ = null;
    this.statuses_ = [];

    // 最終更新時間
    this.updatedAt_ = new Date("1999/01/01");
};

tw.List.prototype.updatedAt = function(){
    return this.updatedAt_;
};

/**
 * フォーカスされている Status を取得する
 */
tw.List.prototype.focus = function(){
    return this.focus_;
};

/**
 * フォーカスされている Status を取得する
 */
tw.List.prototype.setFocus = function(focus){
    this.focus_ = focus;
};

tw.List.prototype.statuses = function(){
    return this.statuses_;
};

/**
 * status の List 内での位置を取得する
 * 存在しない場合は -1
 */
tw.List.prototype.indexOf = function(status){
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
tw.List.prototype.addNew = function(statuses){
    for(var i = 0; i < statuses.length; i++){
	tw.store.addStatus(statuses[i]);
    }
    
    this.updatedAt_ = new Date;
    util.Event.trigger(this, "refresh", statuses);
};
