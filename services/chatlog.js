// Mongoose async operations, like .save() and queries, return promises

var Chatlog = require('../mongo_model/chatlog_model');
var pgp = require('pg-promise')();

const db = pgp('postgres://chatroom:chatroom@chatroom2.czmbmay6wiwj.us-west-1.rds.amazonaws.com:5432/chatroom');


/*
*   roomid: {
*       if null
*           create a new room
*       else
*           if action==enter
*               enter room
*           else
*               if you are the last one
*                   delete room
*               else
*                   leave room
*   },
*/

var getUser = function(userid){
    if(typeof userid !== 'string') {
        return Promise.reject(new Error('wrong userid format'));
    }

    return db.any({
        name: 'find-user',
        text: 'SELECT * FROM users WHERE id=$1 limit 1',
        values: [userid]
    }).then(data => {
        return data.length === 0 ? null : data[0];
    }).catch(err => {
        console.log(err);
        return err;
    });
};

var getRoom = function(roomid){
    if(typeof roomid !== 'string') {
        return Promise.reject(new Error('wrong roomid format'));
    }
    return Chatlog.findById(roomid).then(data => {
        return data ? roomid : null;
    });
};

var getAllRooms = function(){
    return Chatlog.find({}, '_id');
}

var enterUserJoinRoom = function(roomid, userid){
    if(typeof roomid !== 'string' || typeof userid !== 'string'){
        return Promise.reject(new Error('wrong roomid or userid'));
    }

    return db.any({
        name: 'enter-user-join-room',
        text: 'UPDATE users SET join_room = array_append(join_room, $1) WHERE id=$2',
        values: [roomid, userid]
    }).then(() => roomid).catch(err => {
        console.log(err);
        return err;
    });
};

var enterChatRoom = function(roomid, userid){
    if(typeof roomid !== 'string' || typeof userid !== 'string'){
        return Promise.reject(new Error('wrong roomid or userid'));
    }

    return Chatlog.findByIdAndUpdate(roomid, {$push: {users: userid}})
        .then(() => roomid)
        .catch(err => {
            console.log(err);
            return err;
        });
};

var createChatRoom = function(userid){
    if(typeof userid !== 'string') {
        return Promise.reject(new Error('wrong userid format'));
    }

    var chatlog = new Chatlog({ users: [userid] });

    return chatlog.save()
        .then(room => {
            return enterUserJoinRoom(room._id, userid)
        })
        .catch(err => {
            console.log(err);
            return err;
        });
};

var enterRoom = function(roomid, userid) {
    if(!userid) return Promise.reject(new Error('missing userid'));

    return getUser(userid)
        .then(user => {
            if(user){
                // first time enter the room
                if(roomid === null) return createChatRoom(userid);
                // user has entered the room already
                if (user.join_room.indexOf(roomid) !== -1) return roomid;
                // write user id in chatroom online field and users join_room field
                return getRoom(roomid)
                    .then(room => {
                        if(room) return enterUserJoinRoom(roomid, userid);
                        else return room;
                    })
                    .then(room => {
                        if(room) return enterChatRoom(roomid, userid);
                        else return room;
                    });
            }
            else {
                return Promise.reject(new Error('non-existent user'));
            }
        })
        .catch(err => {
            return err;
        });
};

var leaveChatRoom = function (roomid, userid) {
    if(typeof roomid !== 'string' || typeof userid !== 'string'){
        return Promise.reject(new Error('wrong roomid or userid'));
    }

    return Chatlog.findByIdAndUpdate(roomid, {$pull: {users: userid}}, {fields: 'users'})
        .then(room => {
            /* room is:
             * the pre-modification document if the query matches a document;
             * null if the query does not match a document;
             */
            if(room && room.users.indexOf(userid) !== -1){
                if(room.users.length === 1) return Chatlog.deleteOne({_id: roomid}).then(()=>'room deleted');
                else return roomid;
            }
            else {
                return Promise.reject(new Error('roomid not exist or userid not in room'));
            }
        })
        .catch(err => {
            console.log(err);
            return err;
        })
};

var leaveUserJoinRoom = function (roomid, userid) {
    if(typeof roomid !== 'string' || typeof userid !== 'string'){
        return Promise.reject(new Error('wrong roomid or userid'));
    }

    return db.any({
        name: 'leave-user-join-room',
        text: 'UPDATE users SET join_room = array_remove(join_room, $1) WHERE id=$2',
        values: [roomid, userid]
    })
    .then(() => {
        return roomid;
    })
    .catch(err => {
        console.log(err);
        return err;
    });
};

var leaveRoom = function (roomid, userid) {
    if(typeof roomid !== 'string' || typeof userid !== 'string'){
        return Promise.reject(new Error('wrong roomid or userid'));
    }
    return leaveUserJoinRoom(roomid, userid)
        .then(roomid => leaveChatRoom(roomid, userid))
        .catch(err => err);
};

var logMessage = function (roomid, userid, message) {
    if(typeof roomid !== 'string' || typeof userid !== 'string' || typeof message !== 'string'){
        return Promise.reject(new Error('input format'));
    }
    var msg = {u: userid, m: message, t: Date.now()};
    return Chatlog.findByIdAndUpdate(roomid, {$push: {logs: msg}})
        .then(() => 's')
        .catch((err) => {
            console.log(err);
            return 'f';
        });
};

module.exports = {
    getAllRooms,getAllRooms,
    getUser: getUser,
    logMessage: logMessage,
    enterRoom: enterRoom,
    leaveRoom: leaveRoom
};