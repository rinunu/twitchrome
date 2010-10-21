function showNotification(){
    var n, wn = webkitNotifications;
    wn.requestPermission(function(){
			     n = wn.createNotification('', 'title', 'body');
			     n.show();
			 });
}

function showNotification2(){
    var n, wn = webkitNotifications;
    n = wn.createNotification('', 'title', 'body');
    n.show();
}
