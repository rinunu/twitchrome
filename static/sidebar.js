
/**
 */
tw.Sidebar = function(){
    this.element_ = $(".sidebar");
};

tw.Sidebar.prototype.initialize = function(){
    this.element_.find(".menu a.home").click(
	function(){
	    tw.showTimeline(tw.store.homeTimeline());
	    tw.components.background.setBackground(tw.user);
	});

    this.element_.find(".menu a.mentions").click(
	function(){
	    tw.showTimeline(tw.store.mentions());
	    tw.components.background.setBackground(tw.user);
	});

    this.element_.find(".menu a.favorites").click(
	function(){
	    tw.showTimeline(tw.store.favorites());
	    tw.components.background.setBackground(tw.user);
	});
};
