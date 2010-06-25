
/**
 * 処理中の処理の情報を表示する
 */
tw.ProgressView = function(){
    this.element_ = $(".progress");
};

tw.ProgressView.prototype.clear = function(){
};

tw.ProgressView.prototype.initialize = function(){
    util.Event.bind(tw.ajax, this, {
			start: this.onStart,
			success: this.onSuccess,
			error: this.onError
		    });
};

// ----------------------------------------------------------------------
// private

/**
 *
 */
tw.ProgressView.prototype.onStart = function(source, eventType, command){
    this.element_.text(command.name);
    this.element_.removeClass("error");
    this.element_.addClass("active");
};

/**
 *
 */
tw.ProgressView.prototype.onSuccess = function(source, eventType, command){
    this.element_.removeClass("active");
};

/**
 *
 */
tw.ProgressView.prototype.onError = function(source, eventType, command){
    this.element_.removeClass("active");
    this.element_.addClass("error");
};
