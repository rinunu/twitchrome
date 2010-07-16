
/**
 * コマンド(管理すべき処理)を表す
 * 
 * 管理とは以下のような扱いのことを言う
 * - 遅延して実行する
 * - 定期的に実行する
 * - 非同期実行
 * 
 * プロパティ
 * - type: コマンドの種別
 * 
 * options: {type}
 */
tw.Command = function(options){
    options = options || {};
    this.type = options.type;
};

// ----------------------------------------------------------------------
// Command 使用側インタフェース

/**
 * 実行可能か
 */
tw.Command.prototype.canExecute = function(){
    return true;
};

/**
 * 実行
 * 
 * 成功時は this.onSuccess, 失敗時は this.onError を呼び出すこと
 * 
 */
tw.Command.prototype.execute = function(){
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

// ----------------------------------------------------------------------
// Command 実装側インタフェース

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

// ======================================================================
// 

/**
 * 同期実行 Command
 */
tw.SyncCommand = function(execute, options){
    tw.Command.call(this, options);
    this.execute_ = execute;
};

util.extend(tw.SyncCommand, tw.Command);

tw.SyncCommand.prototype.execute = function(){
    this.execute_();
    this.onSuccess();
};

// ======================================================================

/**
 * 非同期実行 Command
 */
tw.AsyncCommand = function(execute, options){
    tw.Command.call(this, options);
    this.execute = execute;
};

util.extend(tw.AsyncCommand, tw.Command);
