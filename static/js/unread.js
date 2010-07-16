
/**
 * 未読管理を行う
 * 
 * イベント
 * change(timeline)
 */
tw.Unread = function(){
    // 未読 Status の ID
    this.unreadIds_ = {};
    
    // この ID まではすべて既読とみなす(unreadIds 以外)
    // this.maxReadId_ = "0";
};

// ----------------------------------------------------------------------

/**
 * 既読にする
 */
tw.Unread.prototype.read = function(status){
    if(!this.unreadIds_[status.id]){
	return;
    }
    delete this.unreadIds_[status.id];
    this.refresh();
};

// ----------------------------------------------------------------------
// property

/**
 * 
 */
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
 * 未読管理している Timeline を取得する
 */
tw.Unread.prototype.managedTimelines = function(){
    return [tw.store.homeTimeline()];
};

// ----------------------------------------------------------------------

/**
 * 新規に Status が追加になった際に呼び出す
 */
tw.Unread.prototype.addStatuses = function(timeline, statuses){
    // todo statuses は追加されたもののみじゃないといけない。 更新は含んじゃダメ

    for(var i = 0, l = statuses.length; i < l; i++){
	var status = statuses[i];
	status.unread = true;
	this.unreadIds_[status.id] = true;
    }

    this.refresh();
};

// ----------------------------------------------------------------------
// private

/**
 * 未読件数を更新する
 */
tw.Unread.prototype.refresh = function(){
    var type = "unread.refresh";
    if(tw.commandManager.commands(type).length >= 1){
	return;
    }
    var command = new tw.SyncCommand(util.bind(this, this.refresh_), {type: type});
    tw.commandManager.add(command);
};

tw.Unread.prototype.refresh_ = function(){
    util.Event.trigger(this, "change");
};
