
/**
 * 背景の制御を行う
 */
tw.Background = function(){
};

tw.Background.prototype.initialize = function(){
    util.Event.bind(tw.components.mainListView, this, {setTimeline: this.onSetTimeline});
};

/**
 * ユーザ情報をもとに、背景を設定する
 */
tw.Background.prototype.setBackground = function(user){
    var old = $(".bg.current");
    var new_ = $(".bg:not(.current)");

    var bgImage = user.profile_background_image_url;
    var bgColor = user.profile_background_color;

    // Twitter の不具合?
    if(/\/theme1\/bg.png$/.test(bgImage) && bgColor == "9ae4e8"){
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
};

// ----------------------------------------------------------------------
// private

tw.Background.prototype.onSetTimeline = function(source, event, timeline){
    if(!timeline){
	return;
    }

    var uri = timeline.uri();
    console.log("backgroud", uri);

    if(uri.indexOf("/user_timeline/") != -1 ||
       uri.indexOf("/favorites/") != -1 ||
       uri.indexOf("/friends/") != -1 ||
       uri.indexOf("/followers/") != -1)
    {
	var statuses = timeline.statuses();
	if(statuses.length >= 1){
	    this.setBackground(statuses[0].user);
	}
    }else{
	if(tw.user){
	    this.setBackground(tw.user);
	}
    }
};