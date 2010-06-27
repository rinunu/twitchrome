
/**
 * ポップアップメニューを表示する
 * 
 * ユーザへ問い合わせを行うために使用する
 * 
 * ユーザは本メニューを無視することもできる(カーソルが離れる/キー入力があるととじる)
 */
tw.PopupMenu = function(){
    this.element_ = $(".popup.menu");
};

tw.PopupMenu.prototype.clear = function(){
    this.element_.hide();
};

/**
 * ポップアップを表示します
 * pos: 画面上での座標
 * message: html
 * commands: [{label, callback}, ...]
 */
tw.PopupMenu.prototype.show = function(pos, message, commands){
    console.log("show", pos.left, pos.top);
    console.log(this.element_.offset().left, this.element_.offset().top);

    this.closeMenu();

    // 見た目の生成
    this.element_.find(".message").text(message);
    var commandsElement = this.element_.find(".commands");
    commandsElement.empty();
    for(var i = 0; i < commands.length; i++){
	var command = commands[i];
	$('<a class="button">' + command.label + '</a>').
	    click(util.bind(this, this.onCommand, command.callback)).
	    appendTo(commandsElement);
    }

    $(document.body).bind("keydown.popupMenu", util.bind(this, this.closeMenu));
    $(document.body).bind("mousemove.popupMenu", util.bind(this, this.onMouseMove));

    // 適当な位置へ表示
    this.element_.fadeIn(); // 先に表示しないとずれるときがあるみたい
    pos.top = pos.top + 10;
    pos.left = pos.left + 10;
    var viewHeight = $(document).height();
    var popupHeight = this.element_.outerHeight();
    if(pos.top + popupHeight > viewHeight){
	pos.top = viewHeight - popupHeight;
    }
    this.element_.offset(pos);
};

// ----------------------------------------------------------------------
// private

tw.PopupMenu.prototype.closeMenu = function(){
    $(document.body).unbind(".popupMenu");
    this.element_.hide();
};

tw.PopupMenu.prototype.onCommand = function(callback, event){
    callback();
    this.closeMenu();
};

tw.PopupMenu.prototype.onMouseMove = function(event){
    // console.log("contextMenu: onMove", event.pageX, event.pageY);
    
    var offset = this.element_.offset();
    // とりあえず、左上方向に離れた場合のみ消す
    if(offset.left - event.pageX > 20
       || offset.top - event.pageY > 20){
	this.closeMenu();
    }
};
