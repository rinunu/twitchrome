
/**
 * 不要なキャッシュを削除する
 */
tw.Gc = function(){
};

/**
 * gc を開始する
 */
tw.Gc.prototype.gc = function(){
};

/**
 * キャッシュ情報を表示する
 */
tw.Gc.prototype.dump = function(){
    console.log("status count", tw.store.statusesCount());
    
    var timelines = tw.store.timelines();
    console.log("timeline count", timelines.length);

    for(var i = 0; i < timelines.length; i++){
	var timeline = timelines[i];
	console.log("timeline", timeline.uri(), timeline.statuses().length);
    }

    var views = tw.components.timelineView.subViews();
    for(i = 0; i < views.length; i++){
	var view = views[i];
	console.log("view", view.timeline().uri());
    }
};
