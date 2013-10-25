/*var fs = require('fs'),
    express = require('express'),
    port = process.env.VMC_APP_PORT || 1337,
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

app.get('/', function (request, response) {
    var content = fs.readFileSync(__dirname + '/template.html');
    response.setHeader('Content-Type', 'text/html');
    response.send(content);
});

app.listen(port);*/

var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    port = process.env.PORT || 1337,

    // Base Server Stuff
    server = http.createServer(function (req, res) {
        // your normal server code
        var path = url.parse(req.url).pathname;
        if (path === '/') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>Welcome! Ready to see <a href="/chat-room.html">the chat room</a>?</h1>');
        } else {
            fs.readFile(__dirname + path, function (err, data) {
                if (err) {
                    res.writeHead(404);
                    res.end('404');
                    return;
                }
                var extension = path.split('.').pop(),
                    contentType = {};
                switch (extension) {
                case 'css':
                    contentType['Content-Type'] = 'text/css';
                    break;
                case 'js':
                    contentType['Content-Type'] = 'application/x-javascript';
                    break;
                case 'jpg':
                case 'jpeg':
                    contentType['Content-Type'] = 'image/jpg';
                    break;
                case 'png':
                    contentType['Content-Type'] = 'image/png';
                    break;
                case 'gif':
                    contentType['Content-Type'] = 'image/gif';
                    break;
                default:
                    contentType['Content-Type'] = 'text/html';
                    break;
                }
                res.writeHead(200, contentType);
                res.end(data, 'utf8');
            });
        }
    }).listen(port),

    io = require('socket.io');

/*io.configure(function () {
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
});*/

io.of('/room')
    .on('connection', function (socket) {
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
