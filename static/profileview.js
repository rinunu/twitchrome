
// プロフィール表示欄
tw.ProfileView = function(){
    this.element_ = $(".profile");
    this.user_ = null;
};

tw.ProfileView.prototype.clear = function(){
    this.element_.find(".tabs").empty();
    this.setUser({});
};

tw.ProfileView.prototype.initialize = function(){
    util.Event.bind(tw.components.timelineView, this, {focus: this.onFocus});

    var this_ = this;
    this.element_.find("a.user_timeline").click(
	function(event){
	    event.preventDefault();
	    tw.showTimeline(tw.store.userTimeline(this_.user_));
	});
    
    this.element_.find("a.friends").click(
	function(event){
	    event.preventDefault();
	    tw.showTimeline(tw.store.friends(this_.user_));
	});
    
    this.element_.find("a.followers").click(
	function(event){
	    event.preventDefault();
	    tw.showTimeline(tw.store.followers(this_.user_));
	});
    
    this.element_.find("a.favorites").click(
	function(event){
	    event.preventDefault();
	    tw.showTimeline(tw.store.favorites(this_.user_));
	});

    this.element_.delegate(".tab", "click", util.bind(this, this.onTabClick));
};

// ユーザのプロフィールを表示する
tw.ProfileView.prototype.setUser = function(user){
    this.user_ = user;
    
    this.element_.find(".name.dd").text(user.name || "");
    this.element_.find(".screen_name.dd").text(user.screen_name || "");
    this.element_.find(".statuses_count.dd").text(user.statuses_count || "");
    
    this.element_.find(".location .dd").text(user.location || "");
    this.element_.find(".followers_count .dd").text(user.followers_count || "");
    this.element_.find(".friends_count .dd").text(user.friends_count || "");
    this.element_.find(".favorites_count .dd").text(user.favourites_count || "");

    this.element_.find(".description .dd").html(
	user.description ?
	    user.description.replace(/\n/g, "<br>") :
	    "");

    this.element_.find(".url .dd").attr("href", user.url || "").text(user.url || "");

    this.element_.find(".content img").attr("src", user.profile_image_url || "");
    this.element_.find("a.profile_image").attr(
	"href",
	(user.profile_image_url || "").replace(/_normal/, ""));

    this.element_.find("a.twitter").attr(
	"href",
	user.screen_name ?
	    "http://twitter.com/" + user.screen_name :
	    "");
};

/**
 * ユーザ選択欄にユーザを追加する
 */
tw.ProfileView.prototype.addUser = function(user){
    var tabs = this.element_.find(".tabs");
    $('<a class="tab"><img src="' + user.profile_image_url + '"></a>').
	data("user", user).
	appendTo(tabs);
};

/* ---------------------------------------------------------------------- */
/* private */

/**
 * フォーカスが変更された際の処理
 */
tw.ProfileView.prototype.onFocus = function(){
    var focus = tw.components.timelineView.focus();
    this.setUser(focus.user);
};

tw.ProfileView.prototype.onTabClick = function(event){
    var target = $(event.target).closest(".tab");
    var screenName = target.data("user").screen_name;
    tw.store.user(screenName, util.bind(this, this.setUser));
};
