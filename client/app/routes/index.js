import Ember from 'ember';
const { inject: { service } } = Ember;

export default Ember.Route.extend({
  html2json: service(),
  cookies: service(),
  model: function () {
    return JSON.parse(this.get('cookies').read('ember_simple_auth-session'));
  }
});
