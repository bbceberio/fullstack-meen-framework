import Ember from 'ember';
import Table from 'ember-light-table';
import { jwt_decode } from 'ember-cli-jwt-decode';
const { computed, inject: { service } } = Ember;

export default Ember.Component.extend({
  cookies: service(),
  init () {
    this._super(...arguments);
    let ember_simple_auth = JSON.parse(this.get('cookies').read('ember_simple_auth-session'));
    let token = ember_simple_auth.authenticated.token;
    if (token) {
      let jwt = jwt_decode(token);
      this.set('id', jwt.sub);
    }
  },
  columns: computed(function() {
    return [{
      label: 'Type',
      valuePath: 'type',
      width: '60px'
    }, {
      label: 'ID',
      valuePath: 'id',
      width: '250px'
    }, {
      label: 'Username',
      valuePath: 'attributes.local.username',
      width: '150px'
    }];
  }),
  table: computed('users', function() {
    return new Table(this.get('columns'), this.get('users'));
  })
});
