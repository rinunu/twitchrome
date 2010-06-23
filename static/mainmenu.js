/**
 * メインメニュー
 */
tw.MainMenu = function(){
    this.element_ = $(".main.menu");
    var this_ = this;
    this.element_.find("a.search").click(
	function(){
	    var text = this_.element_.find("input.search").val();
	    tw.showTimeline(tw.store.search(text));
	});

    this.element_.find("a.home").click(
	function(){
	    tw.showTimeline(tw.store.homeTimeline());
	});
    
    this.element_.find("a.mentions").click(
	function(){
	    tw.showTimeline(tw.store.mentions());
	});
};
