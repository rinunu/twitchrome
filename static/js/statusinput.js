
/**
 * 入力欄
 */
tw.StatusInput = function(){
    this.element_ = $(".status_input");
    this.textarea_ = this.element_.find("textarea");
    this.count_ = this.element_.find(".count");
    this.inReplyTo_ = null;
    this.oldText_ = "";

    this.file_ = $(".status_input input[type='file']");
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

    // 更新中の UI にする
    this.textarea_.attr("readonly", true);
    this.file_.attr("readonly", true);

    var file = this.file_.val() ? this.file_ : null;

    var command = tw.store.update(text, this.inReplyTo_, file);
    command.success(util.bind(this, this.onUpdate));
    command.error(util.bind(this, this.onUpdateError));
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

/**
 * Status に URI を埋めこむ際に使用する文字数を返す。
 */
tw.StatusInput.prototype.fileUriLength = function(){
    if(this.file_.val()){
	return 25 + 1;
    }
    return 0;
};

tw.StatusInput.prototype.onUpdate = function(){
    this.textarea_.attr("readonly", false);
    this.file_.attr("readonly", false);

    this.textarea_.val("");
    this.file_.val("");
    this.inReplyTo_ = null;
    tw.store.homeTimeline().refresh({force: true});
};

tw.StatusInput.prototype.onUpdateError = function(){
    $.jGrowl("ツイートに失敗しました");
    this.textarea_.attr("readonly", false);
    this.file_.attr("readonly", false);
};

tw.StatusInput.prototype.refreshCount = function(){
    var newCount = 140 - this.textarea_.val().length - this.fileUriLength();
    if(this.count_.text() != newCount){
	this.count_.text(newCount);
    }
};

tw.StatusInput.prototype.onInterval = function(){
    this.refreshCount();
};

tw.StatusInput.prototype.onKeyDown = function(){
};

tw.StatusInput.prototype.onKeyUp = function(){
};

tw.StatusInput.prototype.onChange = function(){
};

