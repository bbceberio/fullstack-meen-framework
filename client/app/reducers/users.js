import _ from 'lodash';

const initialState = {
  all: []
};

export default ((state, action) => {
  if (action.type === 'DESERIALIZE_USERS') {
    return Object.assign({}, state, {
      all: _.uniqBy(_.concat(state.all, action.response.data), 'id')
    });
  }
  if (action.type === 'REMOVE_USER') {
    return Object.assign({}, state, {
      all: _.remove(state.all, (n) => {return n.id !== action.id})
    });
  }
  return state || initialState;
});
