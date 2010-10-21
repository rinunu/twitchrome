
/**
 * Command の管理を行う
 * 
 * - todo 指定時間後に実行する
 * - todo 定期的に実行する
 * - todo アイドル時に実行する
 */
tw.CommandManager = function(){
    // 万が一処理が JavaScript エラーが起きたとしても処理を継続するために、
    // setTimeout ではなく setInterval を使用する。
    setInterval(util.bind(this, this.onInterval), 1 * 200);

    this.commands_ = [];
};

tw.CommandManager.prototype.add = function(command){
    this.commands_.push(command);
    command.success(util.bind(this, this.onSuccess, command));
    command.error(util.bind(this, this.onError, command));
};

/**
 * 指定した Command を取得する
 */
tw.CommandManager.prototype.commands = function(selector){
    if($.isFunction(selector)){
	var f = selector;
    }else{
	var f = function(command){
	    return command.type === selector;
	};
    }

    var result = [];
    for(var i = 0, l = this.commands_.length; i < l; i++){
	var command = this.commands_[i];
	if(f(command)){
	    result.push(command);
	}
    }
    return result;
};


// ----------------------------------------------------------------------

tw.CommandManager.prototype.onSuccess = function(command){
    // console.debug("CommandManager onSuccess", command.type);
};

tw.CommandManager.prototype.onError = function(command){
    // console.debug("CommandManager onError", command.type);
    command.errors.push({});
    this.executing = null;
    if(command.errors.length >= command.maxTryCount){
	console.error("command error", command.name, xhr);
	this.commands_.shift();
	if(command.error){
	    command.error();
	}
	util.Event.trigger(this, "error", command);
    }else{
	console.error("command error retry", command.name, command);
    }
};

/*
 * 処理する command があるなら、それを実行する
 */
tw.CommandManager.prototype.onInterval = function(){
    if(this.commands_.length == 0){
    	return;
    }
    var command = this.commands_.shift();
    command.execute();
};
