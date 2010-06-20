
/**
 * Ajax 処理を行う
 * 
 * 通常の Ajax 処理に加え、以下の処理を行う
 * - 再送
 * - (サーバの都合により、1度に1リクエストのみ処理する。)
 * 
 * イベント
 * - start(command)
 * - success(command)
 * - error(command)
 */
tw.Ajax = function(){
    // 万が一処理が JavaScript エラーが起きたとしても処理を継続するために、
    // setTimeout ではなく setInterval を使用する。
    setInterval(util.bind(this, this.onInterval), 1 * 1000);

    this.executing = false;

    // 実行待ち Command。 優先度の降順。
    this.commands = [];
};

/**
 * command: {
 *   type,
 *   name: 処理の名称を渡す(ID およびエラー表示に使用する),
 *   url,
 *   params,
 *   callback,
 *   target: 操作対象,
 *   maxRetry: 最大再送回数
 * }
 */
tw.Ajax.prototype.ajax = function(command){
    command.retryCount = 0;
    this.commands.push(command);
};

/**
 * 指定された name を持つ command を取得する
 * 
 * 存在しない場合は null
 * 
 * 動作未確認 
 */
tw.Ajax.prototype.command = function(name){
    for(var i = 0; i < this.commands.length; i++){
	var command = this.commands[0];
	if(command.name == name){
	    return command;
	}
    }
    return null;
};

// ----------------------------------------------------------------------

tw.Ajax.prototype.execute = function(command){
    console.log("ajax", command.name);
    $.ajax(
	{
	    type: command.type || "GET",
	    url: command.url,
	    data: command.params || {},
	    dataType: "json",
	    success: util.bind(this, this.onSuccess, command),
	    error: util.bind(this, this.onError, command)
	});
    this.executing = true;
};

/**
 * 処理する command があるなら、それを実行する
 */
tw.Ajax.prototype.onInterval = function(){
    if(this.executing || this.commands.length == 0){
	return;
    }
    var command = this.commands[0];
    // TODO ここでリトライ判定
    
    this.execute(command);
};

tw.Ajax.prototype.onSuccess = function(command, result){
    console.log("ajax success", command.name);
    command.callback(result);
    this.commands.shift();
    this.executing = false;
};

tw.Ajax.prototype.onError = function(command, xhr){
    console.error("ajax error", command.name);
    this.commands.shift();
    this.executing = false;
};
