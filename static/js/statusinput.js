
/**
 * 入力欄
 */
tw.StatusInput = function(){
    this.element_ = $(".status_input");
    this.textarea_ = this.element_.find("textarea");
    this.count_ = this.element_.find(".count");
    this.inReplyTo_ = null;
    this.oldText_ = "";
};

/**
 * メッセージを削除する
 */
tw.StatusInput.prototype.clear = function(){
    this.textarea_.text("");
};

tw.StatusInput.prototype.initialize = function(){
    tw.setCommand($("a.update"), util.bind(this, this.update));

    this.textarea_.keydown(util.bind(this, this.onKeyDown));
    this.textarea_.keyup(util.bind(this, this.onKeyUp));
    this.textarea_.change(util.bind(this, this.onChange));

    setInterval(util.bind(this, this.onInterval), 100);
};

/**
 * status を更新する
 */
tw.StatusInput.prototype.update = function(){
    var text = this.textarea_.val();
    tw.store.update(text, this.inReplyTo_, util.bind(this, this.onUpdate));
};

/**
 * reply する
 */
tw.StatusInput.prototype.reply = function(status){
    this.inReplyTo_ = status;
    var textarea = $(".status_input textarea");
    textarea.val("@" + status.user.screen_name + " ");
    textarea.focus();
    util.setCaretPosition(textarea, textarea.val().length);
};

/**
 * 非公式 RT する
 */
tw.StatusInput.prototype.rt = function(status){
    this.inReplyTo_ = null;
    var textarea = $(".status_input textarea");
    textarea.val("RT @" + status.user.screen_name + ": " + status.text);
    textarea.focus();
    util.setCaretPosition(textarea, 0);
};

// ----------------------------------------------------------------------
// private

tw.StatusInput.prototype.onUpdate = function(){
    console.log("on update(statusinput)");
    tw.store.homeTimeline().refresh({force: true});
    this.textarea_.val("");
    this.inReplyTo_ = null;
};

tw.StatusInput.prototype.refreshCount = function(){
    this.count_.text(140 - this.textarea_.val().length);
};

tw.StatusInput.prototype.onInterval = function(){
    if(this.textarea_.val() != this.oldText_){
	this.refreshCount();
	this.oldText_ = this.textarea_.val();
    }
};

tw.StatusInput.prototype.onKeyDown = function(){
};

tw.StatusInput.prototype.onKeyUp = function(){
};

tw.StatusInput.prototype.onChange = function(){
};

