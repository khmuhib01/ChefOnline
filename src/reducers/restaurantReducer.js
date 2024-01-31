const initialState = {
  restaurantId: '',
  restaurantName: '',
  restaurantScheduleList: [],
  restaruantScheduleStatus: '',
  availableOrderPolicy: [],
  paymentMethods: [],
  availableDiscounts: [],
  availableOffers: [],
  deliveryCharge: 0,
  donationDetail: {},
  latitude: 0.0,
  longitude: 0.0,
};

const restaurantReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_RESTAURANT_DATA':
      const {
        restaurantId,
        restaurantName,
        restaurantScheduleList,
        restaruantScheduleStatus,
        availableOrderPolicy,
        paymentMethods,
        availableDiscounts,
        availableOffers,
        donationDetail,
        latitude,
        longitude,
      } = action.payload;

      state = {
        restaurantId,
        restaurantName,
        restaurantScheduleList,
        restaruantScheduleStatus,
        availableOrderPolicy,
        paymentMethods,
        availableDiscounts,
        availableOffers,
        donationDetail,
        latitude,
        longitude,
      };

      return state;

      break;

    case 'CLEAR_RESTAURANT_DATA':
      state = initialState;
      return state;
      break;

    default:
      return state;
      break;
  }
};

export default restaurantReducer;
