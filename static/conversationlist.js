/**
 * 
 */
tw.ConversationTl = function(status){
    this.status_ = status;
    this.statuses_ = [];
};

util.extend(tw.ServerList, tw.List);

tw.ServerList.prototype.statuses = function(){
    return this.statuses_;
};

tw.ServerList.prototype.newCount = function(){
    // TODO
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

tw.ServerList.prototype.onGet = function(json){
    console.log("on refresh");
    this.statuses_ = this.toStatuses(json).concat(this.statuses_);
    this.updatedAt_ = new Date;
    util.Event.trigger(this, "refresh");
};
