
/**
 * Twitter API を実行する
 * 
 * Status 取得 API などは、ここではなく Timeline や Store に定義する。
 */
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

/**
 * TWitter API へ POST リクエストを行う。
 */
tw.Twitter.prototype.post = function(request){
    request.method = "POST";
    request.url = "/twitter_api" + request.url;

    var command = new tw.AjaxCommand(request);
    tw.commandManager.add(command);
    return command;
};

// ######################################################################
// 高レベル API

/**
 * 自分の status を更新する
 * inReplyTo は status の先頭に「@対象ユーザ 」という文字が入っている場合のみ有効。
 * 
 * file にはアップロードする <input> を指定する
 */
tw.Twitter.prototype.update = function(text, inReplyTo, file){
    console.assert(text);

    var params = {
	status: text
    };
    if(inReplyTo &&
       text.indexOf("@" + inReplyTo.user.screen_name + " ") == 0){
	console.log("in_reply_to", inReplyTo);
	params.in_reply_to_status_id = inReplyTo.id;
    }

    var command = new tw.AsyncCommand(
	function(){
	    if(file){
		var upload = tw.Twitpic.upload(file, text);
		upload.success(util.bind(this, this.onUpload));
		upload.error(util.bind(this, this.onError));
	    }else{
		this.update();
	    }
	});

    command.update = function(){
	tw.twitter.post(
	    {
		type: "update",
		name: "ツイート", 
		url: "/statuses/update.json",
		params: params,
		callback: util.bind(this, this.onUpdate),
		error: util.bind(this, this.onError)
	    });
    };

    command.onUpload = function(result){
	console.log("on upload");
	console.assert(result.url);
	params.status += " " + result.url;
	this.update();
    };

    command.onUpdate = function(result){
	this.onSuccess(result);
    };

    command.execute();
    return command;
};

/**
 * 公式 RT を行う
 */
tw.Twitter.prototype.retweet = function(status){
    console.log("retweet", status);

    tw.twitter.post(
	{
	    type: "retweet",
	    name: "リツイート",
	    url: "/statuses/retweet/" + status.id + ".json",
	    callback: function(){}
	});
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
