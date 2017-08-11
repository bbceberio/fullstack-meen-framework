import Ember from 'ember';
import ace from 'ember-ace';
import PageValidations from '../validations/page';
const {Logger, $, String} = Ember;

export default Ember.Controller.extend({
  PageValidations,
  getEditor() {
    const ace_id = 'editor';
    $('pre.ace_editor.ace-tm').attr('id', ace_id);
    return ace.edit(ace_id);
  },
  actions: {
    edit (changeset) {
      changeset.set('modifiedOn', new Date());
      changeset.set('content', this.get('html').string);
      changeset.save().then(
        () => this.transitionToRoute('/pages/' + changeset.get('id')),
        () => Logger.error('Error!')
      );
    },
    delete () {
      this.get('model').destroyRecord().then(
        () => this.transitionToRoute('pages'),
        () => Logger.error('Error!')
      );
    },
    update () {
      let value = this.getEditor().getSession().getValue();
      this.set('html', String.htmlSafe(value));
    },
    rollback (changeset) {
      changeset.rollback();
      this.getEditor().getSession().setValue(changeset.get('content'));
    },
    cancel () {
      return true;
    }
  }
});
