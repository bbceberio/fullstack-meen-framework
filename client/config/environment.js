/* eslint-env node */

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'my-ember-app',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    fastboot: {
      hostWhitelist: ['mywebsite.com', '*.mywebsite.com', /^localhost:\d+$/, '127.0.0.1:3000', '127.0.0.1:4200']
    },
    torii: {
      allowUnsafeRedirects: true,
      sessionServiceName: 'session',
      providers: {
        'twitter': {
          requestTokenUri: 'http://127.0.0.1:3000/auth/twitter'
        },
        'facebook-oauth2': {
          apiKey: '',
          redirectUri: 'http://127.0.0.1:3000/auth/facebook/callback',
        },
        'google-oauth2-bearer': {
          apiKey: '',
          redirectUri: 'http://127.0.0.1:3000/auth/google/callback',
        }
      }
    },
    'ember-simple-auth': {
      authorizer: 'authorizer:token',
      crossOriginWhitelist: ['*']
    },
    'ember-simple-auth-token': {
      identificationField: 'username',
      authorizationPrefix: 'JWT ',
      refreshLeeway: 180
    },
    'ember-websockets': {
      socketIO: true
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    //
  }

  return ENV;
};
