import Ember from 'ember';
import { jwt_decode } from 'ember-cli-jwt-decode';
const { inject: { service } } = Ember;

export default Ember.Component.extend({
  user: {},
  tokens: {},
  store: service(),
  torii: service(),
  cookies: service(),
  session: service(),
  flashMessages: service(),
  init() {
    this._super(...arguments);
    this.updateUser();
  },
  getProvider(service) {
    let provider = undefined;
    switch(service.toLowerCase()) {
      case 'twitter':
        provider = 'twitter';
        break;
      case 'facebook':
        provider = 'facebook-oauth2';
        break;
      case 'google':
        provider = 'google-oauth2-bearer';
        break;
      default:
        provider = undefined;
    }
    return provider;
  },
  updateUser() {
    let ember_simple_auth = JSON.parse(this.get('cookies').read('ember_simple_auth-session')),
      token = ember_simple_auth.authenticated.token;
    if (token) {
      const flashMessages = this.get('flashMessages');
      let jwt = jwt_decode(token);
      this.get('store').findRecord('user', jwt.sub).then((user) => {
        this.set('user', user);
        this.set('tokens', this.updateTokens);
      }).catch((reason) => {
        flashMessages.danger({error:reason});
      });
    }
  },
  updateTokens: function() {
    let tokens = {},
      usr = this.get('user'),
      local = usr.get('local.token'),
      twitter = usr.get('twitter.token'),
      facebook = usr.get('facebook.token'),
      google = usr.get('google.token');
    if (local) {
      tokens.local = local;
    }
    if (twitter) {
      tokens.twitter = twitter;
    }
    if (facebook) {
      tokens.facebook = facebook;
    }
    if (google) {
      tokens.google = google;
    }
    tokens.size = Object.keys(tokens).length;
    return tokens;
  }.property('user'),
  actions: {
    unlinkTwitter() {
      const flashMessages = this.get('flashMessages'),
        self = this;
      let user = this.get('user'),
        token = user.get('twitter.token');
      user.set('twitter.token', undefined);
      user.save().then(
        () => self.updateUser(),
        () => {
          user.set('twitter.token', token);
          flashMessages.danger("Twitter Unlink Failed!");
        }
      );
    },
    unlinkLocal() {
      const flashMessages = this.get('flashMessages'),
        self = this;
      let user = this.get('user'),
        local = {
          username: user.get('local.username'),
          email: user.get('local.email'),
          token: user.get('local.token')
        };
      user.set('local.username', undefined);
      user.set('local.email', undefined);
      user.set('local.token', undefined);
      user.save().then(
        () => self.updateUser(),
        () => {
          user.set('local.username', local.username);
          user.set('local.email', local.email);
          user.set('local.token', local.token);
          flashMessages.danger("Local Unlink Failed!");
        }
      );
    },
    unlinkFacebook() {
      const flashMessages = this.get('flashMessages'),
        self = this;
      let user = this.get('user'),
        token = user.get('facebook.token');
      user.set('facebook.token', undefined);
      user.save().then(
        () => self.updateUser(),
        () => {
          user.set('facebook.token', token);
          flashMessages.danger("Facebook Unlink Failed!");
        }
      );

    },
    unlinkGoogle() {
      const flashMessages = this.get('flashMessages'),
        self = this;
      let user = this.get('user'),
        token = user.get('google.token');
      user.set('google.token', undefined);
      user.save().then(
        () => self.updateUser(),
        () => {
          user.set('google.token', token);
          flashMessages.danger("Google Unlink Failed!");
        }
      );
    },
    connectTwitter() {
      const self = this,
        flashMessages = this.get('flashMessages');
      this.get('torii').open('twitter').then(
        () => self.updateUser(),
        () => flashMessages.danger("Twitter Connection Failed!")
      );
    },
    connectFacebook() {
      const self = this,
        flashMessages = this.get('flashMessages');
      this.get('torii').open('facebook-oauth2').then(
        () => self.updateUser(),
        () => flashMessages.danger("Facebook Connection Failed!")
      );
    },
    connectGoogle() {
      const self = this,
        flashMessages = this.get('flashMessages');
      this.get('torii').open('google-oauth2-bearer').then(
        () => self.updateUser(),
        () => flashMessages.danger("Google Connection Failed!")
      );
    }
  }
});
