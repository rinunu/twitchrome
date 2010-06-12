/**
 * user のリストを表す List 
 */
tw.Users = function(url){
    tw.ServerList.call(this, url);
};

util.extend(tw.Users, tw.ServerList);

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