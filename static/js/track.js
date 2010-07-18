
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
 */
tw.Track.track = function(category, action, label){
    _gaq.push(['_trackEvent', category, action, label]);
};
