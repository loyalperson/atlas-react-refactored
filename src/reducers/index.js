import { combineReducers } from 'redux';
// Reducers
import loadingReducer from './loadingReducer';
import getMapPointDataReducer from './getMapPointDataReducer';

export default combineReducers({
  loadingReducer: loadingReducer,
  getMapPointDataReducer: getMapPointDataReducer,
});