import Ember from 'ember';
import UserValidations from '../validations/user';
import { jwt_decode } from 'ember-cli-jwt-decode';
const { inject: { service } } = Ember;

export default Ember.Component.extend({
  formLayout: "vertical",
  torii: service(),
  cookies: service(),
  session: service(),
  flashMessages: service(),
  UserValidations,
  authorizeJWT(code) {
    let cookieService = this.get('cookies'),
      jwt = decodeURIComponent(code),
      ember_simple_auth = JSON.parse(cookieService.read('ember_simple_auth-session'));
    if (ember_simple_auth) {
      let authenticated = {
        authenticator: "authenticator:jwt",
        token: jwt,
        exp: jwt_decode(jwt).exp
      };
      ember_simple_auth.authenticated = authenticated;
    }
    cookieService.write('ember_simple_auth-session', JSON.stringify(ember_simple_auth));
  },
  actions: {
    signup(changeset) {
      this.attrs.triggerSave(changeset);
    },
    signInViaTwitter() {
      let self = this;
      const flashMessages = this.get('flashMessages');
      this.get('torii').open('twitter').then(function({code}) {
        self.authorizeJWT(code);
      }, function() {
        flashMessages.danger("Twitter Authentication Failed!");
      });
    },
    signInViaFacebook() {
      let self = this;
      const flashMessages = this.get('flashMessages');
      this.get('torii').open('facebook-oauth2').then(function({authorizationCode}) {
        self.authorizeJWT(authorizationCode);
      }, function() {
        flashMessages.danger("Facebook Authentication Failed!");
      });
    },
    signInViaGoogle() {
      let self = this;
      const flashMessages = this.get('flashMessages');
      this.get('torii').open('google-oauth2-bearer').then(function(res) {
        self.authorizeJWT(res.authorizationToken.access_token);
      }, function() {
        flashMessages.danger("Google Authentication Failed!");
      });
    }
  }
});
