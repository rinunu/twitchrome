tw.templates = {};
tw.lists = {};
tw.components = {};

// ----------------------------------------------------------------------
// commands

/**
 * 表示しているリストを更新する
 */
tw.refreshList = function(){
    tw.components.mainListView.list().refresh();
};

/**
 * 指定されたユーザの TL を表示する
 * user は User もしくは screen_name
 */
tw.showUserTimeline = function(user){
    console.log("show", user);
    var list = tw.store.getUserTimeline(user);
    tw.showTimeline(list);
    if(user.id){
	tw.components.background.setBackground(user);
    }
};

/**
 * 指定された TL を表示する
 * また、表示後 Refresh を実行する
 */
tw.showTimeline = function(timeline){
    tw.components.mainListView.setList(timeline);
    timeline.refresh();
};

// ----------------------------------------------------------------------
// private

tw.saveTemplates = function(){
    tw.templates.status = $(".main_list .status").first().clone();
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
    $("html").ajaxError(function(event, xhr){
			    console.error("ajax error", xhr);
			    $.jGrowl("通信に失敗しました: " + xhr.statusText);
			});
    
    tw.saveTemplates();
    
    // デザイン要素削除
    $(".main_list").empty();
    
    tw.store = new tw.Store();

    // 使用するコンポーネント登録
    tw.components.mainListView = new tw.ListView($(".main_list"));
    tw.components.statusInput = new tw.StatusInput();
    tw.components.profileView = new tw.ProfileView();
    tw.components.background = new tw.Background();
    tw.components.sidebar = new tw.Sidebar();
    
    // コンポーネント初期化
    for(var a in tw.components){
        var component = tw.components[a];
        component.initialize();
    }

    tw.setCommand($(".list_actions .refresh"), util.bind(this, this.refreshList));
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
    var mainList = $(".main_list");
    for(var i = 0; i < 20; i++){
	mainList.append(this.templates.status.clone());
    }
};

$(function(){
      tw.initialize();
      // tw.initializeDesign();
    
      tw.loadUser();
      tw.lists.homeTimeline = tw.store.createHomeTimeline();
      tw.lists.mentions = tw.store.createMentions();
      tw.showTimeline(tw.lists.homeTimeline);
});
