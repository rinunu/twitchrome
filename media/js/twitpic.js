
/**
 * Twitpic 操作
 */
tw.Twitpic = function(){
};

tw.Twitpic.upload = function(file, message){
    var command = new tw.AsyncCommand(
	function(){
	    file.upload("/upload",
			{
			    csrfmiddlewaretoken: tw.csrfToken,
			    message: message
			},
			util.bind(this, this.onUpload),
			"json");
	});
    command.onUpload = function(result){
	console.log("onUpload", result);
	if(result.url){
	    console.log("onUpload2", result.url);
	    this.onSuccess(result);
	}else{
	    var this_ = this;
	    console.log("画像のアップロードに失敗しました");
	    setTimeout(
		function(){
		    // 失敗時、本当は成功していないか確認する(タイムアウトしただけの場合)
		    tw.ajax.ajax(
			{
			    type: "twitpicShowUser",
			    name: "Twitpic ユーザ情報取得",
			    url: "/proxy/api.twitpic.com/2/users/show.json",
			    params: {username: tw.screenName},
			    callback: util.bind(this_, this_.onShowUser),
			    error: util.bind(this_, this_.onError)
			});
		}, 5000);
	}
    };

    command.onShowUser = function(result){
	console.log("onShowUser", result, file);

	if(result.images &&
	   result.images[0] &&
	   file[0].files && 
	   result.images[0].size == file[0].files[0].size){
	    console.log("同サイズの画像のアップロードが完了しているため、成功と判断しました");
	    var image = result.images[0];
	    image.url = "http://twitpic.com/" + image.short_id;
	    this.onSuccess(image);
	}else{
	    this.onError();
	}
    };

    command.execute();
    return command;
};