import {START_LOADING, END_LOADING } from '../actions/types';

const initialState = {isLoading: false};

const loadingReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_LOADING:
      return {
        isLoading:true
      };
    case END_LOADING:
      return {
        isLoading:false
    };
    default:
      return state;
  }
};

export default loadingReducer;