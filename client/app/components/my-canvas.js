import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'canvas',
  attributeBindings: ['id', 'width', 'height'],
  id: 'myCanvas',
  width: 400,
  height: 250,
  didInsertElement: function () {
    myCanvas();
  }
});
