import Ember from 'ember';

export default Ember.Controller.extend({
  pageSorting: ['name'],
  sortedPages: Ember.computed.sort('model', 'pageSorting')
});
