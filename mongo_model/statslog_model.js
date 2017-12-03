var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var StatsLogSchema = mongoose.Schema({
    t: {
        type: Date,
        required: true,
        default: Date.now
    },
    u: {
        type: String,
        required: true,
    },
    act: {
        type: String,
        required: true,
    },
    m: String
});


module.exports = mongoose.model('statslog', StatsLogSchema);
