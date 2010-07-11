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
    $.history.load(tw.hash(timeline));
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

/**
 * timeline.uri() を location.hash に指定できる形式へ変換する
 */
tw.hash = function(timeline){
    return timeline.uri().replace(/\//g, ".");
};

// ----------------------------------------------------------------------
// 

/**
 * Ajax 処理の優先度等を調整する
 */
tw.adjustRequest = function(command){
    // console.log("adj");

    var default_ = {maxTryCount: 3, priority: 2};
    var map = {
    	refreshTimeline: {},
    	update: {maxTryCount: 1, priority: 0},
    	favorite: {maxTryCount: 1, priority: 3},
    	unfavorite: {maxTryCount: 1, priority: 3},
    	getStatus: {priority: 1}, // TL の表示で使用するため優先度高め
    	getUser: {},
	lists: {priority: 3}
    };

    var settings = map[command.type];
    if(settings){
	command = $.extend(settings, command);
    }
    
    command = $.extend(default_, command);

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
    tw.components.popupMenu = new tw.PopupMenu();
};

/**
 * 通常時・デザイン時共通の初期化処理
 */
tw.initialize = function(){
    $("a.lightbox").fancybox({});

    tw.screenName = $(".system .screen_name").text();
    tw.csrfToken = $("input[name='csrfmiddlewaretoken']").val();
    
    tw.ajax = new tw.Ajax({adjustCommand: util.bind(this, this.adjustRequest)});
    tw.store = new tw.Store();
    tw.lists = new tw.Lists();
    tw.uriManager = new tw.UriManager();
    tw.addComponents();
};

/**
 * 本番時の初期化処理
 */
tw.initializeSystem = function(){
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

    $("a.refresh").click(
	function(){
	    tw.components.timelineView.timeline().refresh();
	});
};

/**
 * デザインモードの初期化処理
 */
tw.initializeDesign = function(){
    var timeline = $(".timeline");
    var status = $(".timeline .status").first();
    status.clone().appendTo(timeline).addClass("focus");
    status.clone().appendTo(timeline).addClass("retweet");
    for(var i = 0; i < 20; i++){
    	timeline.append(status.clone());
    }
};

$(function(){
      tw.initialize();
      tw.initializeSystem();
      // tw.initializeDesign();
});


