
/**
 * 未読管理を行う
 * 
 * イベント
 * change
 */
tw.Unread = function(){
    // 未読 Status の ID
    this.unreadIds_ = {};
    
    // この ID まではすべて既読とみなす(unreadIds 以外)
    this.maxReadId_ = "0";
};

/**
 * 未読か判定する
 */
tw.Unread.prototype.unread = function(status){
};

/**
 * 未読・既読を設定する
 */
tw.Unread.prototype.setUnread = function(status, unread){
};

tw.Unread.prototype.unreadCount = function(timeline){
    var statuses = timeline.statuses();
    var result = 0;
    for(var i = 0, l = statuses.length; i < l; i++){
	if(this.unreadIds_[statuses[i].id]){
	    result++;
	}
    }
    return result;
};

/**
 * 新規に Status が追加になった際に呼び出す
 */
tw.Unread.prototype.addStatuses = function(timeline, statuses){
    // todo statuses は追加されたもののみじゃないといけない。 更新は含んじゃダメ

    for(var i = 0, l = statuses.length; i < l; i++){
	var status = statuses[i];
	status.unread = true;
	this.unreadIds_[status.id] = true;
	// if(status.id > this.maxReadId_){
	// }
    }
};

// ----------------------------------------------------------------------

