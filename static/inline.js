
/**
 * URL をインライン表示する
 */
tw.Inline = {};

tw.Inline.TWITPIC_URL = /^http:\/\/twitpic.com\/(\w+)/;

/**
 * 指定された url がインライン表示可能ならインライン化する
 * そうでなければリンクにする
 */
tw.Inline.inline = function(url){
    var m = tw.Inline.TWITPIC_URL.exec(url);
    var content = url;
    if(m){
	return "<div><a href='" + url + "' class='url' target='_blank'>"
	    + "<img src='http://twitpic.com/show/thumb/" + m[1] + ".jpg'></div>";
    }

    return "<a href='" + url + "' class='url' target='_blank'>" + content + "</a>";
};
