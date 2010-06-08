// -*- coding: utf-8 -*-

var util = {};

/**
 * sub のプロトタイプチェーンに super_.prototype を入れる。
 */
util.extend = function(sub, super_){
    function f(){};
    f.prototype = super_.prototype;
    sub.prototype = new f();
    sub.prototype.super_ = super_.prototype;
};

util.bind = function(this_, method){
    console.assert(this_);
    console.assert(typeof(method) == "function");
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
	var args2 = Array.prototype.slice.call(arguments);
	return method.apply(this_, args.concat(args2));
    };
};

util.setCaretPosition = function(textarea, pos){
    if(textarea[0].setSelectionRange){
	textarea[0].setSelectionRange(pos, pos);
    }
};

