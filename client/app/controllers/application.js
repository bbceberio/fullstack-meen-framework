import Ember from 'ember';
const { inject: { service } } = Ember;

export default Ember.Controller.extend({
  session: service(),
  actions: {
    logout() {
      this.get('session').invalidate();
    }
  }
});
