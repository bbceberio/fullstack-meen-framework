const LocalStrategy = require('passport-local').Strategy,
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    User = require('../models/users'),
    twitterOptions = require('./twitter'),
    facebookOptions = require('./facebook'),
    googleOptions = require('./google'),
    config = require('./main');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id).exec().then(function (user) {
            done(null, user);
        }).catch(function (err) {
            done(err);
        });
    });

    let localSignUpFlash = new LocalStrategy({passReqToCallback: true},
        function (req, username, password, done) {
            let email;
            if (req.body.email) {
                email = req.body.email.toLowerCase();
            }
            process.nextTick(function () {
                User.findOne({
                    $or: [
                        {'local.email': email},
                        {'local.username': username}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (user.local.email === email) {
                            return done(null, false, req.flash('loginMessage', 'Email was taken'));
                        } else if (user.local.username === username) {
                            return done(null, false, req.flash('loginMessage', 'Username was taken'));
                        }
                    } else {
                        let newUser = new User();
                        if (req.user) {
                            user = req.user;
                            user.local.username = username;
                            user.local.email = email;
                            user.local.password = newUser.generateHash(password);
                            user.local.token = newUser.generateToken();

                            user.save().then(function (data) {
                                return done(null, data);
                            }).catch(function (err) {
                                return done(err);
                            });
                        } else {
                            newUser.local.email = req.body.email;
                            newUser.local.username = username;
                            newUser.local.password = newUser.generateHash(password);
                            newUser.local.token = newUser.generateToken();

                            newUser.save().then(function (usr) {
                                return done(null, usr);
                            }).catch(function (err) {
                                return done(err);
                            });
                        }
                    }
                }).catch(function (error) {
                    return done(error);
                });
            });
        }
    );
    let localSignUp = new LocalStrategy({passReqToCallback: true},
        function (req, username, password, done) {
            let email;
            if (req.body.email) {
                email = req.body.email.toLowerCase();
            }
            process.nextTick(function () {
                User.findOne({
                    $or: [
                        {'local.email': email},
                        {'local.username': username}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (user.local.email === email) {
                            return done(null, false);
                        } else if (user.local.username === username) {
                            return done(null, false);
                        }
                    } else {
                        let newUser = new User();
                        newUser.local.email = req.body.email;
                        newUser.local.username = username;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.token = newUser.generateToken();

                        newUser.save().then(function (usr) {
                            return done(null, usr);
                        }).catch(function (err) {
                            return done(err);
                        });
                    }
                }).catch(function (error) {
                    return done(error);
                });
            });
        }
    );
    let localLogIn = new LocalStrategy({session: false}, function (username, password, done) {
        process.nextTick(function() {
            User.findOne({'local.username': username}).exec().then(function (user) {
                if (!user) {
                    return done(null, false);
                } else if (!user.validPassword(password)) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            }).catch(function (err) {
                return done(err);
            });
        });
    });
    let localLogInFlash = new LocalStrategy({passReqToCallback: true}, function (req, username, password, done) {
        process.nextTick(function() {
            User.findOne({'local.username': username}).exec().then(function (user) {
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'Username not found'));
                } else if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Wrong password'));
                } else {
                    return done(null, user);
                }
            }).catch(function (err) {
                return done(err);
            });
        });
    });

    let twitterLogIn = new TwitterStrategy(twitterOptions, function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({
                    $or: [
                        {'twitter.id': profile.id},
                        {'twitter.token': token}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (!user.twitter.token) {
                            user.twitter.id = profile.id;
                            user.twitter.token = token;
                            user.twitter.username = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save().then(function (data) {
                                return done(null, data);
                            }).catch(function (err) {
                                return done(err);
                            });
                        } else {
                            return done(null, user);
                        }
                    } else {
                        let newUser = new User();
                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    }
                }).catch(function (err) {
                    return done(err);
                });
            } else {
                let user = req.user; // pull the user out of the session
                if (user.twitter.id === profile.id) {
                    if (!user.twitter.token) {
                        user.twitter.id = profile.id;
                        user.twitter.token = token;
                        user.twitter.username = profile.username;
                        user.twitter.displayName = profile.displayName;

                        user.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    } else {
                        return done(null, user);
                    }
                } else {
                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

                    user.save().then(function (data) {
                        return done(null, data);
                    }).catch(function (err) {
                        return done(err);
                    });
                }
            }
        });
    });
    let twitterConnectOptions = twitterOptions;
    twitterConnectOptions['callbackURL'] = 'http://127.0.0.1:3000/connect/twitter/callback';
    let twitterConnect = new TwitterStrategy(twitterConnectOptions, function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({
                    $or: [
                        {'twitter.id': profile.id},
                        {'twitter.token': token}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (!user.twitter.token) {
                            user.twitter.id = profile.id;
                            user.twitter.token = token;
                            user.twitter.username = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save().then(function (data) {
                                return done(null, data);
                            }).catch(function (err) {
                                return done(err);
                            });
                        } else {
                            return done(null, user);
                        }
                    } else {
                        let newUser = new User();
                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    }
                }).catch(function (err) {
                    return done(err);
                });
            } else {
                let user = req.user; // pull the user out of the session
                if (user.twitter.id === profile.id) {
                    if (!user.twitter.token) {
                        user.twitter.id = profile.id;
                        user.twitter.token = token;
                        user.twitter.username = profile.username;
                        user.twitter.displayName = profile.displayName;

                        user.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    } else {
                        return done(null, user);
                    }
                } else {
                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

                    user.save().then(function (data) {
                        return done(null, data);
                    }).catch(function (err) {
                        return done(err);
                    });
                }
            }
        });
    });

    let facebookLogIn = new FacebookStrategy(facebookOptions, function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({
                    $or: [
                        {'facebook.id': profile.id},
                        {'facebook.token': token}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (!user.facebook.token) {
                            user.facebook.id = profile.id;
                            user.facebook.token = token;
                            user.facebook.email = profile.emails[0].value;
                            user.facebook.name = profile.displayName;

                            user.save().then(function (data) {
                                return done(null, data);
                            }).catch(function (err) {
                                return done(err);
                            });
                        } else {
                            return done(null, user);
                        }
                    } else {
                        let newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.email = profile.emails[0].value;
                        newUser.facebook.name = profile.displayName;

                        newUser.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    }
                }).catch(function (err) {
                    return done(err);
                });
            } else {
                let user = req.user; // pull the user out of the session
                if (user.facebook.id === profile.id) {
                    if (!user.facebook.token) {
                        user.facebook.id = profile.id;
                        user.facebook.token = token;
                        user.facebook.email = profile.emails[0].value;
                        user.facebook.name = profile.displayName;

                        user.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    } else {
                        return done(null, user);
                    }
                } else {
                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.email = profile.emails[0].value;
                    user.facebook.name = profile.displayName;

                    user.save().then(function (data) {
                        return done(null, data);
                    }).catch(function (err) {
                        return done(err);
                    });
                }
            }
        });
    });

    let facebookConnectOptions = facebookOptions;
    facebookConnectOptions['callbackURL'] = 'http://127.0.0.1:3000/connect/facebook/callback';
    let facebookConnect = new FacebookStrategy(
        facebookConnectOptions, function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({
                    $or: [
                        {'facebook.id': profile.id},
                        {'facebook.token': token}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (!user.facebook.token) {
                            user.facebook.id = profile.id;
                            user.facebook.token = token;
                            user.facebook.email = profile.emails[0].value;
                            user.facebook.name = profile.displayName;

                            user.save().then(function (data) {
                                return done(null, data);
                            }).catch(function (err) {
                                return done(err);
                            });
                        } else {
                            return done(null, user);
                        }
                    } else {
                        let newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.email = profile.emails[0].value;
                        newUser.facebook.name = profile.displayName;

                        newUser.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    }
                }).catch(function (err) {
                    return done(err);
                });
            } else {
                let user = req.user; // pull the user out of the session
                if (user.facebook.id === profile.id) {
                    if (!user.facebook.token) {
                        user.facebook.id = profile.id;
                        user.facebook.token = token;
                        user.facebook.email = profile.emails[0].value;
                        user.facebook.name = profile.displayName;

                        user.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    } else {
                        return done(null, user);
                    }
                } else {
                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.email = profile.emails[0].value;
                    user.facebook.name = profile.displayName;

                    user.save().then(function (data) {
                        return done(null, data);
                    }).catch(function (err) {
                        return done(err);
                    });
                }
            }
        });
    });

    let googleLogIn = new GoogleStrategy(googleOptions, function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({
                    $or: [
                        {'google.id': profile.id},
                        {'google.token': token}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (!user.google.token) {
                            user.google.id = profile.id;
                            user.google.token = token;
                            user.google.email = profile.emails[0].value;
                            user.google.name = profile.displayName;

                            user.save().then(function (data) {
                                return done(null, data);
                            }).catch(function (err) {
                                return done(err);
                            });
                        } else {
                            return done(null, user);
                        }
                    } else {
                        let newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.email = profile.emails[0].value;
                        newUser.google.name = profile.displayName;

                        newUser.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    }
                }).catch(function (err) {
                    return done(err);
                });
            } else {
                let user = req.user; // pull the user out of the session
                if (user.google.id === profile.id) {
                    if (!user.google.token) {
                        user.google.id = profile.id;
                        user.google.token = token;
                        user.google.email = profile.emails[0].value;
                        user.google.name = profile.displayName;

                        user.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    } else {
                        return done(null, user);
                    }
                } else {
                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.email = profile.emails[0].value;
                    user.google.name = profile.displayName;

                    user.save().then(function (data) {
                        return done(null, data);
                    }).catch(function (err) {
                        return done(err);
                    });
                }
            }
        });
    });

    let googleConnectOptions = googleOptions;
    googleConnectOptions['callbackURL'] = 'http://127.0.0.1:3000/connect/google/callback';
    let googleConnect = new GoogleStrategy(googleConnectOptions, function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({
                    $or: [
                        {'google.id': profile.id},
                        {'google.token': token}
                    ]
                }).exec().then(function (user) {
                    if (user) {
                        if (!user.google.token) {
                            user.google.id = profile.id;
                            user.google.token = token;
                            user.google.email = profile.emails[0].value;
                            user.google.name = profile.displayName;

                            user.save().then(function (data) {
                                return done(null, data);
                            }).catch(function (err) {
                                return done(err);
                            });
                        } else {
                            return done(null, user);
                        }
                    } else {
                        let newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.email = profile.emails[0].value;
                        newUser.google.name = profile.displayName;

                        newUser.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    }
                }).catch(function (err) {
                    return done(err);
                });
            } else {
                let user = req.user; // pull the user out of the session
                if (user.google.id === profile.id) {
                    if (!user.google.token) {
                        user.google.id = profile.id;
                        user.google.token = token;
                        user.google.email = profile.emails[0].value;
                        user.google.name = profile.displayName;

                        user.save().then(function (data) {
                            return done(null, data);
                        }).catch(function (err) {
                            return done(err);
                        });
                    } else {
                        return done(null, user);
                    }
                } else {
                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.email = profile.emails[0].value;
                    user.google.name = profile.displayName;

                    user.save().then(function (data) {
                        return done(null, data);
                    }).catch(function (err) {
                        return done(err);
                    });
                }
            }
        });
    });

    let jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: config.secret.jwt,
        session: true,
        ignoreExpiration: false
    };
    let jwtLogIn = new JwtStrategy(jwtOptions, function (payload, done) {
        process.nextTick(function() {
            User.findById(payload.sub).exec().then(function (user) {
                if (!user) {
                    done(null, false);
                } else {
                    done(null, user);
                }
            }).catch(function (err) {
                return done(err);
            });
        });
    });

    passport.use('signup-flash', localSignUpFlash);
    passport.use('signup', localSignUp);
    passport.use('login', localLogInFlash);
    passport.use('ember', localLogIn);
    passport.use('jwt', jwtLogIn);
    passport.use('twitter', twitterLogIn);
    passport.use('twitter-connect', twitterConnect);
    passport.use('facebook', facebookLogIn);
    passport.use('facebook-connect', facebookConnect);
    passport.use('google', googleLogIn);
    passport.use('google-connect', googleConnect);
};