
tw.Upload = function(){
};

tw.Upload.prototype.clear = function(){
};

/**
 * ファイルをアップロードする
 */
tw.Upload.prototype.upload = function(callback){
    var file = $(".status_input input[type='file']");
    var csrfToken = $("input[name='csrfmiddlewaretoken']").val();
    file.appendTo(".system");
    $('<input name="file" type="file">').appendTo("div.file");
    file.upload("/upload",
		{csrfmiddlewaretoken: csrfToken},
		util.bind(this, this.onUpload, callback),
		"json");
    // todo 送信後の削除
};

// ----------------------------------------------------------------------
// private

tw.Upload.prototype.onUpload = function(callback, json){
    console.log("onUpload", json);
};

tw.Upload.prototype.deleteFile = function(){
};

/**
 *
 */
tw.Upload.prototype.onChange = function(file){
};

/**
 *
 */
tw.Upload.prototype.onComplete = function(file, response){
    
};
