
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
 * TWitter REST API へ GET リクエストを行う。
 */
tw.Twitter.prototype.get = function(request){
    var command = new tw.TwitterGetCommand2(request);
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
 * (サーバでは URL の生成のみ行ない、ツイートデータは JSONP で取得する)
 */
tw.TwitterGetCommand = function(request, options){
    tw.Command.call(this, options);
    
    this.url_ = request.url;
    this.request_ = request;
    this.callbackName = "twCallback";
};

util.extend(tw.TwitterGetCommand, tw.Command);

tw.TwitterGetCommand.prototype.execute = function(){
    // URI を生成する
    var request = {
	name: this.request_.name + " - URL 生成",
	dataType : "json",
	url : "/sign" + this.url_,
	callback : util.bind(this, this.onTwitterApiUrl),
	params: this.request_.params || {}
    };
    request.params.callback = this.callbackName;

    tw.ajax.ajax(request);
};

tw.TwitterGetCommand.prototype.onTwitterApiUrl = function(result){
    console.log("success", result);

    var this_ = this;
    var callback = this.request_.callback;
    // jsonp を指定せず、 cache を無効にするのは、余計なパラメータを付加させないため
    var request = {
	name: this.request_.name,
	url: result.url,
	dataType: "jsonp",
	jsonpCallback: this.callbackName,
	callback: function(){
	    callback.apply(this, arguments);
	    this_.onSuccess();
	},
	cache: true
    };

    tw.ajax.ajax(request);
};


// ######################################################################

/**
 * Twitter への GET リクエストを行うコマンド(サーバ経由)
 */
tw.TwitterGetCommand2 = function(request, options){
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
util.extend(tw.TwitterGetCommand2, tw.Command);

tw.TwitterGetCommand2.prototype.execute = function(){
    tw.ajax.ajax(this.request_);
};
