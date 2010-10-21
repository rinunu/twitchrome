util.Stopwatch = function(){
    this.last = null;
    this.start();
};

util.Stopwatch.start = function(){
    this.last = new Date();
};

util.Stopwatch.lap = function(){
    var now = new Date();
    var time = now - this.last;
    this.last = now;
    return last;
};

util.Stopwatch.printLap = function(){
    console.log("lap", this.lap());
};
