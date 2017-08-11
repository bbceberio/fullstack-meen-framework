var mongoose = require('mongoose');
var uuid = require('node-uuid');

var refreshTokenSchema = mongoose.Schema({
    userId: {type: String},
    token: {type: String, default: uuid.v4()},
    createdAt: {type: Date, default: Date.now},
    consumed: {type: Boolean, default: false}
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);