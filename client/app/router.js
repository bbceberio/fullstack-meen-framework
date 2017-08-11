import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('pages');
  this.route('details', {
    path: '/pages/:page_id'
  });
  this.route('new');
  this.route('edit', {
    path: '/pages/:page_id/edit'
  });
  this.route('login');
  this.route('users');
  this.route('signup');
  this.route('profile');
});

export default Router;
