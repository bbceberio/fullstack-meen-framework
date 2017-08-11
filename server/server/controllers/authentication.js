const jwt = require('jsonwebtoken'),
    User = require('../models/users'),
    slugid = require('slugid'),
    uuid = require('uuid'),
    config = require('../config/main'),
    JSONAPISerializer = require('jsonapi-serializer').Serializer,
    ErrorSerializer = new JSONAPISerializer('error', {attributes: ['error']});

function generateSlug() {
    return slugid.nice();
}

function generateUUID() {
    return uuid.v4();
}

function encodeUUID(uuid) {
    return slugid.encode(uuid); //Returns a slug
}

function decodeSlug(slug) {
    return slugid.decode(slug); //Returns a UUID
}

function generateJWT(user) {
    return jwt.sign(user, config.secret.jwt, {
        expiresIn: 600 // in seconds
    });
}

function setUserInfo(user) {
    return {
        sub: user._id,
        username: user.local.username,
        email: user.local.email
    };
}

exports.login = function (req, res) {
    if (req.user) {
        var userInfo = setUserInfo(req.user);
        var jsonWebToken = {
            token: generateJWT(userInfo)
        };
        res.status(201).json(jsonWebToken);
    } else {
        res.status(401).json({error: 'Unauthorized'});
    }
};

exports.roleAuthorization = function(role) {
    return function(req, res, next) {
        User.findById(req.user._id).exec().then(function (user) {
            if (!user) {
                res.status(422).json({ error: 'No user was found.' });
                return next('Unauthorized');
            } else if (user.role !== role) {
                res.status(401).json({ error: 'You are not authorized to access this webpage.' });
                return next('Unauthorized');
            } else {
                return next();
            }
        }).catch(function (err) {
            return next(err);
        });
    }
};

exports.authenticate = function (req) {
    if (!req.headers.authorization && req.cookies['ember_simple_auth-session']) {
        let data = req.cookies['ember_simple_auth-session'],
            cookie = JSON.parse(data),
            jsonWebToken = cookie.authenticated.token;
        req.headers.authorization = "JWT " + jsonWebToken;
    }
};

exports.generateJWT = generateJWT;