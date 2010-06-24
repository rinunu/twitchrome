
/**
 * 背景の制御を行う
 */
tw.Background = function(){
    this.user_ = null;
};

tw.Background.prototype.initialize = function(){
    util.Event.bind(tw.components.timelineView, this, {setTimeline: this.onSetTimeline});
};

/**
 * ユーザ情報をもとに、背景を設定する
 */
tw.Background.prototype.setBackground = function(user){
    if(user == this.user_){
	return;
    }

    var old = $(".bg.current");
    var new_ = $(".bg:not(.current)");

    var bgImage = user.profile_background_image_url;
    var bgColor = user.profile_background_color;

    // Twitter の不具合?
    if(/\/theme1\/bg.png$/.test(bgImage)){
	bgColor = "c0deed";
    }
    
    new_.css(
	{
	    backgroundImage: "url(" + bgImage + ")",
	    backgroundRepeat: user.profile_background_tile ? "repeat" : "no-repeat",
	    backgroundColor: "#" + bgColor
	});
    
    old.removeClass("current");
    new_.addClass("current");

    this.user_ = user;
};

// ----------------------------------------------------------------------
// private

tw.Background.RE = /\/(user_timeline|favorites|friends|followers)\/(\w+)/;

tw.Background.prototype.onSetTimeline = function(source, event, timeline){
    if(!timeline){
	return;
    }

    var uri = timeline.uri();

    var m = null;
    if((m = tw.Background.RE.exec(uri))){
	var screenName = m[2];
    }else if(/\/(home_timeline|mentions)/.test(uri)){
	var screenName = tw.screenName;
    }
    var user = tw.store.hasUser(screenName);
    if(user){
	this.setBackground(user);
    }
};