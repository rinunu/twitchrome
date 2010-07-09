
/**
 * URL をインライン表示する
 */
tw.Inline = {};

tw.Inline.URL_RE = /https?:[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g;
tw.Inline.TWITPIC_URL = /^http:\/\/twitpic.com\/(\w+)/;

tw.Inline.inline = function(text){
    text = text.replace(tw.Inline.URL_RE, this.inlineUri);
    return text;
};

/**
 * 指定された url がインライン表示可能ならインライン化する
 * そうでなければリンクにする
 */
tw.Inline.inlineUri = function(url){
    var m = tw.Inline.TWITPIC_URL.exec(url);
    var content = url;
    if(m){
	return "<div><a href='" + url + "' class='url' target='_blank'>"
	    + "<img src='http://twitpic.com/show/thumb/" + m[1] + ".jpg' width='150' height='150'></a>"
	    + "</div>";
    }

    return "<a href='" + url + "' class='url' target='_blank'>" + content + "</a>";
};
