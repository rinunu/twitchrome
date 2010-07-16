/**
 * メインメニュー
 */
tw.MainMenu = function(){
    this.element_ = $(".main.menu");
    this.listsElement_ = this.element_.find(".list");
    tw.templates.list = this.listsElement_.find(".tab").first().clone();
    
    var this_ = this;
    this.element_.find("a.search").click(util.bind(this, this.onSearch));
    this.element_.find(".search form").submit(util.bind(this, this.onSearch));

    /**
     * Timeline と DOM を結びつける
     */
    this.timelineElements_ = {};
};

tw.MainMenu.prototype.clear = function(){
    this.listsElement_.empty();
};

tw.MainMenu.prototype.initialize = function(){
    tw.lists.subscriptions(tw.screenName, util.bind(this, this.onGetLists));
    tw.lists.lists(tw.screenName, util.bind(this, this.onGetLists));
    util.Event.bind(tw.unread, this, {change: this.onUnreadChange});

    this.addTimeline(this.element_.find("a.home_timeline"), tw.store.homeTimeline());
    this.addTimeline(this.element_.find("a.mentions"), tw.store.mentions());
};

// ----------------------------------------------------------------------
// private

tw.MainMenu.prototype.addTimeline = function(element, timeline){
    this.timelineElements_[timeline.uri()] = element;

    element.attr("href", "#" + tw.hash(timeline));

    this.refreshUnread(timeline);
};

tw.MainMenu.prototype.timelineElement = function(timeline){
    return this.timelineElements_[timeline.uri()];
};

/**
 * 指定した Timeline の未読件数表示を更新する
 */
tw.MainMenu.prototype.refreshUnread = function(timeline){
    var count = tw.unread.unreadCount(timeline);
    var element = this.timelineElement(timeline);
    var $count = element.find("span.count");
    if(count >= 1){
	$count.text(count).show();
    }else{
	$count.hide();
    }
};

/**
 * リストをメニューに追加する
 */
tw.MainMenu.prototype.addList = function(list){
    var element = tw.templates.list.clone();
    this.addTimeline(element, list);

    if(list.screenName() == tw.screenName){
	element.addClass("your");
	element.find(".name").text(list.shortName());

	var yours = this.listsElement_.find(".your");
	if(yours.length >= 1){
	    yours.last().after(element);
	}else{
	    this.listsElement_.prepend(element);
	}
    }else{
	element.removeClass("your");
	element.find(".name").text(list.fullName());

	this.listsElement_.append(element);
    }
    element.hide().fadeIn();
};

tw.MainMenu.prototype.onSearch = function(event){
    event.preventDefault();
    var text = this.element_.find("input.search").val();
    tw.showTimeline(tw.store.search(text));
};

tw.MainMenu.prototype.onGetLists = function(lists){
    for(var i = 0; i < lists.length; i++){
	var list = lists[i];
	this.addList(list);
    }
};

tw.MainMenu.prototype.onUnreadChange = function(){
    console.log("MainMenu : refresh unread");

    for(var uri in this.timelineElements_){
	var timeline = tw.store.timeline(uri);
	this.refreshUnread(timeline);
    }
};
