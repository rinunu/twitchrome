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
 * Home TL を表示する
 */
tw.showHomeTimeline = function(){
    tw.components.mainListView.setList(tw.lists.homeTimeline);
};

/**
 * Mentions TL を表示する
 */
tw.showMentions = function(){
    tw.components.mainListView.setList(tw.lists.mentions);
};

/**
 * 指定されたユーザの TL を表示する
 * user は User もしくは screen_name
 */
tw.showUserTimeline = function(user){
    console.log("show", user);
    var list = tw.store.createUserTimeline(user);
    tw.components.mainListView.setList(list);
    list.refresh();
    if(user.id){
	tw.components.background.setBackground(user);
    }
};

/**
 * 指定されたユーザの favorites を表示する
 * userId が指定されなかった場合は、自分のものを表示する
 */
tw.showFavorites = function(userId){
    var list = tw.store.createFavorites(userId);
    tw.components.mainListView.setList(list);
    list.refresh();
};

// ----------------------------------------------------------------------
// private

tw.saveTemplates = function(){
    tw.templates.status = $(".main_list .status").first().clone();
};

/**
 * 一時
 */
tw.refresh = function(){
    for(var a in tw.lists){
        var list = tw.lists[a];
        list.refresh();
    }
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
    $("html").ajaxError(function(){
			    console.error("ajax error");
			});
    
    tw.saveTemplates();
    
    // デザイン要素削除
    $(".main_list").empty();
    
    // リスト生成
    tw.store = new tw.Store();
    tw.lists.homeTimeline = tw.store.createHomeTimeline();
    tw.lists.mentions = tw.store.createMentions();

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
    tw.components.profileView.setUser(user);
    tw.components.background.setBackground(user);
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
      tw.showHomeTimeline();
      tw.refresh();
});
