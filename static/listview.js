
/**
 * List を画面に表示するビュー
 */
tw.ListView = function(element){
    this.list_ = null;
    this.element_ = element;
    this.updatedAt_ = new Date("1999/01/01");

    // 表示している Status 要素の情報
    // {"statusId": element}, ...}
    this.elements_ = [];

    util.Event.bind(tw.store, this, {statusRefresh: this.onStatusRefresh});
};

tw.ListView.URL_RE = /https?:[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g;
tw.ListView.USER_RE = /@(\w+)/g;
tw.ListView.HASH_RE = /#(\w+)/g;

tw.ListView.prototype.initialize = function(){
    $(".status").live("focus", util.bind(this, this.onFocus));
    $(".status").live("blur", util.bind(this, this.onBlur));
    
    $("a.user:not(.in_reply_to)").live("click", util.bind(this, this.onShowUser));
    $("a.user.in_reply_to").live("click", util.bind(this, this.onShowConversation));
    $("a.hash").live("click", util.bind(this, this.onShowHash));

    $("a.reply").live("click", util.bind(this, this.onReply));
    $("a.rt").live("click", util.bind(this, this.onRt));
    $("a.favorite.off").live("click", util.bind(this, this.onFavorite, true));
    $("a.favorite.on").live("click", util.bind(this, this.onFavorite, false));
};

/**
 * 表示中のリストを取得する
 */
tw.ListView.prototype.list = function(){
    return this.list_;
};

/**
 * 表示する TL を設定する
 */
tw.ListView.prototype.setList = function(list){
    if(this.list_){
	util.Event.unbind(this, this.list_);
	this.element_.empty();
	this.updatedAt_ = new Date("1999/01/01");
    }
    
    this.list_ = list;
    
    util.Event.bind(this.list_, this, {refresh: this.onRefresh});
    
    this.refreshView(list.statuses());

    util.Event.trigger(this, "setTimeline", list);
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
    console.log("focus", focusStatus);
    
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
 * 現在線形検索が発生するので注意
 */
tw.ListView.prototype.getElement = function(status){
    var element = null;
    this.element_.find(".status").each(
	function(){
	    var child = $(this);
	    if(child.data("status") == status){
		element = child;
		return false;
	    }
	    return true;
	});
    return element;
};

/**
 * Status 表示用の Element を更新する
 */
tw.ListView.prototype.refreshElement = function(element){
    console.assert(element);
    var status = element.data("status");
    
    element.find("img").attr("src", status.user.profile_image_url);
    element.find(".name").text(status.user.screen_name);

    var textElem = element.find(".text");
    textElem.empty();
    textElem.html(this.formatText(status.text, status));

    element.find(".source").html(status.source);
    element.find(".created_at").html(this.formatDate(status.created_at));

    var favorite = element.find(".favorite");
    favorite.removeClass("wait");
    favorite.removeClass("on");
    favorite.removeClass("off");
    if(status.favorited){
	favorite.addClass("on");
    }else{
	favorite.addClass("off");
    }
};

/**
 * Status 表示用の Element を生成する
 */
tw.ListView.prototype.createElement = function(status){
    var element = tw.templates.status.clone();
    element.data("status", status);
    this.refreshElement(element, status);
    return element;
};

/**
 * statuses をリストの先頭に追加する
 */
tw.ListView.prototype.prepend = function(statuses){
    for(var i = statuses.length - 1; i >= 0; i--){
	var elem = this.createElement(statuses[i]);
	this.element_.prepend(elem);
    }
};

/**
 * statuses を適切な位置へ追加する
 * statuses は作成日の降順になっていること
 *
 * 大量の statuses を追加すると遅くなるので注意。
 */
tw.ListView.prototype.insert = function(statuses){
    var children = this.element_.children(".status");
    var parent = this.element_[0];
    var newElements = [];
    
    for(var i = 0; i < statuses.length; i++){
	var status = statuses[i];
	var after = null;
	var skip = false;
	// 先頭に追加されるパターンが多いため、2分探索ではなく、普通の検索を行う
	for(var j = 0; j < children.length; j++){
	    var child = $(children[j]);
	    var oldStatus = child.data("status");
	    if(status.id == oldStatus.id){
		skip = true;
		break;
	    }
	    else if(status.id > oldStatus.id){
		after = child[0];
		break;
	    }
	}
	if(!skip){
	    var elem = this.createElement(statuses[i]);
	    elem.addClass("new");
	    newElements.push(elem);
	    parent.insertBefore(elem[0], after); // after == null の時は末尾
	}
    }

    // 強調表示
    setTimeout(
	function(){
	    for(var i = 0; i < newElements.length; i++){
		newElements[i].removeClass("new");
	    }
	}, 500);
};

/**
 * スクロール状態を保存する
 */
tw.ListView.prototype.scrollState = function(){
    var children = this.element_.children(".status");

    // console.log("parent scroll", this.element_.scrollTop());
    // console.log("parent offset", this.element_.offset().top);
    // console.log("parent position", this.element_.position().top);
    // console.log("parent offset top", this.element_[0].offsetTop);
    // console.log("child offset parent", children[0].offsetParent);
    // console.log("child offsetParent()", $(children[0]).offsetParent()[0]);
    // console.log("child scroll", $(children[0]).scrollTop());
    // console.log("child offset", $(children[0]).offset().top);
    // console.log("child position", $(children[0]).position().top);
    // console.log("child offset top", children[0].offsetTop);


    // child.offsetTop は element_ 内での相対位置
    var scrollTop = this.element_.scrollTop();
    for(var i = 0; i < children.length; i++){
	var child = children[i];
	if(child.offsetTop >= scrollTop){
	    break;
	}
    }
    
    // offset はビューポート上端から element までの offset
    return {element: child, offset: child.offsetTop - scrollTop};
};

/**
 * スクロール状態を復元する
 */
tw.ListView.prototype.setScrollState = function(scrollState){
    this.element_.scrollTop(scrollState.element.offsetTop - scrollState.offset);
};


/**
 * List の内容に合わせて表示を更新する
 */
tw.ListView.prototype.refreshView = function(newStatuses){
    // 画面最上部に表示している Status をもとめる

    if(this.element_[0].childNodes.length == 0){
	console.log("prepend all");
	this.prepend(newStatuses);
    }else{
	var scrollState = this.scrollState();
	console.log("insert partial", newStatuses.length);
	this.insert(newStatuses);
	this.setScrollState(scrollState);
    }

    this.updatedAt_ = this.list_.updatedAt();

    var focus = this.list_.focus();
    if(focus){
	this.setFocus(focus);
    }
};

/**
 * テキスト内の URL などを リンクにする
 */
tw.ListView.prototype.formatText = function(text, status){
    text = text.replace(/\n/g, "<br>");
    if(status.in_reply_to_status_id){
	var userClass = "user in_reply_to";
    }else{
	var userClass = "user";
    }
    text = text.replace(tw.ListView.USER_RE, "<a class='" + userClass + "'>$&</a>");
    text = text.replace(tw.ListView.HASH_RE, "<a class='hash'>$&</a>");
    
    text = text.replace(tw.ListView.URL_RE, tw.Inline.inline);
    return text;
};

/**
 * 
 */
tw.ListView.prototype.formatDate = function(date){
    var t = new Date(date);
    date = [t.getHours(), t.getMinutes(), t.getSeconds()];
    for(var i = 0; i < date.length; i++){
	date[i] = (date[i] >= 10) ? date[i] : "0" + date[i];
    }
    return date.join(":");
};

// ----------------------------------------------------------------------
// 状態変化

tw.ListView.prototype.onRefresh = function(s, e, newStatuses){
    this.refreshView(newStatuses);
};

tw.ListView.prototype.onStatusRefresh = function(source, eventType, status){
    console.log('on status refresh', status);
    var element = this.getElement(status);
    if(element){
	this.refreshElement(element);
    }
};

// ----------------------------------------------------------------------
// 操作

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
    event.preventDefault();
    var status = this.getStatus($(event.target));
    tw.components.statusInput.reply(status);
};

tw.ListView.prototype.onFavorite = function(add, event){
    event.preventDefault();
    var element = $(event.target);
    var status = this.getStatus(element);
    element.addClass("wait");
    element.removeClass("on");
    element.removeClass("off");
    if(add){
	tw.store.favorite(status);
    }else{
	tw.store.unfavorite(status);
    }
};

tw.ListView.prototype.onRt = function(event){
    event.preventDefault();
    var status = this.getStatus($(event.target));
    tw.components.statusInput.rt(status);
};

tw.ListView.prototype.onShowUser = function(event){
    event.preventDefault();
    var screenName = $(event.target).text().slice(1);
    tw.showTimeline(tw.store.userTimeline(screenName));
};

tw.ListView.prototype.onShowHash = function(event){
    event.preventDefault();
    alert("TODO ハッシュを検索した結果を表示する予定");
};

tw.ListView.prototype.onShowConversation = function(event){
    event.preventDefault();
    console.log(event.target);
    var status = this.getStatus($(event.target));
    console.assert(status);
    tw.showTimeline(tw.store.getConversation(status));
};

// ----------------------------------------------------------------------
// 

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