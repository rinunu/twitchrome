
/**
 * URL の参照先のメディアを管理する
 * 
 * 処理は2つに分かれる
 * 
 * 1. URL 解析
 * 2. サムネイル URL とサイズの取得
 * 
 * 2. は場合によっては非同期に行う。この場合、準備ができた段階で statusRefresh イベントを発行する。
 * 
 * 2. まで処理したメディアの情報は uris_ = {uris: {uri, width, height}}に格納する。
 * 以後、この情報がある場合は 2の処理はスキップする。
 * 
 * 2. の処理を行う場合、 3つのタイプに、分かれる
 * 1. すべて静的に処理する
 * 2. サムネイル URL は静的に、サイズは画像を読み込んで取得する
 * 3. サムネイル URL とサイズともにサーバで取得する
 * 
 * サーバに問い合わせを行う場合、なるべく一度の問い合わせで行う。
 * 
 * イベント
 * refresh(uri): URI の情報が更新された際に通知する
 */
tw.UriManager = function(){
    this.uris_ = {};
};

tw.UriManager.uriTypes = [];

/**
 * 指定された URI の情報を取得する
 * 
 * メディアではない場合は null を返す。
 * 読み込みが必要な場合、 return.loading == true となっている。
 */
tw.UriManager.prototype.info = function(uri){
    var info = this.uris_[uri];
    if(info){
	return info;
    }

    for(var i = 0, l = tw.UriManager.uriTypes.length; i < l; i++){
	var type = tw.UriManager.uriTypes[i];
	info = type.info(uri, this);
	if(info){
	    this.uris_[uri] = info;
	    return info;
	}
    }
    return null;
};

// ----------------------------------------------------------------------
// private

tw.UriManager.prototype.triggerRefresh = function(uri){
    util.Event.trigger(this, "refresh", uri);
};

// ----------------------------------------------------------------------
// uri types

tw.UriManager.uriTypes.push(
    {
	re: /^http:\/\/twitpic.com\/(\w+)/,
	info: function(uri){
	    var m = this.re.exec(uri);
	    if(!m){
		return null;
	    }
	    return {
		media: {
		    uri: "http://twitpic.com/show/thumb/" + m[1] + ".jpg",
		    width: "150",
		    height: "150"}};
	}
    });

tw.UriManager.uriTypes.push(
    {
	re: /^http:\/\/p.twipple.jp\/(\w+)/,
	re2: /\w/g,
	info: function(uri, manager){
	    var m = this.re.exec(uri);
	    if(!m){
		return null;
	    }

	    var info = {
		loading: true,
		media: {
		    uri: "http://p.twipple.jp/data" + 
			m[1].replace(this.re2, "/$&") + "_s.jpg"
		}};

	    var image = new Image();
	    $(image).load(
		function(){
		    info.loading = false;
		    info.media.width = image.width;
		    info.media.height = image.height;
		    manager.triggerRefresh(uri);
		});
	    console.log("loading", info.media.uri);
	    image.src = info.media.uri;

	    return info;
	}
    });
