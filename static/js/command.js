
/**
 * execute: 成功時は this.onSuccess を呼び出すこと
 */
tw.Command = function(execute){
    this.execute = execute;
};

/**
 * 成功時のコールバックを登録する
 */
tw.Command.prototype.success = function(success){
    if(this.success_){
	this.success_ = util.concat(this.success_, success);
    }else{
	this.success_ = success;
    }
};

/**
 * 失敗時のコールバックを登録する
 */
tw.Command.prototype.error = function(error){
    if(this.error_){
	this.error_ = util.concat(this.error_, error);
    }else{
	this.error_ = error;
    }
};

tw.Command.prototype.onSuccess = function(){
    if(this.success_){
	this.success_.apply(this, arguments);
    }
};

tw.Command.prototype.onError = function(){
    if(this.error_){
	this.error_.apply(this, arguments);
    }
};

// ----------------------------------------------------------------------
// 

