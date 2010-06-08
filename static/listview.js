
/**
 * List を画面に表示するビュー
 */
tw.ListView = function(element){
    this.list_ = null;
    this.element_ = element;
};

tw.ListView.URL_RE = /(https?:[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/;

tw.ListView.prototype.initialize = function(){
    $(".status").live("focus", util.bind(this, this.onFocus));
    $(".status").live("blur", util.bind(this, this.onBlur));
    $("a.reply").live("click", util.bind(this, this.onReply));
};

/**
 * 表示中のリストを取得する
 */
tw.ListView.prototype.list = function(){
    return this.list_;
};

/**
 * 表示するリストを設定する
 */
tw.ListView.prototype.setList = function(list){
    if(this.list_){
	util.Event.unbind(this);
	this.element_.empty();
    }
    
    this.list_ = list;
    
    util.Event.bind(this.list_, this, {refresh: this.onRefresh});
    
    this.refreshView();
};

/**
 * フォーカスの当たっている Status を取得する
 */
tw.ListView.prototype.focus = function(){
    return this.list_.focus();
};

/**
 * フォーカスを設定する
 * focus は Status もしくは Status を表示している HTML 要素
 */
tw.ListView.prototype.setFocus = function(focus){
    console.assert(focus);
    if(tw.Store.isStatus(focus)){
	var focusStatus = focus;
	var focusElement = this.getElement(focusStatus);
    }else{
	var focusElement = focus;
	var focusStatus = focusElement.data("status");
    }
    
    // 旧フォーカスの後始末
    if(this.list_.focus()){
	var old = this.getElement(this.list_.focus());
	old.removeClass("focus");
    }
    
    // 新フォーカスの設定
    focusElement.addClass("focus");
    this.list_.setFocus(focusStatus);
    
    util.Event.trigger(this, "focus");
};

// ----------------------------------------------------------------------
// private

/**
 * Status から、それを表示している HTML 要素を取得する
 */
tw.ListView.prototype.getElement = function(status){
    var element = null;
    this.element_.find(".status").each(
	function(){
	    var child = $(this);
	    if(child.data("status") == status){
		element = child;
	    }
	});
    return element;
};

/**
 * リストの先頭に Status を追加する
 */
tw.ListView.prototype.addStatus = function(status){
    var elem = tw.templates.status.clone();
    elem.find("img").attr("src", status.user.profile_image_url);
    elem.find(".name").text(status.user.screen_name);
    elem.data("status", status);
	
    var textElem = elem.find(".text");
    textElem.empty();
    textElem.html(this.formatText(status.text));

    this.element_.prepend(elem);
};

/**
 * List の内容に合わせて表示を更新する
 */
tw.ListView.prototype.refreshView = function(){
    var origin = null;
    if(this.element_.length >= 1){
	origin = this.element_.children().first().data("status");
    }

    var statuses = this.list_.statuses();
    var this_ = this;

    this.list_.eachNew(
    	function(status){
    	    this_.addStatus(status);
    	}, origin);

    var focus = this.list_.focus();
    if(focus){
	this.setFocus(focus);
    }
};

/**
 * テキスト内の URL などを リンクにする
 */
tw.ListView.prototype.formatText = function(text){
    return text.replace(tw.ListView.URL_RE, "<a href='$&' target='_blank'>$&</a>");
};


tw.ListView.prototype.onRefresh = function(){
    this.refreshView();
};

/**
 * ブラウザのフォーカスが変わった際に、内部フォーカスを更新する
 */
tw.ListView.prototype.onFocus = function(event){
    var target = $(event.target);
    var focus = this.getStatusElement(target);
    this.setFocus(focus);
};

tw.ListView.prototype.onBlur = function(){
    // var target = $(event.target);
    // this.getStatusElement(target).removeClass("focus");
};

tw.ListView.prototype.onReply = function(event){
    var status = this.getStatus($(event.target));
    tw.components.statusInput.reply(status);
};

/**
 * 指定された要素を含む .status 要素を取得する
 */
tw.ListView.prototype.getStatusElement = function(child){
    var status = null;
    if(child.hasClass("status")){
        status = child;
    }else{
        status = child.closest(".status");
    }
    if(status.length == 0){
        return null;
    }
    return status;
};

/**
 * 指定された要素を含む Status を取得する
 */
tw.ListView.prototype.getStatus = function(child){
    return this.getStatusElement($(event.target)).data("status");
};