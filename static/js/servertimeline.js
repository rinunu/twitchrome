
/**
 * Twitter サーバが管理する Timeline
 */
tw.ServerTimeline = function(store, uri, options){
    tw.Timeline.call(this, store, uri, options);
};

util.extend(tw.ServerTimeline, tw.Timeline);

tw.ServerTimeline.prototype.refresh = function(options){
    options = $.extend({count: tw.settings.refreshCount, force: false}, options);
    var name = this.name_ + "の取得";
    
    if(this.refreshedAt_ && !options.force && 
       (new Date - this.refreshedAt_ < 30 * 1000)){
	console.log("頻繁なため無視しました", name, this.refreshedAt_);
	return;
    }
    if(tw.ajax.command(name)){
	console.log("実行中のため無視しました: " + name);
	return;
    }

    var params = {
    };
    this.setCommonParams(params, options);
    this.setRefreshParams(params, options);

    var command = {
	type: "refreshTimeline",
	name: name,
	url: "/twitter_api" + this.uri_ + ".json",
	params: params, 
	callback: util.bind(this, this.onRefresh)
    };

    this.request(command);
};

tw.ServerTimeline.prototype.loadNext = function(options){
    options = $.extend({count: tw.settings.refreshCount, force: false}, options);
    var name = this.name_ + "の次を取得";
    
    if(tw.ajax.command(name)){
	console.log("実行中のため無視しました: " + name);
	return;
    }

    var params = {
    };
    this.setCommonParams(params, options);
    this.setLoadNextParams(params, options);

    var command = {
	type: "loadNextTimeline",
	name: name,
	url: "/twitter_api" + this.uri_ + ".json",
	params: params, 
	callback: util.bind(this, this.onLoadNext)
    };

    this.request(command);
};

tw.ServerTimeline.prototype.newCount = function(){
    // TODO
};

// ----------------------------------------------------------------------
// protected

/**
 * サーバへリクエストを送信する
 */
tw.ServerTimeline.prototype.request = function(command, options){
    tw.ajax.ajax(command);
};

/**
 * サーバリクエスト時の共通パラメータを調整するために呼び出される
 */
tw.ServerTimeline.prototype.setCommonParams = function(params, options){
};

/**
 * refresh 時のパラメータを調整するために呼び出される
 */
tw.ServerTimeline.prototype.setRefreshParams = function(params, options){
};

/**
 * loadNext 時のパラメータを調整するために呼び出される
 */
tw.ServerTimeline.prototype.setLoadNextParams = function(params, options){
};

/**
 * サーバから取得した json を Statuses のリストに変換する
 */
tw.ServerTimeline.prototype.toStatuses = function(json){
    return json;
};

/**
 * refresh 完了時に呼び出される
 * 
 * 取得した Status[] を返す
 */
tw.ServerTimeline.prototype.onRefresh = function(json){
    var newStatuses = this.toStatuses(json);
    this.store_.addStatuses(this, newStatuses);
    this.insert(newStatuses);
    this.refreshedAt_ = new Date;
    return newStatuses;
};

/**
 * loadNext 完了時に呼び出される
 * 
 * 取得した Status[] を返す
 */
tw.ServerTimeline.prototype.onLoadNext = function(json){
    var newStatuses = this.toStatuses(json);
    this.store_.addStatuses(this, newStatuses);
    this.insert(newStatuses);
    return newStatuses;
};

// ----------------------------------------------------------------------
// private

