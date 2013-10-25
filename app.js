var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    app = express(),
    port = process.env.VMC_APP_PORT || 3000,
    server = app.listen(port),
    io = require('socket.io').listen(server);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

io.of('/room')
    .on('connection', function (socket) {
        console.log('connection!');
        var joinedRoom = null;
        socket.on('join room', function (data) {
            socket.join(data);
            joinedRoom = data;
            socket.emit('joined', 'you\'ve joined ' + data);
            socket.broadcast.to(joinedRoom).send('someone joined room');
        });
        socket.on('fromclient', function (data) {
            if (joinedRoom) {
                socket.broadcast.to(joinedRoom).send(JSON.stringify(data));
            } else {
                socket.send(
                    'You\'re not joined a room.' +
                    'Select a room and then push join.'
                );
            }
        });
        socket.on('leave', function (data) {
            socket.leave(data);
            socket.emit('leave room', JSON.stringify({
                success: true,
                roomLeaved: data
            }));
        });
    });

    console.log('Express server listening on port: ' + port);