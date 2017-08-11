var express = require('express'),
    router = express.Router(),
    passport = require('passport');

router.get('/signup', function(req, res, next) {
    res.render('signup', { title: 'Sign Up' });
});
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

module.exports = router;