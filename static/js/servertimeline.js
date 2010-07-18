
/**
 * Twitter サーバが管理する Timeline
 */
tw.ServerTimeline = function(store, uri, options){
    tw.Timeline.call(this, store, uri, options);

    this.hasSinceId_ = options.hasSinceId;
    this.hasMaxId_ = options.hasMaxId;
    this.countParam_ = options.countParam;
};

util.extend(tw.ServerTimeline, tw.Timeline);

tw.ServerTimeline.prototype.refresh = function(options){
    options = $.extend({count: tw.settings.refreshCount, force: false}, options);
    var request = {
	type: "refreshTimeline",
	url: "/twitter_api" + this.uri_ + ".json",
	params: {}, 
	callback: util.bind(this, this.onRefresh)
    };
    this.setCommonParams(request, options);
    this.setRefreshParams(request, options);
    return this.load(request, options);
};

tw.ServerTimeline.prototype.loadNext = function(options){
    options = $.extend({count: tw.settings.refreshCount, force: true}, options);
    var request = {
	type: "timeline.loadNext",
	url: "/twitter_api" + this.uri_ + ".json",
	params: {},
	callback: util.bind(this, this.onLoadNext)
    };
    this.setCommonParams(request, options);
    this.setLoadNextParams(request, options);
    return this.load(request, options);
};

// ----------------------------------------------------------------------
// protected

/**
 * サーバリクエスト時の共通パラメータを調整するために呼び出される
 */
tw.ServerTimeline.prototype.setCommonParams = function(request, options){
    if(this.countParam_){
	request.params[this.countParam_] = options.count;
    }

    request.params.include_entities = true;
    request.params.include_rts = true;
};

/**
 * refresh 時のパラメータを調整するために呼び出される
 */
tw.ServerTimeline.prototype.setRefreshParams = function(request, options){
    if(this.hasSinceId_){
	if(this.refreshedAt_ && this.statuses_.length >= 1){
	    // refreshedAt_ もチェックするのは、初回表示時にも length => 1 になる場合があるため
	    request.params.since_id = this.statuses_[0].id;
	}
    }
};

/**
 * loadNext 時のパラメータを調整するために呼び出される
 */
tw.ServerTimeline.prototype.setLoadNextParams = function(request, options){
    console.assert(this.statuses_.length >= 1);

    if(this.hasMaxId_){
	if(options.status){
	    request.params.max_id = options.status.id;
	}else{
	    request.params.max_id = this.statuses_[this.statuses_.length - 1].id;
	}
    }
};

/**
 * サーバから取得した json を Statuses のリストに変換する
 */
tw.ServerTimeline.prototype.toStatuses = function(json){
    return json;
};

// ----------------------------------------------------------------------
// private

/**
 * refresh 完了時に呼び出される
 */
tw.ServerTimeline.prototype.onRefresh = function(json){
    var newStatuses = this.toStatuses(json);
    this.store_.addStatuses(this, newStatuses);
    this.insert(newStatuses);
    this.refreshedAt_ = new Date;
};

/**
 * loadNext 完了時に呼び出される
 */
tw.ServerTimeline.prototype.onLoadNext = function(json){
    var newStatuses = this.toStatuses(json);
    this.store_.addStatuses(this, newStatuses);
    this.insert(newStatuses);
};

/**
 * サーバからデータを取得する
 */
tw.ServerTimeline.prototype.load = function(request, options){
    var name = this.name_ + "の取得";

    if(this.refreshedAt_ && !options.force && 
       (new Date - this.refreshedAt_ < 30 * 1000)){
	console.log("頻繁なため無視しました", name, this.refreshedAt_);
	return null;
    }

    if(tw.ajax.command(name)){
	console.log("実行中のため無視しました: " + name);
	return null;
    }

    request.name = name;

    var command = new tw.AjaxCommand(request);
    tw.commandManager.add(command);
    return command;
};
