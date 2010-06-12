
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
    this.statuses_ = [];
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

/**
 * 指定されたステータスより新しい Status を列挙する
 * 列挙順は古い順
 */
tw.List.prototype.eachNew = function(fn, origin){
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
