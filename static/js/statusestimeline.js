
/**
 * /statuses で始まる Timeline と、同様の Timeline 用
 * 
 * リクエスト時に max_id, since_id を使うリソースで使用できる。
 */
tw.StatusesTimeline = function(store, uri, options){
    tw.Timeline.call(this, store, uri, options);
};

util.extend(tw.StatusesTimeline, tw.ServerTimeline);

// ----------------------------------------------------------------------
// override

tw.StatusesTimeline.prototype.setCommonParams = function(request, options){
    request.params.count = options.count;
    request.params.include_entities = true;
    request.params.include_rts = true;
};

tw.StatusesTimeline.prototype.setRefreshParams = function(request, options){
    if(this.refreshedAt_ && this.statuses_.length >= 1){
	// refreshedAt_ もチェックするのは、初回表示時にも length => 1 になる場合があるため
	request.params.since_id = this.statuses_[0].id;
    }
};

tw.StatusesTimeline.prototype.setLoadNextParams = function(request, options){
    console.assert(this.statuses_.length >= 1);
    request.params.max_id = this.statuses_[this.statuses_.length - 1].id;
};

// ----------------------------------------------------------------------
// private

