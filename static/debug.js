// ----------------------------------------------------------------------
// debug

function start(){
    util.Event.trigger(tw.ajax, "start", {name: "test"});
}

function end(){
    util.Event.trigger(tw.ajax, "end", {name: "test"});
}

