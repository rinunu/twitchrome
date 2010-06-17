
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
 * 
 * command: {type, name, url, params, callback, target: 操作対象}
 */
tw.Ajax.ajax = function(command){
    console.log("get", command.name);
    $.ajax(
	{
	    type: command.type,
	    url: command.url,
	    data: command.params || {},
	    dataType: "json",
	    success: util.bind(this, this.onSuccess, command),
	    error: util.bind(this, this.onError, command)
	});
};

tw.Ajax.onSuccess = function(command, result){
    console.log("ajax success", command);
    command.callback(result);
};

tw.Ajax.onError = function(command, xhr){
    console.error("ajax error", xhr);
    $.jGrowl("「" + command.name + "」に失敗しました");
};