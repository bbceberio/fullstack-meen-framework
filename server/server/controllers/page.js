var Page = require('../models/pages.js');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
var PageSerializer = new JSONAPISerializer('pages', {
    attributes: [
        'title',
        'uri',
        'name',
        'content',
        'created-on',
        'modified-on',
        'is-active'
    ]
});

exports.getPages = function (req, res) {
    Page.find({}).exec().then(function (data) {
        res.json(PageSerializer.serialize(data));
    }).catch(function (err) {
        res.json({error: err});
    });
};

exports.getPageById = function (req, res) {
    Page.findById(req.params.id).exec().then(function (data) {
        res.json(PageSerializer.serialize(data));
    }).catch(function (err) {
        res.json({error: err});
    });
};

exports.updatePageById = function (req, res) {
    let deserialize = new JSONAPIDeserializer().deserialize(req.body);
    deserialize.then(function (page) {
        console.log(page);
        Page.update({_id: page.id}, page).exec().then(function (data) {
            res.json(req.body);
        }).catch(function (err) {
            res.json({error: err});
        });
    }).catch(function (err) {
        res.json({error: err});
    });
};

exports.deletePageById = function (req, res) {
    var _id = req.params.id;
    Page.findById(_id).remove().exec().then(function (data) {
        var page = PageSerializer.serialize({id:_id});
        res.json(page);
    }).catch(function (err) {
        res.json({error: err});
    });
};

exports.addPage = function (req, res) {
    var deserialize = new JSONAPIDeserializer().deserialize(req.body);
    deserialize.then(function (page) {
        var promise = new Page(page).save();
        promise.then(function (data) {
            res.json(PageSerializer.serialize(data));
        }).catch(function (err) {
            res.json({error: err});
        });
    }).catch(function (err) {
        res.json({error: err});
    });
};
