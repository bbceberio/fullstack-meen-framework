var User = require('../models/users');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
var UserSerializer = new JSONAPISerializer('users', {
    attributes: ['local', 'facebook', 'twitter', 'google']
});

exports.loginError = function (req, res) {
    let error = {};
    User.findOne({'local.username': req.body.username}).exec().then(function (user) {
        if (!user) {
            error.error = "Username invalid!";
        } else if (!user.validPassword(req.body.password)) {
            error.error = "Password invalid";
        }
        res.status(401).json(error);
    }).catch(function (err) {
        error.error = err;
        res.status(401).json(error);
    });
};

exports.signupError = function (req, res) {
    let error = {};
    if (req.body.username) {
        User.findOne({'local.username': req.body.username}).exec().then(function (user) {
            if (user) {
                error.error = "Username already exists";
            }
            res.status(401).send(error.error);
        }).catch(function (err) {
            error.error = err;
            res.status(401).json(error);
        });
    } else {
        error.error = "Username is empty";
        res.status(401).json(error);
    }
};

exports.returnUser = function (req, res) {
    if (req.user) {
        res.json(UserSerializer.serialize(req.user));
    }
};

exports.getUser = function (req, res) {
    res.json(UserSerializer.serialize(req.user));
};

exports.getUsers = function (req, res) {
    User.find({}).exec().then(function (data) {
        res.json(UserSerializer.serialize(data));
    }).catch(function (err) {
        res.json({error: err});
    });
};

exports.getUserById = function (req, res) {
    User.findById(req.params.id).exec().then(function (data) {
        res.json(UserSerializer.serialize(data));
    }).catch(function (err) {
        res.json({error: err});
    });
};

exports.updateUserById = function (req, res) {
    let deserialize = new JSONAPIDeserializer().deserialize(req.body);
    deserialize.then(function (user) {
        User.update({_id: user.id}, user).exec().then(function (data) {
            res.json(req.body);
        }).catch(function (err) {
            res.json({error: err});
        });
    }).catch(function (err) {
        res.json({error: err});
    });
};

exports.deleteUserById = function (req, res) {
    if (req.user) {
        if (req.user.id !== req.params.id) {
            var _id = req.params.id;
            User.findById(_id).remove().exec().then(function (data) {
                var page = UserSerializer.serialize({id:_id});
                res.json(page);
            }).catch(function (err) {
                res.json({error: err});
            });
        } else {
            res.json({error: 'You cannot self-terminate'});
        }
    } else {
        res.status(401).json({error: 'Unauthorized'});
    }
};

exports.unlinkLocal = function (req, res) {
    var user = req.user;
    user.local.username = undefined;
    user.local.email = undefined;
    user.save().then(function () {
        res.redirect('/profile');
    }).catch(function (err) {
        req.flash('loginMessage', err);
    });
};

exports.unlinkFacebook = function (req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save().then(function () {
        res.redirect('/profile');
    }).catch(function (err) {
        req.flash('loginMessage', err);
    });
};

exports.unlinkTwitter = function (req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save().then(function () {
        res.redirect('/profile');
    }).catch(function (err) {
        req.flash('loginMessage', err);
    });
};

exports.unlinkGoogle = function (req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save().then(function () {
        res.redirect('/profile');
    }).catch(function (err) {
        req.flash('loginMessage', err);
    });
};