
/**
 * Ajax 処理を行う
 * 
 * 通常の Ajax 処理に加え、以下の処理を行う
 * - 再送
 * - エラー通知
 * - 定期更新
 */
tw.Ajax = function(){
    this.autoRefreshList = [];
    setInterval(util.bind(this, this.refresh), 10 * 1000);
};

/**
 * command: {
 *   type, 
 *   name: 処理の名称を渡す(エラー表示に使用する),
 *   url,
 *   params,
 *   callback,
 *   target: 操作対象}
 */
tw.Ajax.prototype.ajax = function(command){
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

/**
 * 自動更新対象として登録する
 * 
 * object は interval(), refresh(), updatedAt() を持っている必要がある
 */
tw.Ajax.prototype.addAutoRefresh = function(object){
    this.autoRefreshList.push(object);
};

tw.Ajax.prototype.refresh = function(){
    for(var i = 0; i < this.autoRefreshList.length; i++){
        var o = this.autoRefreshList[i];
	var nextRefresh = new Date(o.interval() + o.updatedAt().getTime());
	if(new Date() >= nextRefresh){
	    o.refresh();
	    break; // 1度に更新するのはひとつだけ
	}
    }
};

tw.Ajax.prototype.onSuccess = function(command, result){
    console.log("ajax success", command);
    command.callback(result);
};

tw.Ajax.prototype.onError = function(command, xhr){
    console.error("ajax error", xhr);
    $.jGrowl("「" + command.name + "」に失敗しました");
};

