import Ember from 'ember';
const {inject: {service}} = Ember;

export default Ember.Controller.extend({
  session: service(),
  flashMessages: service(),
  actions: {
    save(changeset) {
      let local = {
        email: changeset.get('email'),
        username: changeset.get('username'),
        password: changeset.get('password')
      };
      let newUser = this.store.createRecord('user', {local: local});
      const flashMessages = this.get('flashMessages');
      newUser.save().then(() => {
        let credentials = {identification: local.username, password: local.password};
        this.get('session').authenticate('authenticator:jwt', credentials).catch((reason) => {
          flashMessages.danger(reason.error || reason);
        });
      }).catch((reason) => {
        flashMessages.danger(reason.error || reason)
      });
    },
    loggedIn() {
      this.transitionToRoute('index');
    }
  }
});
