var s_io = require('socket.io');

var Chatlog = require('./chatlog');

module.exports = function (server) {
    var io = s_io(server);
    var socketIdToRoom = {};
    var socketIdToUserId = {};
    var rooms = {};

    io.on('connection', function(socket){
        console.log(socket.id + ' connected +++++++++++++++');
        var info = socket.handshake.query;
        socketIdToRoom[socket.id] = info.r;
        socketIdToUserId[socket.id] = info.u;

        if(!rooms[info.r]){
            rooms[info.r] = new Set([socket.id]);
        }
        else{
            rooms[info.r].add(socket.id);
        }

        socket.on('disconnect', function(){
            var roomid = socketIdToRoom[socket.id];
            rooms[roomid].delete(socket.id);
            if(rooms[roomid].size === 0) delete rooms[roomid];
            delete socketIdToRoom[socket.id];
            delete socketIdToUserId[socket.id];
            console.log(socket.id + ' disconnect ---------------');
        });

        socket.on('chat', function(msg){
            Chatlog.logMessage(socketIdToRoom[socket.id], info.u, msg)
                .then(() => {broadcast('chat', msg)});
            Chatlog.logStats({userid: info.u, action: "said", message: msg})
                .then((data) => {io.emit('stats', data)});
        });

        socket.on('stats', function(msg){
            Chatlog.logStats(msg)
                .then(data => io.emit('stats', data));
        });

        var broadcast = function(eventName, msg){
            if(eventName === 'chat'){
                rooms[socketIdToRoom[socket.id]]
                    .forEach(function(sid){
                        io.to(sid).emit(eventName, {u: socketIdToUserId[socket.id], m: msg});
                    })
            }
        }
    });
};

