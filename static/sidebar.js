
/**
 */
tw.Sidebar = function(){
    this.element_ = $(".sidebar");
};

tw.Sidebar.prototype.initialize = function(){
    this.element_.find("a.home").click(
	function(){
	    tw.showHomeTimeline();
	});

    this.element_.find("a.mentions").click(
	function(){
	    tw.showMentions();
	});

    this.element_.find("a.favorites").click(
	function(){
	    tw.showFavorites();
	});
};
