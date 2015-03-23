var express = require('express'),
    http = require('http'),
    socketIO = require('socket.io'),
    favicon = require('serve-favicon'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    routes = require('./routes'),
    http = require('http'),

    app = express(),

    port = process.env.PORT || 1337,

    server = http.Server(app),
    io = socketIO(server);

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// io.of('/room')
io.sockets.on('connection', function (socket) {

    var joinedRoom = null;

    socket.on('join room', function (data) {

        joinedRoom = data.room;
        socket.join(joinedRoom);

        socket.emit('joined', 'you\'ve joined ' + joinedRoom);

        socket.broadcast.to(joinedRoom).send(JSON.stringify({
            "msg": data.userName + " has joined",
            "from": "From server"
        }));

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

        // data.room is the name of the room (i.e. room 1)
        socket.broadcast.to(joinedRoom).send(JSON.stringify({
            "msg": data.userName + " left the room",
            "from": "From server"
        }));

        socket.leave(data.room, function (err) {

            if (!err) {

                joinedRoom = null;

                socket.emit('leave room', JSON.stringify({
                    success: true
                }));
            } else {
                console.log('Error on leave: ', err);
            }
        });

    });
});

module.exports = app;
