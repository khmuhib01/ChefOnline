import {combineReducers} from 'redux';
import restaurantReducer from './restaurantReducer';
import profileReducer from './profileReducer';

const allReducers = combineReducers({
  restaurant: restaurantReducer,
  profile:profileReducer
});
export default allReducers;
