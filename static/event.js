util = util || {};

/**
 * ユーザイベントを処理する
 *
 * - イベントソースとイベントハンドラーの紐付けの管理
 * - イベントのトリガー
 */
util.Event = {};
util.Event.nextId = 1;

/**
 * {eventId : [{object, methods}]}
 */
util.Event.handlerMap = {};

/**
 * source のイベントを監視するハンドラーを追加する
 * 
 * methods は eventType とハンドラーメソッドの連想配列。
 */
util.Event.bind = function(source, object, methods){
    console.assert(source);
    console.assert(object);
    console.assert(methods);

    var id = this.getId(source);
    this.handlerMap[id] = this.handlerMap[id] || [];

    this.handlerMap[id].push({object:object, methods:methods});
};

/**
 * 対象 object をハンドラーリストから削除する
 */
util.Event.unbind = function(object){
    console.assert(object);
    for(var i in this.handlerMap){
	var handlers = this.handlerMap[i];
	for(var j = 0; j < handlers.length; ++j){
	    var handler = handlers[j];
	    if(handler.object == object){
		handlers.splice(j, 1);
		break;
	    }
	}
    }
};

/**
 * source の eventType イベントをハンドラーに通知する
 */
util.Event.trigger = function(source, eventType){
    var handlers = this.handlerMap[this.getId(source)];
    if(!handlers){
	return;
    }
    
    for(var i = 0; i < handlers.length; i++){
        var handler = handlers[i];
	var method = handler.methods[eventType];
	if(method){
	    method.call(handler.object);
	}
    }
};

// ----------------------------------------------------------------------
// private

/**
 * source を識別する ID を取得する
 */
util.Event.getId = function(source){
    console.assert(source);
    if(!source.eventId){
	source.eventId = this.nextId++;
    }
    return source.eventId;
};