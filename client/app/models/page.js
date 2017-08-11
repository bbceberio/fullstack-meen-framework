import Ember from 'ember';
const { inject: { service } } = Ember;
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  name: DS.attr('string'),
  uri: DS.attr('string'),
  content: DS.attr('string'),
  createdOn: DS.attr('date'),
  modifiedOn: DS.attr('date'),
  isActive: DS.attr('boolean'),
  html2json: service(),
  parse: function () {
    return this.get('html2json').json(this.get('content'));
  }.property('content'),
  json: function () {
    return JSON.stringify(this.get('html2json').json(this.get('content')));
  }.property('content')
});
