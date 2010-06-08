
// プロフィール表示欄
tw.ProfileView = function(){
    this.element_ = $(".profile");
    this.userId_ = null;
};

tw.ProfileView.prototype.initialize = function(){
    util.Event.bind(tw.components.mainListView, this, {focus: this.onFocus});

    var this_ = this;
    this.element_.find("a.user_timeline").click(
	function(event){
	    event.preventDefault();
	    tw.showUserTimeline(this_.userId_);
	});
};

// ユーザのプロフィールを表示する
tw.ProfileView.prototype.setUser = function(user){
    this.userId_ = user.id;
    
    this.element_.find(".name.dd").text(user.name);
    this.element_.find(".screen_name.dd").text(user.screen_name);
    this.element_.find(".statuses_count.dd").text(user.statuses_count);
    
    this.element_.find(".location .dd").text(user.location);
    this.element_.find(".description .dd").text(user.description);
    this.element_.find(".followers_count .dd").text(user.followers_count);
    this.element_.find(".friends_count .dd").text(user.friends_count);
    this.element_.find(".favourites_count .dd").text(user.favourites_count);

    this.element_.find(".url .dd").attr("href", user.url).text(user.url);

    this.element_.find("img").attr("src", user.profile_image_url);
};

/**
 * フォーカスが変更された際の処理
 */
tw.ProfileView.prototype.onFocus = function(){
    var focus = tw.components.mainListView.focus();
    this.setUser(focus.user);
};
