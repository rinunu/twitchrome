
/**
 * /statuses で始まる Timeline と、同様の Timeline 用
 * 
 * リクエスト時に max_id, since_id を使うリソースで使用できる。
 */
tw.StatusesTimeline = function(store, uri, options){
    tw.Timeline.call(this, store, uri, options);

    // TL を読み込む際に使用するカーソル
    this.maxId_ = null;
    this.sinceId_ = null;
};

util.extend(tw.StatusesTimeline, tw.ServerTimeline);

// ----------------------------------------------------------------------
// override

tw.StatusesTimeline.prototype.setRefreshParams = function(params, options){
    params.count = options.count;
    params.include_entities = true;
    params.include_rts = true;

    if(this.sinceId_){
	params.since_id = this.sinceId_;
    }
};

tw.StatusesTimeline.prototype.onRefresh = function(){
    var statuses = tw.ServerTimeline.prototype.onRefresh.apply(this, arguments);
    if(statuses.length >= 1){
	this.sinceId_ = statuses[0].id;
    }
    return statuses;
};

// ----------------------------------------------------------------------
// private

