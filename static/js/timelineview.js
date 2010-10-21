
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

    // 描画が完了していない要素
    // {"uri" : [element]}
    this.loadingElements_ = {};

    this.scrollState_ = this.scrollState();

    this.suspend_ = true;

    // // 表示する Status の配列
    // // このリストの順番に表示する
    // this.renderings_ = [];
    // // renderings_ をどこまで処理したか
    // this.iRenderings_ = 0;

    this.timer_ = null;

    util.Event.bind(this.timeline_, this, {refresh: this.onRefresh});
    util.Event.bind(tw.store, this, {statusRefresh: this.onStatusRefresh});
    util.Event.bind(tw.uriManager, this, {refresh: this.onUriRefresh});

    element.delegate(".status", "focus", util.bind(this, this.onFocus));
    element.delegate(".status", "blur", util.bind(this, this.onBlur));
    
    element.delegate("a.user:not(.in_reply_to)", "click",
		     util.bind(this, this.onShowUser));
    element.delegate("a.user.in_reply_to", "click",
		     util.bind(this, this.onShowConversation));
    element.delegate(".in_reply_to .name", "click",
		     util.bind(this, this.onShowConversation));
    element.delegate("a.hash", "click", util.bind(this, this.onShowHash));

    element.delegate("a.reply", "click", util.bind(this, this.onReply));
    element.delegate("a.rt", "click", util.bind(this, this.onRt));
    element.delegate("a.favorite.off", "click", util.bind(this, this.onFavorite, true));
    element.delegate("a.favorite.on", "click", util.bind(this, this.onFavorite, false));

    this.refreshPartial(timeline.statuses(), 0);
};

/**
 * 表示中の TL を取得する
 */
tw.TimelineView.prototype.timeline = function(){
    return this.timeline_;
};

/**
 * 開放する
 */
tw.TimelineView.prototype.cleanup = function(){
    this.suspend();

    util.Event.unbind(this);

    if(this.timer_){
	clearTimeout(this.timer_);
    }
    this.element_.remove();
    delete this.timeline_;
    delete this.element_;
};

tw.TimelineView.prototype.element = function(){
    return this.element_;
};

/**
 * 指定された status が画面に表示されるように表示位置を調整する
 */
tw.TimelineView.show = function(status){
};

/**
 * フォーカスの当たっている Status を取得する
 */
tw.TimelineView.prototype.focus = function(){
    return this.focusElement_ ? this.focusElement_[0].status : null;
};

/**
 * スクロール状態を保存する
 * 
 * スクロール状態を保存し、復元した場合、ビューポートの最上部に表示されている要素の位置を維持する。
 * 
 * スクロール状態は 
 * {
 *   child: ビューポートの最上部に表示されている要素。 null 可,
 *   offset: child.offsetTop - viewport.scrollTop,
 *   status: ビューポートの最上部に表示されている Status
 * }
 * 
 * 本処理は速度を優先する。
 */
tw.TimelineView.prototype.scrollState = function(){
    console.log("scrollState", this.timeline_.uri());
    var parent = this.element_;
    var viewport = this.element_.parent();

    var children = this.element_[0].getElementsByTagName("li");
    var visibles = [];

    if(children.length == 0){
	return {visibles: []};
    }

    // console.log("viewport scroll top", viewport.scrollTop());
    // console.log("parent offset top", parent[0].offsetTop);
    // console.log("child offset top", children[0].offsetTop); // viewport からの位置

    // ビューポートの最上部の要素を探す
    // child.offsetTop は element_ 内での相対位置
    var scrollTop = viewport.scrollTop();
    for(var i = 0, l = children.length; i < l; i++){
	var top = children[i];
	if(top.offsetTop >= scrollTop){
	    break;
	}
    }

    // みえているもの
    visibles.push(top);
    var scrollBottom = scrollTop + viewport[0].clientHeight;
    for(; i < l; i++){
	var child = children[i];
	if(child.offsetTop + child.offsetHeight >= scrollBottom){
	    break;
	}
	visibles.push(child);
    }

    top = $(top);
    var scrollState = {child: top, offset: top[0].offsetTop - scrollTop, visibles: visibles};
    return scrollState;
};

/**
 * スクロール状態を復元する
 * 
 * 指定された要素が存在しない場合、復元されない。
 */
