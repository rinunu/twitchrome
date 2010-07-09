
/**
 * Ajax 処理を行う
 * 
 * 通常の Ajax 処理に加え、以下の処理を行う
 * - 再送
 * - リクエスト数制限
 *   基本は1リクエスト毎。
 * 
 * options = {
 *   // コマンドを実行前に呼び出される。 コマンドの調整を行う際に使用する。
 *   adjustCommand: function(command),
 * }
 * 
 * イベント
 * - start(command)
 * - success(command)
 * - error(command)
 */
tw.Ajax = function(options){
    this.options = $.extend({}, options);

    // 万が一処理が JavaScript エラーが起きたとしても処理を継続するために、
    // setTimeout ではなく setInterval を使用する。
    setInterval(util.bind(this, this.onInterval), 1 * 1000);

    // 実行中の Command
    this.executing = null;

    // 実行待ち Command。 優先度の降順。
    this.commands_ = [];
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
 *   maxTryCount: 最大リトライ回数。 デフォルトは 1,
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
	if(this.options.adjustCommand){
	    command = this.options.adjustCommand(command);
	}

	command = $.extend(
	    {
		priority: 1,
		maxTryCount: 1,
		method: "GET",
		errors: []
	    }, command);

	this.commands_.push(command);
    }
    
    return command;
};

/**
 * 指定された name を持つ command を取得する
 * 
 * 存在しない場合は null
 */
tw.Ajax.prototype.command = function(name){
    for(var i = 0; i < this.commands_.length; i++){
	var command = this.commands_[i];
	if(command.name == name){
	    return command;
	}
    }
    return null;
};

tw.Ajax.prototype.commands = function(){
    return this.commands_;
};

// ----------------------------------------------------------------------

tw.Ajax.prototype.execute = function(command){
    console.log("ajax", command.name, command);
    $.ajax(
	{
	    type: command.method,
	    url: command.url,
	    data: command.params || {},
	    dataType: command.dataType || "json",
	    success: util.bind(this, this.onSuccess, command),
	    error: util.bind(this, this.onError, command)
	});
    this.executing = command;
    util.Event.trigger(this, "start", command);
};

/**
 * 処理する command があるなら、それを実行する
 */
tw.Ajax.prototype.onInterval = function(){
    if(this.executing || this.commands_.length == 0){
	return;
    }

    // priority の昇順
    this.commands_.sort(function(a, b){return a.priority - b.priority;});

    var command = this.commands_[0];
    // TODO ここでリトライ判定
    
    this.execute(command);
};

tw.Ajax.prototype.onSuccess = function(command, result){
    if(!result){ // 失敗なのに onSuccess が呼ばれる場合があるため
	this.onError(command);
	return;
    }
    console.log("ajax success", command.name);
    
    this.commands_.shift();
    this.executing = null;

    util.Event.trigger(this, "success", command);
    command.callback(result);
};

tw.Ajax.prototype.onError = function(command, xhr){
    command.errors.push(xhr);
    this.executing = null;
    if(command.errors.length >= command.maxTryCount){
	console.error("ajax error", command.name);
	this.commands_.shift();
	if(command.error){
	    command.error();
	}
	util.Event.trigger(this, "error", command);
    }else{
	console.error("ajax error retry", command.name, command);
    }
};
