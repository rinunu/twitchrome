/**
 * 複数の TimelineView を使用して、 TL の切り替えを高速化するビュー
 * 
 * 発生するイベント
 * - setTimeline
 * - focus
 */
tw.MultiTimelineView = function(element){
    this.element_ = element;

    this.currentView_ = null;

    this.views_ = [];
};

tw.MultiTimelineView.prototype.initialize = function(){
};

/**
 * フォーカスの当たっている Status を取得する
 */
tw.MultiTimelineView.prototype.focus = function(){
    if(!this.currentView_){
	return null;
    }
    return this.currentView_.focus();
};

tw.MultiTimelineView.prototype.scrollState = function(){
    if(!this.currentView_){
	return null;
    }
    return this.currentView_.scrollState();
};

tw.MultiTimelineView.prototype.setScrollState = function(scrollState){
    if(!this.currentView_){
	return null;
    }
    return this.currentView_.setScrollState(scrollState);
};

/**
 * 表示している TL を取得する
 */
tw.MultiTimelineView.prototype.timeline = function(){
    if(!this.currentView_){
	return null;
    }
    return this.currentView_.timeline();
};

/**
 * 表示する TL を設定する
 */
tw.MultiTimelineView.prototype.setTimeline = function(timeline){
    // 後始末
    if(this.currentView_){
	this.currentView_.element().hide();
	this.currentView_ = null;
    }

    // 初期化
    var newView = this.view(timeline);
    if(!newView){
	var element = $('<div class="timeline" />').appendTo(this.element_);
	newView = new tw.TimelineView(element, timeline);
	util.Event.bind(newView, this, {focus: this.onFocus});
	this.views_.push(newView);
    }
    this.currentView_ = newView;
    newView.element().show();

    util.Event.trigger(this, "setTimeline", timeline);
};

// ----------------------------------------------------------------------
// private

/**
 * timeline を表示している TimelineView を取得する
 * 
 * 存在しなければ null を返す
 */
tw.MultiTimelineView.prototype.view = function(timeline){
    for(var i = 0; i < this.views_.length; i++){
	var view = this.views_[i];
	if(view.timeline() == timeline){
	    return view;
	}
    }
    return null;
};

tw.MultiTimelineView.prototype.onFocus = function(){
    util.Event.trigger(this, "focus");
};
