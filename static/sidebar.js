
/**
 */
tw.Sidebar = function(){
    this.element_ = $(".sidebar");
};

tw.Sidebar.prototype.initialize = function(){
    this.element_.find("a.home").click(
	function(){
	    tw.showTimeline(tw.lists.homeTimeline);
	    tw.components.background.setBackground(tw.user);
	});

    this.element_.find("a.mentions").click(
	function(){
	    tw.showTimeline(tw.lists.mentions);
	    tw.components.background.setBackground(tw.user);
	});

    this.element_.find("a.favorites").click(
	function(){
	    tw.showTimeline(tw.store.getFavorites());
	    tw.components.background.setBackground(tw.user);
	});
};
