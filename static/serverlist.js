
/**
 * 含まれる Status をサーバが管理する List
 */
tw.ServerList = function(url){
    this.url_ = url;
    this.statuses_ = [];

    // 最終更新時間
    this.updatedAt_ = null;

    // 最後の refresh 時に追加になった件数
    this.newCount_ = 0;
};

util.extend(tw.ServerList, tw.List);

/**
 * サーバと通信し、リストの内容を最新にする
 * 取得する件数は count で指定する
 */
tw.ServerList.prototype.refresh = function(count){
    var params = {};
    if(this.statuses_.length >=1){
	params.since_id = this.statuses_[0].id;
    }
    params.count = count || 20;

    console.log("refresh", this.url_);
    $.getJSON("/twitter_api" + this.url_, params, util.bind(this, this.onRefresh));
};

tw.ServerList.prototype.statuses = function(){
    return this.statuses_;
};

tw.ServerList.prototype.newCount = function(){
    return this.newCount_;
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
// private

tw.ServerList.prototype.onRefresh = function(json){
    console.log("on refresh");
    this.statuses_ = json.concat(this.statuses_);
    this.newCount_ = json.length;
    this.updatedAt_ = new Date;
    util.Event.trigger(this, "refresh");
};
