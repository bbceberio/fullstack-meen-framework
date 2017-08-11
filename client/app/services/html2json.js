import Ember from 'ember';
import html2json from 'npm:html2json';
const { Logger } = Ember;

export default Ember.Service.extend({
  html2json: html2json,
  json: function (html) {
    if (typeof html !== 'string') {
      Logger.assert('html2json.json: input is not a string!');
      return {};
    } else {
      return this.get('html2json').html2json(html);
    }
  },
  html: function (json) {
    if (typeof json !== 'object') {
      Logger.assert('html2json.html: input is not an object!');
      return '';
    } else {
      return this.get('html2json').json2html(json);
    }
  }
});
