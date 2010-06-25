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
};

tw.MainMenu.prototype.clear = function(){
    this.listsElement_.empty();
};

tw.MainMenu.prototype.initialize = function(){
    tw.lists.subscriptions(tw.screenName, util.bind(this, this.onGetLists));
    tw.lists.lists(tw.screenName, util.bind(this, this.onGetLists));

};

// ----------------------------------------------------------------------
// private

tw.MainMenu.prototype.addList = function(list){
    var element = tw.templates.list.clone();
    element.attr("href", "#" + tw.hash(list));
    element.find(".count").hide();

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
