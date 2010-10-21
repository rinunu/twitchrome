
/**
 * イベントのトラックを行う
 */
tw.Track = function(){
};

tw.Track.setVar = function(value){
    _gaq.push(['_setVar', value]);
};

/**
 * Ajax による画面遷移
 */
tw.Track.transit = function(url){
    _gaq.push(['_trackPageview', "/" + url]);
};

/**
 * その他のイベント
 * 
 * user には対象ユーザを指定する(たとえばプロフィールを開く場合、その対象となるユーザ)
 */
tw.Track.track = function(category, action, label, user){
    if(user){
	label += "(" + this.personal(user) + ")";
    }

    console.debug("track", category, action, label);
    _gaq.push(['_trackEvent', category, action, label]);
};

/**
 * my, others を返す
 */
tw.Track.personal = function(user){
    var screenName = user.screen_name || user;
    return screenName == tw.screenName ? "my" : "others";
};

