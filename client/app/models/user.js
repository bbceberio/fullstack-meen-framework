import DS from 'ember-data';

export default DS.Model.extend({
  local: DS.attr(),
  twitter: DS.attr(),
  facebook: DS.attr(),
  google: DS.attr()
});
