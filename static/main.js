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
    
    // コンポーネント初期化
    for(var a in tw.components){
        var component = tw.components[a];
        component.initialize();
    }
};

/**
 * 自分の情報を取得する
 */
tw.loadUser = function(){
    $.getJSON("/user.json", {}, util.bind(this, this.onLoadUser));
};

tw.onLoadUser = function(user){
    tw.user = user;
    tw.components.profileView.setUser(tw.user);
    tw.components.background.setBackground(tw.user);
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
      var homeTimeline = tw.store.homeTimeline();
      var mentions = tw.store.mentions();
      tw.ajax.addAutoRefresh(homeTimeline);
      tw.ajax.addAutoRefresh(mentions);
      // this.timelines.sent = new tw.ServerTimeline("/statuses/user_timeline.json");
      tw.showTimeline(homeTimeline);
});
