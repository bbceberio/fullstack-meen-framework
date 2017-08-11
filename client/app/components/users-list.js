import Ember from 'ember';
import { connect } from 'ember-redux';
import request from 'ember-ajax/request';

var stateToComputed = (state) => {
  return {
    users: state.users.all
  };
};

var dispatchToActions = (dispatch) => {
  return {
    remove: (id) => request(`/users/${id}`, {method:'DELETE'}).then(() => dispatch({type: 'REMOVE_USER', id: id}))
  };
};

var UserListComponent = Ember.Component.extend({
});

export default connect(stateToComputed, dispatchToActions)(UserListComponent);
