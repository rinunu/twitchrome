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
 */
tw.ConversationTimeline.prototype.onGetOld = function(status){
    console.log("ConversationTimeline onGetOld");

    this.insert([status]);

    if(status.retweeted_status){
	status = status.retweeted_status;
    }

    if(status.in_reply_to_status_id){
	this.store_.getStatus(status.in_reply_to_status_id,
			   util.bind(this, this.onGetOld));
    }
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
