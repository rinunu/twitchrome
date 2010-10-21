/**
 * user のリストを表す Timeline 
 */
tw.Users = function(store, uri, options){
    tw.ServerTimeline.call(this, store, uri, options);
};

util.extend(tw.Users, tw.ServerTimeline);

// ----------------------------------------------------------------------
// override

tw.Users.prototype.toStatuses = function(json){
    var result = [];
    for(var i = 0; i < json.length; i++){
	var user = json[i];
	var status = user.status;
	if(status){
	    status.user = user;
	    result.push(status);
	}
    }
    return result;
};

