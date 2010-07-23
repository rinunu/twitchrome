tw.Twitter = function(){
};

// ######################################################################
// 低レベル API

/**
 * TWitter API へ GET リクエストを行う。
 */
tw.Twitter.prototype.get = function(request){
    var command = new tw.TwitterGetCommand(request);
    tw.commandManager.add(command);
    return command;
};

// ######################################################################

/**
 * Twitter への GET リクエストを行うコマンド
 */
tw.TwitterGetCommand = function(request, options){
    tw.Command.call(this, options);

    request.url = "/twitter_api" + request.url;

    var this_ = this;
    var callback = request.callback;
    request.callback = function(){
	callback.apply(this, arguments);
	this_.onSuccess();
    };

    this.request_ = request;
};

util.extend(tw.TwitterGetCommand, tw.Command);

tw.TwitterGetCommand.prototype.execute = function(){
    tw.ajax.ajax(this.request_);
};
