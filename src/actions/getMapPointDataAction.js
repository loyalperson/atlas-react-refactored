import {GET_MAP_POINT_DATA_SUCCESS} from './types.js'
import store from '../store.js';

export const getMapPointData = async (data) => {
    try {
        console.log('Here is getting map point data action')
        store.dispatch({ type: GET_MAP_POINT_DATA_SUCCESS, payload: data });
    } catch (error) {
        console.log(error);
    }
}