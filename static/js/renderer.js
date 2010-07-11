
/**
 * Status の描画を行う
 */
tw.Renderer = function(){
};

/**
 * 描画結果の HTML 要素を返す
 * 
 * element が指定された場合は、それを更新する
 * 
 * 描画が完了していない uri は elements.loadingUris に格納される
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
tw.Renderer.HASH_RE = /([^&]|^)(#\w+)/g;

/**
 * Status 表示用の Element を更新する
 */
tw.Renderer.prototype.refreshElement = function(element, status){
    console.assert(element);
    console.assert(status);

    if(status.retweeted_status && status.retweeted_status.user){
	// RT 情報はあるが user が入っていない場合は通常通り表示する(friends etc.)
	this.refreshElement(element, status.retweeted_status);
	element.addClass("retweet");
	element.find(".profile_image_rt").attr("src", status.user.profile_image_url);
	return;
    }

    element.removeClass("retweet");
    element.find(".profile_image").attr("src", status.user.profile_image_url);
    element.find(".name").text(status.user.screen_name);

    var textElem = element.find(".text");
    textElem.empty();
    textElem.html(this.formatText(status.text, status, element));

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
    }else{
	element.removeClass("in_reply_to");
    }
    
};

/**
 * テキスト内の URL などを リンクにする
 * 
 * また URL 情報を解析し、その結果を格納する
 * 
 * status.entities に情報は入っているが、使用すると遅くなりそうなので
 * 
 * 描画が完了していない場合 element.loadingUris を設定する。
 */
tw.Renderer.prototype.formatText = function(text, status, element){
    element.loadingUris = [];

    text = text.replace(tw.Renderer.USER_RE, function(s, p1, p2){
			    // in_reply_to_screen_name だけ付いてる場合があるが、それは無視する
			    if(status.in_reply_to_status_id && 
				status.in_reply_to_screen_name == p1){
				return "@<a class='user in_reply_to'>" + p1 + "</a>";
			    }else{
				return "@<a class='user'>" + p1 + "</a>";
			    }
			});

    text = text.replace(tw.Renderer.HASH_RE, "$1<a class='hash'>$2</a>");

    text = text.replace(
	tw.Renderer.URL_RE,
	function(uri){
	    var info = tw.uriManager.info(uri);
	    if(info && info.loading){
		element.loadingUris.push(uri);
	    }

	    if(info && !info.loading && info.media){
		return "<div>" + 
		    "<a href='" + uri + "' target='_blank'>" +
		    "<img src='" + info.media.uri + 
		    "' width='" + info.media.width + 
		    "' height='" + info.media.height + "'>" + 
		    "</a>" +
		    "</div>";
	    }else{
		return "<a href='" + uri + "' class='url' target='_blank'>" 
		    + uri + "</a>";
	    }
	});

    text = text.replace(/\n/g, "<br>");
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
