
/**
 */
tw.Sidebar = function(){
    this.element_ = $(".sidebar");
};

tw.Sidebar.prototype.initialize = function(){
    this.element_.find("a.home").click(
	function(){
	    tw.showTimeline(tw.lists.homeTimeline);
	});

    this.element_.find("a.mentions").click(
	function(){
	    tw.showTimeline(tw.lists.mentions);
	});

    this.element_.find("a.favorites").click(
	function(){
	    tw.showTimeline(tw.store.getFavorites());
	});
};
