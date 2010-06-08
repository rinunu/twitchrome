
/**
 * Status のリストを表す
 *
 * 以下の情報を持つ
 * - リストに含まれる Status
 * - リストを取得した条件
 * - ユーザのリスト内での選択位置
 */
tw.List = function(){
    this.focus_ = null;
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
