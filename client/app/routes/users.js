import route from 'ember-redux/route';
import request from 'ember-ajax/request';

var model = (dispatch) => {
  return request('/users', {method:'GET'}).then(response => dispatch({type: 'DESERIALIZE_USERS', response: response}));
};

export default route({model})();
