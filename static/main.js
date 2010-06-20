tw.templates = {};
tw.components = {};

// ----------------------------------------------------------------------
// commands

/**
 * 指定された TL を表示する
 * また、表示後 Refresh を実行する
 */
tw.showTimeline = function(timeline){
    tw.components.timelineView.setTimeline(timeline);
    timeline.refresh();
};

// ----------------------------------------------------------------------
// private

tw.saveTemplates = function(){
    tw.templates.status = $(".timeline .status").first().clone();
};

/**
 * リンクにクリック時の処理をセットする
 */
tw.setCommand = function(elem, func){
    elem.click(
	function(event){
	    event.preventDefault();
	    func(event);
	});
};

// ----------------------------------------------------------------------
// debug

function start(){
    util.Event.trigger(tw.ajax, "start", {name: "test"});
}

function end(){
    util.Event.trigger(tw.ajax, "end", {name: "test"});
}

// ----------------------------------------------------------------------
// 初期化

/**
 * 通常時・デザイン時共通の初期化処理
 */
tw.initialize = function(){
    tw.saveTemplates();
    
    // デザイン要素削除
    $(".timeline_container").empty();
    
    tw.ajax = new tw.Ajax();
    tw.store = new tw.Store();

    // 使用するコンポーネント登録
    tw.components.timelineView = new tw.MultiTimelineView($(".timeline_container"));
    tw.components.statusInput = new tw.StatusInput();

    tw.components.profileView = new tw.ProfileView();
    tw.components.background = new tw.Background();
    tw.components.sidebar = new tw.Sidebar();
    tw.components.progressview = new tw.ProgressView();
    tw.components.autoRefresh = new tw.AutoRefresh();

    // コンポーネント初期化
    for(var a in tw.components){
        var component = tw.components[a];
        component.initialize();
	if(component.clear){
	    component.clear();
	}
    }
};

/**
 * 自分の情報を取得する
 */
tw.loadUser = function(){
    tw.ajax.ajax({name: "ユーザ情報の取得",
		  url: "/user.json", callback: util.bind(this, this.onLoadUser)});
};

tw.onLoadUser = function(user){
    tw.user = user;
    tw.store.addUser(user);
    tw.components.profileView.setUser(tw.user);
    tw.components.profileView.addUser(tw.user);
    
    tw.components.background.setBackground(tw.user);
    var send = tw.store.userTimeline(user);
};

/**
 * デザイン時の初期化処理
 */
tw.initializeDesign = function(){
    var timelineView = $(".timeline");
    for(var i = 0; i < 20; i++){
	timelineView.append(this.templates.status.clone());
    }
};

$(function() {
      $("a.lightbox").fancybox({
      });
});

$(function(){
      tw.initialize();
      // tw.initializeDesign();
    
      tw.loadUser();
      tw.showTimeline(tw.store.homeTimeline());
});
