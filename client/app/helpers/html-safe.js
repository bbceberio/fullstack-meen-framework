import Ember from 'ember';

export function htmlSafe(params/*, hash*/) {
  return Ember.String.htmlSafe(params.join(''));
}

export default Ember.Helper.helper(htmlSafe);
