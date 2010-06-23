/**
 * メインメニュー
 */
tw.MainMenu = function(){
    this.element_ = $(".main.menu");
    var this_ = this;
    this.element_.find("a.search").click(util.bind(this, this.onSearch));
    this.element_.find(".search form").submit(util.bind(this, this.onSearch));
};

tw.MainMenu.prototype.onSearch = function(event){
    event.preventDefault();
    var text = this.element_.find("input.search").val();
    tw.showTimeline(tw.store.search(text));
};
