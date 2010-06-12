
tw.StatusInput = function(){
    this.element_ = $(".status_input");
    this.textarea_ = this.element_.find("textarea");
    this.count_ = this.element_.find(".count");
    this.inReplyTo_ = null;
};

tw.StatusInput.prototype.initialize = function(){
    tw.setCommand($("a.update"), util.bind(this, this.update));

    this.textarea_.keydown(util.bind(this, this.onKeyDown));
    this.textarea_.keyup(util.bind(this, this.onKeyUp));
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

// ----------------------------------------------------------------------
// private

tw.StatusInput.prototype.onUpdate = function(){
    console.log("on update(statusinput)");
    tw.lists.homeTimeline.refresh({force: true});
    this.textarea_.val("");
    this.inReplyTo_ = null;
};

tw.StatusInput.prototype.onKeyDown = function(){
};

tw.StatusInput.prototype.onKeyUp = function(){
    this.count_.text(140 - this.textarea_.val().length);
};