tw.TimelineView.prototype.setScrollState = function(scrollState){
    if(this.suspend_){
	return;
    }

    console.assert(scrollState);

    // var old = this.scrollState();
    // if(old.child == scrollState.child &&
    //    old.offset == scrollState.offset){
    // 	return;
    // }

    var child = scrollState.child;
    // if(!child && scrollState.status){
    // 	console.debug("setScrollState", "getElement", child);
    // 	child = this.getElement(scrollState.status);
    // }

    var viewport = this.element_.parent();
    if(!child || child.length == 0){
	// console.debug("setScrollState", "スクロール位置が指定されなかった", child);
	viewport.scrollTop(0);
    }else{
	viewport.scrollTop(child[0].offsetTop - scrollState.offset);
    }
};

/**
 * 再表示
 */
tw.TimelineView.prototype.resume = function(){
    this.suspend_ = false;
    // this.refreshPartial(this.timeline_.statuses(), 0);
    this.element_.parent().bind("scroll." + this.timeline_.uri(), 
				util.bind(this, this.onScroll));
};

/**
 * 非表示
 */
tw.TimelineView.prototype.suspend = function(){
    this.suspend_ = true;
    // var children = this.element_.children(".status");
    // for(var i = 0, l = children.length; i < l; i++){
    // 	var element = $(children[i]);
    // 	element.height(element[0].height_);
    // 	element.empty().css("border", "solid 1px red");
    // }
    this.element_.parent().unbind("scroll." + this.timeline_.uri());
};

// ----------------------------------------------------------------------
// private

tw.TimelineView.renderer = new tw.Renderer;

/**
 * Status の描画を行う
 */
tw.TimelineView.prototype.render = function(status, $element, parent, before, class_){
    $element = tw.TimelineView.renderer.render(status, $element);
    $element[0].status = status;
    for(var i = 0, l = $element.loadingUris.length; i < l; i++){
	var uri = $element.loadingUris[i];
	this.loadingElements_[uri] = this.loadingElements_[uri] || [];
	this.loadingElements_[uri].push($element);
    }

    if(class_){
	$element.addClass(class_);
    }

    if(parent){
	parent.insertBefore($element[0], before);
    }

    $element[0].height_ = $element[0].offsetHeight;

    return $element;
};

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
	var focusStatus = focusElement[0].status;
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
 *
 * 存在しない場合は null 
 */
