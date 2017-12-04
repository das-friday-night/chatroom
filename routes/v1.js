var express = require('express');
var router = express.Router();

var Chatlog = require('../services/chatlog');
var S3 = require('../services/s3');

// get all exist rooms and rooms that a user joined
router.get('/rooms/:userid', function(req, res) {
    return Chatlog.getUser(req.params.userid)
        .then(data => {
            if(data) {
                return Chatlog.getAllRooms()
                    .then(rooms => {
                        return res.json({allrooms: rooms, join_rooms: data.join_room});
                    })
                    .catch(() => res.status(400).json(null));
            }
            else res.status(400).send(null);
        });
});

// enter or leave a room
router.post('/room', function(req, res) {
    /**{
    *   action: enter / leave,
    *   roomid: null / uuid,
    *   userid: email
    * }
    * */
    // sanity check of request object
    if(!req.body.action || (['enter','leave']).indexOf(req.body.action) === -1 ||
            (typeof req.body.roomid !== 'string' && req.body.roomid !== null) ||
            !req.body.userid || typeof req.body.userid !== 'string') {
        return res.status(400).send('Wrong request format');
    }

    if(req.body.action === 'enter'){
        return Chatlog.enterRoom(req.body.roomid, req.body.userid)
            .then(roomid => res.json({roomid: roomid}))
            .catch(err => res.status(400).json({roomid: null}));
    }

    if(req.body.action === 'leave'){
        return Chatlog.leaveRoom(req.body.roomid, req.body.userid)
            .then(roomid => res.json({roomid: roomid}))
            .catch(err => res.status(400).json({roomid: null}));
    }

});

// get all chat logs from a room
router.get('/logs/:roomid', function(req, res) {
    return Chatlog.fetchRoomLogs(req.params.roomid)
        .then(logs => res.json(logs))
        .catch(err => res.status(400).send(err));
});

// get all stats(logs, number of rooms, number of user)
// about the application
router.get('/stats', function(req, res) {
    return Chatlog.getAllStats()
        .then(data => res.status(200).json(data))
        .catch((err) => next(err));
});

// upload image to s3
router.post('/image', S3.uploadImage);

// router.post('/stats', function(req, res, next){
//     /**{
//     *   t: time,
//     *   u: userid,
//     *   act: string,
//     *   m: message
//     * }
//     * */
//     if(!req.body.u || !req.body.act || !req.body.m) {
//         return res.status(400).send('Wrong request format');
//     }
//     return Chatlog.logStats(req.body)
//         .then(() => res.status(200).send('success'))
//         .catch((err) => next(err));
// });


// router.post('/test', upload, function(req, res){
//     console.log(req.file);
//     return res.send('success');
// });

module.exports = router;
