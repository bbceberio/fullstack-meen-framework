import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  deactivate: function () {
    this.controller.set('title', '');
    this.controller.set('uri', '');
    this.controller.set('name', '');
    this.controller.set('content', '');
    this.controller.set('html', '');
    this.controller.set('isActive', true);
  }
});
