/**
 * in-reply-to のチェーンを表す
 * 
 * status は Status もしくは Status ID
 */
tw.ConversationTimeline = function(store, status, options){
    var statusId = status.id || status;
    tw.Timeline.call(this, store, "/conversations/" + statusId, options);

    this.store_.getStatus(statusId,
			  util.concat(util.bind(this, this.onGetOld),
				      util.bind(this, this.onGetNew)));
};

util.extend(tw.ConversationTimeline, tw.Timeline);

// override
tw.ConversationTimeline.prototype.refresh = function(){
    // 何もしない
};

// ----------------------------------------------------------------------
// private

/**
 * 過去方向への言及を遡る
 * 
 * status に起点となる Status を指定する。
 */
tw.ConversationTimeline.prototype.onGetOld = function(status){
    console.log("ConversationTimeline onGetOld");

    this.insert([status]);

    if(!status.in_reply_to_status_id){
	return;
    }

    if(status.retweeted_status){
	status = status.retweeted_status;
    }

    var nextId = status.in_reply_to_status_id;

    if(tw.store.hasStatus(nextId)){
	console.debug("ConversationTimeline: use cache");
	this.store_.getStatus(nextId, util.bind(this, this.onGetOld));
    }
    else{
	var userTimeline = tw.store.userTimeline(status.in_reply_to_screen_name);
	var t = userTimeline.loadNext({statusId: nextId});
	t.success(util.bind(this, this.onGetOldTimeline, nextId));
    }
};

/**
 * 過去方向への言及を遡るための TL の読み込み完了
 */
tw.ConversationTimeline.prototype.onGetOldTimeline = function(statusId){
    console.log("ConversationTimeline onGetOldTimeline", statusId);

    var status = tw.store.hasStatus(statusId);
    if(!status){
	console.error("TL に Status が存在しません");
	return;
    }

    this.onGetOld(status);
};

/**
 * 未来方向への言及を遡る
 */
tw.ConversationTimeline.prototype.onGetNew = function(status){
    console.log("ConversationTimeline onGetNew");

    if(status.replies){
	for(var i in status.replies){
	    this.store_.getStatus(i, util.bind(this, this.onGetNew));
	}
    }

    this.insert([status]);
};
