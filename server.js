var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    Gearman = require("node-gearman"),
    gearman = new Gearman();

app.listen(80);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/static/index.html');
});

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('documentor', function (data) {
        console.log(data);
        
        var job = gearman.submitJob("documentor", JSON.stringify(data));
        
        job.on("data", function(data){
            socket.emit('log', { html: data.toString("utf-8") });
        });
        
        job.on("end", function(){
            socket.emit('log', { ready: true });
        });
        
        job.on("error", function(error){
            socket.emit('log', { error: error.message });
        });
        
        job.setTimeout(16*60*1000, function(){
            socket.emit('log', { error: "Timeout exceeded" });
        }); 
        
    });
});