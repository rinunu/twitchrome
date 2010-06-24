
// プロフィール表示欄
tw.ProfileView = function(){
    this.element_ = $(".profile");
    this.user_ = null;
};

tw.ProfileView.prototype.clear = function(){
    this.element_.find(".users.tabs").empty();
    this.setUser({});
};

tw.ProfileView.prototype.initialize = function(){
    util.Event.bind(tw.components.timelineView, this, {focus: this.onFocus});
    util.Event.bind(tw.store.mentions(), this, {refresh: this.onMentionsRefresh});

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

    this.element_.delegate(".users .tab", "click", util.bind(this, this.onTabClick));

    tw.store.user(
	tw.screenName,
	function(user){
	    this_.setUser(user);
	    this_.addUser(user);
	}
    );
};

// ユーザのプロフィールを表示する
tw.ProfileView.prototype.setUser = function(user){
    function format(s){
	return s !== undefined ? s : "?";
    };
    
    this.user_ = user;
    
    this.element_.find(".name.dd").text(format(user.name));
    this.element_.find(".screen_name.dd").text(format(user.screen_name));
    this.element_.find(".statuses_count.dd").text(format(user.statuses_count));
    this.element_.find(".location .dd").text(format(user.location));
    this.element_.find(".followers_count .dd").text(format(user.followers_count));
    this.element_.find(".friends_count .dd").text(format(user.friends_count));
    this.element_.find(".favorites_count .dd").text(format(user.favourites_count));

    this.element_.find(".description .dd").html(
	user.description ?
	    user.description.replace(/\n/g, "<br>") :
	    "?");

    if(user.url){
	this.element_.find(".url .dd").attr("href", user.url).text(user.url);
    }else{
	this.element_.find(".url .dd").removeAttr("href").text("?");
    }

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
    var parent = this.element_.find(".users.tabs");
    var tabs = parent.find(".tab");
    for(var i = 0; i < tabs.length; i++){
	if($(tabs[i]).data("user") == user){
	    return;
	}
    }
    
    var tab = $('<a class="tab"><img src="' + user.profile_image_url + '"></a>').
	data("user", user);

    if(user.screen_name == tw.screenName){
	tab.prependTo(parent);
    }else{
	tab.appendTo(parent);
    }
    tab.hide().fadeIn();
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

/**
 * お気に入りユーザとして登録する
 */
tw.ProfileView.prototype.onMentionsRefresh = function(){
    var statuses = tw.store.mentions().statuses();
    var userMap = {};
    for(var i = 0; i < statuses.length; i++){
	var user = statuses[i].user;
	var a = userMap[user.screen_name] = userMap[user.screen_name] || {count:0};
	a.user = user;
	a.count++;
    };

    var users = [];
    for(i in userMap){
	users.push(userMap[i]);
    }
    users.sort(function(a, b){return b.count - a.count;});

    for(i = 0; i < 7; i++){
	var user = users[i];
	if(!user){
	    break;
	}
	this.addUser(user.user);
    }

    util.Event.unbind(this, tw.store.mentions());
};
