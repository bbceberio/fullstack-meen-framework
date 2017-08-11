var mongoose = require('mongoose');

var pageSchema = mongoose.Schema({
    title: String,
    uri: String,
    name: String,
    content: String,
    'created-on': {type: Date, default: Date.now},
    'modified-on': {type: Date, default: Date.now},
    'is-active': {type: Boolean}
});

module.exports = mongoose.model('Page', pageSchema);