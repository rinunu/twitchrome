/**
 * アプリ全体の制御を行う
 */

tw.templates = {};
tw.components = {};

// ----------------------------------------------------------------------
// ページ切り替え

/**
 * 指定された TL を表示する
 * また、表示後 Refresh を実行する
 */
tw.showTimeline = function(timeline){
    $.history.load(timeline.uri().replace(/\//g, "."));
};

tw.onHistoryChange = function(state){
    console.log("onHistoryChange");
    // 現在の情報を保存する
    // スクロール情報は hash ではなくメモリに保存する
    var oldTimeline = tw.components.timelineView.timeline();
    if(oldTimeline){
	oldTimeline.tw_scrollState = tw.components.timelineView.scrollState();
    }

    if(state){
	var uri = state.replace(/\./g, "/");
	var timeline = tw.store.timeline(uri);
    }else{
	var timeline = tw.store.homeTimeline();
    }

    tw.components.timelineView.setTimeline(timeline);
    if(timeline.tw_scrollState){
	tw.components.timelineView.setScrollState(timeline.tw_scrollState);
    }
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
// 初期化

/**
 * 通常時・デザイン時共通の初期化処理
 */
tw.initialize = function(){
    tw.saveTemplates();
    
    // デザイン要素削除
    $(".timeline_viewport").empty();
    
    tw.ajax = new tw.Ajax();
    tw.store = new tw.Store();

    // 使用するコンポーネント登録
    tw.components.timelineView = new tw.MultiTimelineView($(".timeline_viewport"));
    tw.components.statusInput = new tw.StatusInput();

    tw.components.profileView = new tw.ProfileView();
    tw.components.background = new tw.Background();
    tw.components.mainMenu = new tw.MainMenu();
    tw.components.progressview = new tw.ProgressView();
    tw.components.autoRefresh = new tw.AutoRefresh();

    // コンポーネント初期化
    for(var a in tw.components){
        var component = tw.components[a];
	if(component.initialize){
            component.initialize();
	}
	if(component.clear){
	    component.clear();
	}
    }
    
    // 登録と初回イベント実行
    $.history.init(util.bind(this, this.onHistoryChange));
};

/**
 * 自分の情報を取得する
 */
tw.loadUser = function(){
    tw.ajax.ajax({name: "ユーザ情報の取得",
		  url: "/user.json", callback: util.bind(this, this.onLoadUser)});
};

tw.onLoadUser = function(user){
    tw.user = tw.store.addUser(user);
    tw.components.profileView.setUser(tw.user);
    tw.components.profileView.addUser(tw.user);
    
    tw.components.background.setBackground(tw.user);

    // Conversation でよく使われるため、先読み
    var send = tw.store.userTimeline(user).refresh();
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
});
