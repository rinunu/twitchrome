/**
 * デバッグ用の表示を行う
 */
tw.DebugView = function(){
    this.element_ = $('<div class="debug frame">debug</div>').insertAfter($(".profile"));
    $('<a class="button">Dump</a>').appendTo(this.element_);
    $('<a class="button">start</a>').appendTo(this.element_).click(
	function(){
	    util.Event.trigger(tw.ajax, "start", {name: "test"});
	}
    );
    $('<a class="button">end</a>').appendTo(this.element_).click(
	function(){
	    util.Event.trigger(tw.ajax, "end");
	}
    );
};

/**
 *
 */
tw.DebugView.prototype.initialize = function(){
};
