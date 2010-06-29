
tw.Upload = function(){
    this.upload_ = new AjaxUpload(
	$("a.file"), {
	    action: 'upload.php',
	    name: 'file',
	    data: {
		example_key1 : 'example_value'
	    },
	    autoSubmit: false,
	    responseType: "json",
	    onChange: util.bind(this, this.onChange),
	    onComplete: util.bind(this, this.onComplete)
	});

    $(".delete_file").click(util.bind(this, this.deleteFile));
};

tw.Upload.prototype.clear = function(){
    this.deleteFile();
};

/**
 * ファイルをアップロードする
 */
tw.Upload.prototype.upload = function(callback){
    
};

// ----------------------------------------------------------------------
// private

tw.Upload.prototype.deleteFile = function(){
    $(".file_name").hide();
    $(".delete_file").hide();
    $("input[name='file']").val("");

    $("a.file").show();
};

/**
 *
 */
tw.Upload.prototype.onChange = function(file){
    console.log("test");
    $(".file_name").text(file);
    $(".file_name").show();
    $(".delete_file").show();
    $("a.file").hide();
};

/**
 *
 */
tw.Upload.prototype.onComplete = function(file, response){
    
};
