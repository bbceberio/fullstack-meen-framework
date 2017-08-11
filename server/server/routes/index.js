const express = require('express'),
    router = express.Router();

function isEmptyObject(obj) {
    return JSON.stringify(obj) === '{}';
}

router.get('/', function (req, res) {
    var model = {
        title: 'Express',
        isLoggedIn: req.isAuthenticated()
    };
    if (req.isAuthenticated() && req.user) {
        if (!req.user.local.username) {
            if (!isEmptyObject(req.user.twitter)) {
                model.username = req.user.twitter.username;
            } else if (!isEmptyObject(req.user.facebook)) {
                model.username = req.user.facebook.name;
            } else if (!isEmptyObject(req.user.google)) {
                model.username = req.user.google.name;
            } else {
                model.username = req.user._id;
            }
        } else {
            model.username = req.user.local.username;
        }
    }
    res.render('index', model);
});

module.exports = router;
