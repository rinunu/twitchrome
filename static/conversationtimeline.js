/**
 * in-reply-to のチェーンを表す
 * 
 * status は Status もしくは Status ID
 */
tw.ConversationTimeline = function(store, status, options){
    var statusId = status.id || status;
    tw.Timeline.call(this, store, "/conversations/" + statusId, options);

    this.store_.getStatus(statusId,
			  util.bind(this, this.onGet));
};

util.extend(tw.ConversationTimeline, tw.Timeline);

// override
tw.ConversationTimeline.prototype.refresh = function(){
    // 何もしない
};

// ----------------------------------------------------------------------
// private

tw.ConversationTimeline.prototype.onGet = function(status){
    console.log("ConversationTimeline onGet", this.statuses_);

    if(status.in_reply_to_status_id){
	this.store_.getStatus(status.in_reply_to_status_id,
			   util.bind(this, this.onGet));
    }

    this.insert([status]);
};
