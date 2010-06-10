
/**
 * 背景の制御を行う
 */
tw.Background = function(){
};

tw.Background.prototype.initialize = function(){
};

/**
 * ユーザ情報をもとに、背景を設定する
 */
tw.Background.prototype.setBackground = function(user){
    var old = $(".bg.current");
    var new_ = $(".bg:not(.current)");
    new_.css(
	{
	    backgroundImage: "url(" + user.profile_background_image_url + ")",
	    backgroundRepeat: user.profile_background_tile ? "repeat" : "no-repeat",
	    backgroundColor: "#" + user.profile_background_color
	});
    
    old.removeClass("current");
    new_.addClass("current");
};

