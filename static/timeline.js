
/**
 * Status のリストを表す
 *
 * 以下の情報を持つ
 * - リストに含まれる Status
 * - ユーザのリスト内での選択位置
 * - リストを識別する URI
 * 
 * イベント
 * refresh(newStatuses):
 *   更新された際に通知する。newStatuses は作成日の降順に並んでいる
 */
tw.Timeline = function(store, uri){
    console.assert(uri);
    this.focus_ = null;
    this.statuses_ = [];
    this.store_ = store;
    this.uri_ = uri;

    // 最終更新時間
    this.updatedAt_ = new Date("1999/01/01");
};

tw.Timeline.prototype.uri = function(){
    return this.uri_;
};

tw.Timeline.prototype.updatedAt = function(){
    return this.updatedAt_;
};

/**
 * フォーカスされている Status を取得する
 */
tw.Timeline.prototype.focus = function(){
    return this.focus_;
};

/**
 * フォーカスされている Status を取得する
 */
tw.Timeline.prototype.setFocus = function(focus){
    this.focus_ = focus;
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
