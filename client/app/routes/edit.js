import Ember from 'ember';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import PageValidations from '../validations/page';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  setupController(controller, model) {
    if (!model.get('content')) {
      model.set('content', "");
    }
    this._super(controller, model);
    let changeset = new Changeset(model, lookupValidator(PageValidations), PageValidations);
    controller.set('changeset', changeset);
    controller.set('html', Ember.String.htmlSafe(changeset.get('content')));
  },
  actions: {
    cancel () {
      let model = this.controller.get('model');
      this.transitionTo('/pages/' + model.get('id'));
    }
  }
});
