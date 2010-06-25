/**
 * Timeline の自動更新を行う 
 */
tw.AutoRefresh = function(){
    this.autoRefreshList = [];
};

tw.AutoRefresh.prototype.initialize = function(){
    setInterval(util.bind(this, this.onInterval), 5 * 1000);
    this.autoRefreshList.push({timeline: tw.store.homeTimeline(), interval: 60 * 1000});
    this.autoRefreshList.push({timeline: tw.store.mentions(), interval: 60 * 1000});
};

// ----------------------------------------------------------------------
// private

tw.AutoRefresh.prototype.onInterval = function(){
    for(var i = 0; i < this.autoRefreshList.length; i++){
        var a = this.autoRefreshList[i];

	var refreshedAt = a.timeline.refreshedAt();
	if(!refreshedAt || 
	   new Date() >= new Date(a.interval + refreshedAt.getTime())){
	    a.timeline.refresh();
	}
    }
};
