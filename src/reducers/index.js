import { combineReducers } from 'redux';

const imgReducer = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_POSTS':
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  imgs: imgReducer,
});
