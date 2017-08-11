import Ember from 'ember';
import jsonwebtoken from 'npm:jsonwebtoken';
const { inject: { service } } = Ember;

export default Ember.Component.extend({
  formLayout: "vertical",
  torii: service(),
  cookies: service(),
  session: service(),
  flashMessages: service(),
  authorizeJWT(code) {
    let cookieService = this.get('cookies'),
      jwt = decodeURIComponent(code),
      ember_simple_auth = JSON.parse(cookieService.read('ember_simple_auth-session'));
    if (ember_simple_auth) {
      let authenticated = {
        authenticator: "authenticator:jwt",
        token: jwt,
        exp: jsonwebtoken.decode(jwt).exp
      };
      ember_simple_auth.authenticated = authenticated;
    }
    cookieService.write('ember_simple_auth-session', JSON.stringify(ember_simple_auth));
  },
  actions: {
    authenticate() {
      let {username, password} = this.getProperties('username', 'password'),
        credentials = {identification: username, password: password};
      const flashMessages = this.get('flashMessages');
      this.get('session').authenticate('authenticator:jwt', credentials).catch((reason) => {
        flashMessages.danger(reason.error || reason);
      });
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
