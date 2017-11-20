var express = require('express');
var router = express.Router();

var Chatlog = require('../services/chatlog');

router.post('/room', function(req, res, next) {
    /*
    * {
    *   action: enter / leave,
    *   roomid: null / uuid,
    *   userid: email
    * }
    * */

    if(!req.body.action || (['enter','leave']).indexOf(req.body.action) === -1 ||
            (typeof req.body.roomid !== 'string' && req.body.roomid !== null) ||
            !req.body.userid || typeof req.body.userid !== 'string') {
        return res.status(400).send('Wrong request format');
    }

    if(req.body.action === 'enter'){
        return Chatlog.enterRoom(req.body.roomid, req.body.userid)
            .then(roomid => res.json({roomid: roomid}))
            .catch(err => res.json({roomid: null}));
    }

    if(req.body.action === 'leave'){
        return Chatlog.leaveRoom(req.body.roomid, req.body.userid)
            .then(roomid => res.json({roomid: roomid}))
            .catch(err => res.json({roomid: null}));
    }

});

router.get('/logs/:roomid', function(req, res, next) {
    return Chatlog.fetchRoomLogs(req.params.roomid)
        .then(logs => res.json(logs))
        .catch(err => res.json({logs: []}));
});

router.get('/user/:id', function(req, res) {
    return Chatlog.getUser(req.params.id)
        .then(data => {
            if(data) {
                return Chatlog.getAllRooms()
                    .then(rooms => {
                        return res.json({allrooms: rooms, join_rooms: data.join_room});
                    })
                    .catch(() => res.json(null));
            }
            else res.send(null);
        });
});

// router.get('/test', function(req, res){
//     return Chatlog.fetchRoomMessage('')
//         .then(logs => res.json(logs))
//         .catch(err => res.json({logs: null}));
// });


module.exports = router;
