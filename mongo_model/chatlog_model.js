var mongoose = require('mongoose');
var uuidv4 = require('uuid/v4');

mongoose.Promise = global.Promise;
var ChatLogSchema = mongoose.Schema({
    m: String,
    u: String,
    t: Date,
});


var ChatRoomSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: uuidv4
    },
    users: [String],
    online: [String],
    logs: [ChatLogSchema]
});


module.exports = mongoose.model('chatroom', ChatRoomSchema);
