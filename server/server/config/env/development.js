var mongo = require('../mongo');

module.exports = {
    db: mongo.url,
    app: {
        title: 'myApp'
    },
    facebook: {
        clientID: '',
        clientSecret: '',
        callbackURL: 'http://127.0.0.1:3000/auth/facebook/callback',
        passReqToCallback : true,
        profileFields: ['id', 'emails', 'displayName']
    },
    twitter: {
        consumerKey: '',
        consumerSecret: '',
        callbackURL: "http://127.0.0.1:3000/auth/twitter/callback",
        passReqToCallback : true
    },
    google: {
        clientID: '',
        clientSecret: '',
        callbackURL: 'http://127.0.0.1:3000/auth/google/callback',
        passReqToCallback : true
    },
    meetup: {
        consumerKey: process.env.MEETUP_KEY || 'APP_ID',
        consumerSecret: process.env.MEETUP_SECRET || 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/meetup/callback'
    },
    linkedin: {
        clientID: process.env.LINKEDIN_ID || 'APP_ID',
        clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/linkedin/callback'
    },
    jwt: {
        jwtFromRequest: '',
        secretOrKey: '',
        session: true
    }
};