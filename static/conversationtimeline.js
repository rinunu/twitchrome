/**
 * in-reply-to のチェーンを表す
 */
tw.ConversationTimeline = function(store, status){
    tw.List.call(this, store, "/conversations/" + status.id);
    this.status_ = status;
    this.onGet(status);
};

util.extend(tw.ConversationTimeline, tw.List);

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

    this.statuses_.push(status);
    
    this.addNew([status]);
};