tw.TimelineView.prototype.getElement = function(status){
    var element = null;
    this.element_.find(".status").each(
	function(){
	    var child = $(this);
	    if(child[0].status == status){
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
	var elem = this.render(statuses[i], null, this.element_[0], this.element_[0].firstChild);
	elem[0].status = statuses[i];
    }
};

/**
 * timeline と表示を同期する
 * 
 * 追加した要素の配列を返す
 * 
 * 前提
 * - timeline の要素が削除されていないこと
 */
tw.TimelineView.prototype.sync = function(){
    console.log("sync");
    var statuses = this.timeline_.statuses();
    var elements = this.element_.children(".status");
    var parent = this.element_[0];
    var newElements = [];
    
    // view に存在しない status を view に追加する
    var iStatus = 0,
    lStatus = statuses.length,
    iElement = 0,
    lElement = elements.length;
    for(; iStatus < lStatus; iStatus++){
	var status = statuses[iStatus];
	var element = elements[iElement];
	if(!element || status != element.status){
	    var newElement = this.render(status, null, parent, element ? element : null, "new");
	    newElements.push(newElement);
	}else{
	    iElement++;
	}
    }
    console.log("sync end");
    return newElements;
};

/**
 * statuses を適切な位置へ追加する
 * 
 * 前提
 * - statuses と timeline は status.id の降順になっている
 * 
 * statuses の start から end までを表示する
 */
tw.TimelineView.prototype.insert = function(statuses, start, end){
    var children = this.element_.children(".status");
    var parent = this.element_[0];
    var newElements = [];
    
    for(var i = start; i < end; i++){
	var status = statuses[i];
	var after = null;
	var skip = false;
	for(var j = 0, l2 = children.length; j < l2; j++){
	    var child = children[j];
	    var oldStatus = child.status;
	    if(status.id == oldStatus.id){
		skip = true;
		$(child).css("height", "auto");
		this.render(statuses[i], $(child));
		break;
	    }
	    else if(status.id > oldStatus.id){
		after = child;
		break;
	    }
	}
	if(!skip){
	    var elem = this.render(statuses[i], null, parent, after, "new");
	    newElements.push(elem);
	}else{
	}
    }
    return newElements;
};

/**
 * Timeline の内容に合わせて表示を更新する
 */
tw.TimelineView.prototype.refreshView = function(newStatuses, start, end){
    // if(this.element_[0].childNodes.length == 0){
    	// console.log("prepend all");
    	// this.prepend(newStatuses);
    // }else{
	// var scrollState = this.scrollState();
	// console.log("insert partial", newStatuses.length, start, end);
	var newElements = this.insert(newStatuses, start, end);
        // var newElements = this.sync();
	this.setScrollState(this.scrollState_);
    // }

    // var focus = this.timeline_.focus();
    // if(focus){
    // 	this.setFocus(focus);
    // }

    // 強調表示
    setTimeout(
	function(){
	    for(var i = 0; i < newElements.length; i++){
		newElements[i].removeClass("new");
	    }
	}, 500);
};

/**
 * 少しずつ更新する
 */
tw.TimelineView.prototype.refreshPartial = function(statuses, start){
    console.log("refreshPartial");
    if(start >= statuses.length){
	return;
    }

    var end = Math.min(start + tw.settings.partialCount, statuses.length);
    this.refreshView(statuses, start, end);

    this.timer_ = setTimeout(util.bind(this, this.refreshPartial, statuses, end), 
			     tw.settings.partialInterval);
};

// ----------------------------------------------------------------------
// 状態変化イベント

tw.TimelineView.prototype.onRefresh = function(s, e, newStatuses){
    this.refreshPartial(newStatuses, 0);
    // this.refreshView(newStatuses, 0, newStatuses.length);
};

tw.TimelineView.prototype.onStatusRefresh = function(source, eventType, status){
    var element = this.getElement(status);
    if(element){
	this.render(element[0].status, element);
    }
};

/**
 * URI を表示している、まだ loading な要素を再描画する
 */
tw.TimelineView.prototype.onUriRefresh = function(source, eventType, uri){
    var elements = this.loadingElements_[uri];
    if(!elements || elements.length == 0){
	return;
    }
    console.debug("onUriRefresh", elements.length);
    delete this.loadingElements_[uri];

    var scrollState = this.scrollState();

    for(var i = 0, l = elements.length; i < l; i++){
	var element = elements[i];
	var status = element[0].status;
	this.render(status, element);
    }

    this.setScrollState(scrollState);
};

// ----------------------------------------------------------------------
// 操作イベント

tw.TimelineView.prototype.onScroll = function(event){
    // console.log("scroll", this.scrollState());
    this.scrollState_ = this.scrollState();
    if(!this.scrollState_){
	return;
    }

    var visibles = this.scrollState_.visibles;
    for(var i = 0, l = visibles.length; i < l; i++){
	tw.unread.read(visibles[i].status);
    }
};

/**
 * ブラウザのフォーカスが変わった際に、内部フォーカスを更新する
 */
tw.TimelineView.prototype.onFocus = function(event){
    var target = $(event.target);
    var focusElement = this.getStatusElement(target);
    this.setFocus(focusElement);
};

tw.TimelineView.prototype.onBlur = function(event){
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
    tw.components.popupMenu.show(
	{left: event.pageX, top: event.pageY},
	"コメントを書かずにリツイートする場合は、以下をクリックしてください(公式リツイート)。",
	[{label: "リツイートする",
	  callback: function(){
	      tw.twitter.retweet(status);
	      tw.components.statusInput.clear();
	  }}]);
};

tw.TimelineView.prototype.onShowUser = function(event){
    event.preventDefault();
    var screenName = $(event.target).text();
    tw.showTimeline(tw.store.userTimeline(screenName));
    tw.Track.track("timeline", "userTimeline", "timelineView", screenName);
};

tw.TimelineView.prototype.onShowHash = function(event){
    event.preventDefault();
    var hash = $(event.target).text();
    tw.showTimeline(tw.store.search(hash));
    tw.Track.track("timeline", "hash", "timelineView");
};

tw.TimelineView.prototype.onShowConversation = function(event){
    event.preventDefault();
    var status = this.getStatus($(event.target));
    tw.showTimeline(tw.store.conversation(status));
    tw.Track.track("timeline", "conversation", "timelineView");
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
    return this.getStatusElement(child)[0].status;
};
