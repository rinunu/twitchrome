
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
 * ajax 処理にて command を実行する
 * 
 * command: {
 *   type: リクエストのタイプを表す任意の文字列,
 *   method: デフォルトは GET,
 *   name: 処理の名称を渡す(ID およびエラー表示に使用する)。 必須,
 *   url : 必須,
 *   params: ,
 *   callback:,
 *   priority: 0 が最も高い。 デフォルトは 1
 * }
 * 
 * 同じ name の GET command が存在する場合、1つにまとめる
 * 
 * command は Ajax によって変更/別の command と統合される場合がある。
 * 戻り値で新しい command を返す。
 */
tw.Ajax.prototype.ajax = function(command){
    var other = this.command(command.name);
    if(other && other.method == "GET"){
	console.log("ajax", "処理をまとめました", command.name);
	other.callback = util.concat(other.callback, command.callback);
	command = other;
    }else{
	command.method = command.method || "GET";
	command.retryCount = 0;
	this.commands.push(command);
    }
    
    return command;
};

/**
 * 指定された name を持つ command を取得する
 * 
 * 存在しない場合は null
 */
tw.Ajax.prototype.command = function(name){
    for(var i = 0; i < this.commands.length; i++){
	var command = this.commands[i];
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
	    type: command.method,
	    url: command.url,
	    data: command.params || {},
	    dataType: command.dataType || "json",
	    success: util.bind(this, this.onSuccess, command),
	    error: util.bind(this, this.onError, command)
	});
    this.executing = true;
    util.Event.trigger(this, "start", command);
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
    if(!result){ // 失敗なのに onSuccess が呼ばれる場合があるため
	this.onError(command);
	return;
    }
    console.log("ajax success", command.name);
    
    this.commands.shift();
    this.executing = false;

    util.Event.trigger(this, "success", command);
    command.callback(result);
};

tw.Ajax.prototype.onError = function(command, xhr){
    console.error("ajax error", command.name);
    this.commands.shift();
    this.executing = false;

    util.Event.trigger(this, "error", command);
};
