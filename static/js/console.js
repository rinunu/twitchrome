(function(){
     if(!window.console){
	 window.console = {};
     }

     var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
		  "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
     
     for(var i = 0; i < names.length; ++i){
	 var name = names[i];
	 if(!console[name]){
             console[name] = function(){};
	 }
     }
})();