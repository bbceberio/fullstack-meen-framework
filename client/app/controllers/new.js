import Ember from 'ember';
import ace from 'ember-ace';
import PageValidations from '../validations/page';
const { $, String } = Ember;

export default Ember.Controller.extend({
  html: "",
  isActive: true,
  PageValidations,
  getEditor() {
    const ace_id = 'editor';
    $('pre.ace_editor.ace-tm').attr('id', ace_id);
    return ace.edit(ace_id);
  },
  actions: {
    save (changeset) {
      let date = new Date(),
        newPage = this.store.createRecord('page', {
          title: changeset.get('title'),
          uri: changeset.get('uri'),
          name: changeset.get('name'),
          content: changeset.get('html').string,
          isActive: changeset.get('isActive'),
          createdOn: date,
          modifiedOn: date
        });
      newPage.save().then(
        () => this.transitionToRoute('pages'),
        () => Ember.Logger.error('Error!')
      );
    },
    update () {
      let value = this.getEditor().getSession().getValue();
      this.set('html', String.htmlSafe(value));
    }
  }
});
