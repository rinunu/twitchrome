
/**
 * リスト用の Timeline
 *
 * options: {
 *   raw: Twitter API のリスト情報
 * }
 */
tw.List = function(store, fullName, options){
    this.raw_ = options.raw;

    var a = tw.List.parseName(fullName);
    this.fullName_ = fullName;
    this.screenName_ = a[0];
    this.shortName_ = a[1];

    options.name = fullName + " リスト";

    tw.ServerTimeline.call(this, store, tw.List.uri(fullName), options);
};

util.extend(tw.List, tw.ServerTimeline);

/**
 * 本 Timeline を表す uri を生成する
 */
tw.List.uri = function(fullName){
    var a = this.parseName(fullName);
    return "/" + a[0] + "/lists/" + a[1] + "/statuses";
};

/**
 * リスト名をパースして、各要素に分解する
 * 
 * 結果は [screenName, shortName]
 */
tw.List.parseName = function(fullName){
    var m = /@([\w-]+)\/([\w-]+)$/.exec(fullName);
    if(!m){
	throw "不正なリスト名です";
    }
    return [m[1], m[2]];
};

// ----------------------------------------------------------------------
// property

tw.List.prototype.shortName = function(){
    return this.shortName_;
};

tw.List.prototype.fullName = function(){
    return this.fullName_;
};

tw.List.prototype.screenName = function(){
    return this.screenName_;
};

// ----------------------------------------------------------------------
// override

tw.List.prototype.setRefreshParams = function(params){
    params.per_page = tw.settings.refreshCount;

    tw.ServerTimeline.prototype.setRefreshParams.apply(this, arguments);
};

