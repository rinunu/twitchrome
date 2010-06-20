
/**
 * 処理中の処理の情報を表示する
 */
tw.ProgressView = function(){
    this.element_ = $(".progress");
};

tw.ProgressView.prototype.clear = function(){
};

tw.ProgressView.prototype.initialize = function(){
    util.Event.bind(tw.ajax, this, {start: this.onStart});
    util.Event.bind(tw.ajax, this, {end: this.onEnd});
};

// ----------------------------------------------------------------------
// private

/**
 *
 */
tw.ProgressView.prototype.onStart = function(source, eventType, command){
    console.log("test");
    this.element_.text("「" + command.name + "」を処理中です");
    this.element_.addClass("active");
};

/**
 *
 */
tw.ProgressView.prototype.onEnd = function(source, eventType, command){
    this.element_.removeClass("active");
};
