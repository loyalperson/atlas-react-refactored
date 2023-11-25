import {GET_MAP_POINT_DATA_SUCCESS} from '../actions/types';

const initialState = {};

const getMapPointDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MAP_POINT_DATA_SUCCESS:
        console.log('Here is getting mapPoint Data Reducer', action.payload);
        return {
            ...state,
            ...action.payload
        };
    default:
      return state;
  }
};

export default getMapPointDataReducer;