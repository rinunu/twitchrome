
/**
 * Timeline を画面に表示するビュー
 * 
 * element は Status を追加するコンテナ
 * (スクロールバーは element.parent() が表示する)
 * 
 * 発生するイベント
 * - focus
 */
tw.TimelineView = function(element, timeline){
    this.timeline_ = timeline;
    this.element_ = element;
    this.focusElement_ = null;

    util.Event.bind(this.timeline_, this, {refresh: this.onRefresh});
    util.Event.bind(tw.store, this, {statusRefresh: this.onStatusRefresh});

    element.delegate(".status", "focus", util.bind(this, this.onFocus));
    element.delegate(".status", "blur", util.bind(this, this.onBlur));
    
    element.delegate("a.user:not(.in_reply_to)", "click",
		     util.bind(this, this.onShowUser));
    element.delegate("a.user.in_reply_to", "click",
		     util.bind(this, this.onShowConversation));
    element.delegate("a.hash", "click", util.bind(this, this.onShowHash));

    element.delegate("a.reply", "click", util.bind(this, this.onReply));
    element.delegate("a.rt", "click", util.bind(this, this.onRt));
    element.delegate("a.favorite.off", "click", util.bind(this, this.onFavorite, true));
    element.delegate("a.favorite.on", "click", util.bind(this, this.onFavorite, false));

    this.refreshView(timeline.statuses());
};

/**
 * 表示中のリストを取得する
 */
tw.TimelineView.prototype.timeline = function(){
    return this.timeline_;
};

tw.TimelineView.prototype.element = function(){
    return this.element_;
};

/**
 * フォーカスの当たっている Status を取得する
 */
tw.TimelineView.prototype.focus = function(){
    return this.focusElement_ ? this.focusElement_.data("status") : null;
};

// ----------------------------------------------------------------------
// private

tw.TimelineView.renderer = new tw.Renderer;

/**
 * フォーカスを設定する
 * focus は Status もしくは Status を表示している HTML 要素
 */
tw.TimelineView.prototype.setFocus = function(focus){
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
    if(this.focusElement_){
	this.focusElement_.removeClass("focus");
    }
    
    // 新フォーカスの設定
    focusElement.addClass("focus");
    this.focusElement_ = focusElement;

    util.Event.trigger(this, "focus");
};

/**
 * Status から、それを表示している HTML 要素を取得する
 * 現在線形検索が発生するので注意
 */
tw.TimelineView.prototype.getElement = function(status){
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
 * statuses をリストの先頭に追加する
 * 
 * 速度的には insert() より早いと思うが、現在はそこまで遅くないので未使用。
 */
tw.TimelineView.prototype.prepend = function(statuses){
    for(var i = statuses.length - 1; i >= 0; i--){
	var elem = tw.TimelineView.renderer.render(statuses[i]);
	elem.data("status", statuses[i]);
	this.element_.prepend(elem);
    }
};

/**
 * statuses を適切な位置へ追加する
 * statuses は作成日の降順になっていること
 *
 * 大量の statuses を追加すると遅くなるので注意。
 */
tw.TimelineView.prototype.insert = function(statuses){
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
	    var elem = tw.TimelineView.renderer.render(statuses[i]);
	    elem.data("status", statuses[i]);
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
tw.TimelineView.prototype.scrollState = function(){
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
    var child = null;
    for(var i = 0; i < children.length; i++){
	child = children[i];
	if(child.offsetTop >= scrollTop){
	    break;
	}
    }

    if(child){
	// offset はビューポート上端から element までの offset
	return {element: child, offset: child.offsetTop - scrollTop};
    }else{
	return null;
    }
};

/**
 * スクロール状態を復元する
 */
tw.TimelineView.prototype.setScrollState = function(scrollState){
    if(scrollState){
	this.element_.scrollTop(scrollState.element.offsetTop - scrollState.offset);
    }
};


/**
 * Timeline の内容に合わせて表示を更新する
 */
tw.TimelineView.prototype.refreshView = function(newStatuses){
    // 画面最上部に表示している Status をもとめる

    // if(this.element_[0].childNodes.length == 0){
    // 	console.log("prepend all");
    // 	this.prepend(newStatuses);
    // }else{
	var scrollState = this.scrollState();
	console.log("insert partial", newStatuses.length);
	this.insert(newStatuses);
	this.setScrollState(scrollState);
    // }

    // var focus = this.timeline_.focus();
    // if(focus){
    // 	this.setFocus(focus);
    // }
};

// ----------------------------------------------------------------------
// 状態変化イベント

tw.TimelineView.prototype.onRefresh = function(s, e, newStatuses){
    this.refreshView(newStatuses);
};

tw.TimelineView.prototype.onStatusRefresh = function(source, eventType, status){
    console.log('on status refresh', status);
    var element = this.getElement(status);
    if(element){
	tw.TimelineView.renderer.render(element.data("status"), element);
    }
};

// ----------------------------------------------------------------------
// 操作イベント

/**
 * ブラウザのフォーカスが変わった際に、内部フォーカスを更新する
 */
tw.TimelineView.prototype.onFocus = function(event){
    var target = $(event.target);
    var focusElement = this.getStatusElement(target);
    this.setFocus(focusElement);
};

tw.TimelineView.prototype.onBlur = function(event){
    // var target = $(event.target);
    // this.getStatusElement(target).removeClass("focus");
};

tw.TimelineView.prototype.onReply = function(event){
    event.preventDefault();
    var status = this.getStatus($(event.target));
    tw.components.statusInput.reply(status);
};

tw.TimelineView.prototype.onFavorite = function(add, event){
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

tw.TimelineView.prototype.onRt = function(event){
    event.preventDefault();
    var status = this.getStatus($(event.target));
    tw.components.statusInput.rt(status);
};

tw.TimelineView.prototype.onShowUser = function(event){
    event.preventDefault();
    var screenName = $(event.target).text().slice(1);
    tw.showTimeline(tw.store.userTimeline(screenName));
};

tw.TimelineView.prototype.onShowHash = function(event){
    event.preventDefault();
    alert("TODO ハッシュを検索した結果を表示する予定");
};

tw.TimelineView.prototype.onShowConversation = function(event){
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
tw.TimelineView.prototype.getStatusElement = function(child){
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
 * 指定された HTML 要素を含む .status 要素に関連づいた Status を取得する
 */
tw.TimelineView.prototype.getStatus = function(child){
    return this.getStatusElement(child).data("status");
};
