
/**
 * Ajax 処理を行う
 * 
 * 通常の Ajax 処理に加え、以下の処理を行う
 * - 再送
 * - エラー通知
 */
tw.Ajax = {
};

/**
 * name には処理の名称を渡す(エラー表示に使用する)
 */
tw.Ajax.get = function(name, url, params, callback){
    console.log("get", name);
    $.ajax(
	{
	    type: "GET",
	    url: url,
	    data: params,
	    dataType: "json",
	    success: callback,
	    error: util.bind(this, this.onError)
	});
};

/**
 * name には処理の名称を渡す(エラー表示に使用する)
 */
tw.Ajax.post = function(name, url, params, callback){
    console.log("post", name);
    $.ajax(
	{
	    type: "POST",
	    url: url,
	    data: params,
	    dataType: "json",
	    success: callback,
	    error: util.bind(this, this.onError)
	});
};

tw.Ajax.onError = function(xhr){
    console.error("ajax error", xhr);
    $.jGrowl("通信に失敗しました: " + xhr.statusText);
};