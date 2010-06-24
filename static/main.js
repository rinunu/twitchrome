/**
 * アプリ全体の制御を行う
 */

tw.templates = {};

/**
 * アプリの UI を構成するオブジェクトの map
 * 
 * 以下のメソッドを持つ(持たなくても良い)
 * - clear() デザイン要素を削除する
 * - initialize() 初期化を行う
 */
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
// utility

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
// 

/**
 * Ajax 処理の優先度等を調整する
 */
tw.adjustRequest = function(command){
    // console.log("adj");

    // var map = {
    // 	refreshTimeline: {priority: 2},
    // 	update: {maxRetryCount: 0, priority: 0},
    // 	favorite: {maxRetryCount: 0, priority: 0},
    // 	unfavorite: {maxRetryCount: 0, priority: 0},
    // 	getStatus: {},
    // 	getUser: {}
    // };

    // command.name

    return command;
};

// ----------------------------------------------------------------------
// 初期化

tw.addComponents = function(){
    tw.components.timelineView = new tw.MultiTimelineView();
    tw.components.statusInput = new tw.StatusInput();
    tw.components.profileView = new tw.ProfileView();
    tw.components.background = new tw.Background();
    tw.components.mainMenu = new tw.MainMenu();
    tw.components.progressview = new tw.ProgressView();
    tw.components.autoRefresh = new tw.AutoRefresh();
};

/**
 * 通常時・デザイン時共通の初期化処理
 */
tw.initialize = function(){
    $("a.lightbox").fancybox({});

    tw.screenName = $(".system .screen_name").text();
    
    tw.ajax = new tw.Ajax({adjustCommand: util.bind(this, this.adjustRequest)});
    tw.store = new tw.Store();
    tw.addComponents();

    // デザイン要素削除/初期化
    for(var a in tw.components){
        var component = tw.components[a];
	if(component.clear){
	    component.clear();
	}
	if(component.initialize){
            component.initialize();
	}
    }

    tw.store.user(
	tw.screenName, 
	function(user){
	    // Conversation でよく使われるため、先読み
	    tw.store.userTimeline(user).refresh();
	}
    );

    // 登録と初回イベント実行
    $.history.init(util.bind(this, this.onHistoryChange));
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

$(function(){
      tw.initialize();
      // tw.initializeDesign();
});
