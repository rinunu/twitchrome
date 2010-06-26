
/**
 * 背景の制御を行う
 */
tw.Background = function(){
    this.user_ = null;
};

tw.Background.prototype.initialize = function(){
    tw.store.user(tw.screenName, util.bind(this, this.setBackground));

    this.hasInput = false;
    $(document.body).bind("mousemove.background", util.bind(this, this.onInput));
    $(document.body).bind("keydown.background", util.bind(this, this.onInput));
    util.Event.bind(tw.components.timelineView, this, {setTimeline: this.onSetTimeline});

    // 背景切り替えまでの待ち時間
    // 操作すると増え、定期的に減る
    this.waits_ = 0;
    setInterval(util.bind(this, this.onInterval), 500);
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

tw.Background.prototype.onInput = function(){
    this.waits_ = 2;
};

tw.Background.prototype.onSetTimeline = function(){
    this.waits_ = 6;
};

tw.Background.prototype.onInterval = function(){
    if(tw.ajax.commands().length >= 1){
	this.waits_ = 4;
	return;
    }

    this.waits_--;
    console.debug("background waits", this.waits_);
    
    if(this.waits_ <= 0){
	this.setBackgroundIf(tw.components.timelineView.timeline());
    }
};

/**
 * 必要なら背景を変更する
 */
tw.Background.prototype.setBackgroundIf = function(timeline){
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

