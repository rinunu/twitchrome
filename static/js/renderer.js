
/**
 * Status の描画を行う
 */
tw.Renderer = function(){
};

/**
 * 描画結果の HTML 要素を返す
 * 
 * element が指定された場合は、それを更新する
 */
tw.Renderer.prototype.render = function(status, element){
    element = element || tw.templates.status.clone();
    this.refreshElement(element, status);
    return element;
};

// ----------------------------------------------------------------------
// private

tw.Renderer.URL_RE = /https?:[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/g;
tw.Renderer.USER_RE = /@(\w+)/g;
tw.Renderer.HASH_RE = /([^&])(#\w+)/g;

/**
 * Status 表示用の Element を更新する
 */
tw.Renderer.prototype.refreshElement = function(element, status){
    console.assert(element);
    console.assert(status);
    
    element.find("img").attr("src", status.user.profile_image_url);
    element.find(".name").text(status.user.screen_name);

    var textElem = element.find(".text");
    textElem.empty();
    textElem.html(this.formatText(status.text, status));

    element.find(".source").html(status.source);
    element.find(".created_at").html(this.formatDate(status.created_at));

    var favorite = element.find(".favorite");
    favorite.removeClass("wait");
    favorite.removeClass("on");
    favorite.removeClass("off");
    if(status.favorited){
	favorite.addClass("on");
    }else{
	favorite.addClass("off");
    }

    if(status.replies){
	element.addClass("in_reply_to");
    }
};

/**
 * テキスト内の URL などを リンクにする
 */
tw.Renderer.prototype.formatText = function(text, status){
    text = text.replace(/\n/g, "<br>");
    text = text.replace(tw.Renderer.USER_RE, function(s, p1, p2){
			    if(status.in_reply_to_screen_name == p1){
				return "@<a class='user in_reply_to'>" + p1 + "</a>";
			    }else{
				return "@<a class='user'>" + p1 + "</a>";
			    }
			});
    text = text.replace(tw.Renderer.HASH_RE, "$1<a class='hash'>$2</a>");
    
    text = text.replace(tw.Renderer.URL_RE, tw.Inline.inline);
    return text;
};

/**
 * 
 */
tw.Renderer.prototype.formatDate = function(date){
    var t = new Date(date);
    date = [t.getHours(), t.getMinutes(), t.getSeconds()];
    for(var i = 0; i < date.length; i++){
	date[i] = (date[i] >= 10) ? date[i] : "0" + date[i];
    }
    return date.join(":");
};
