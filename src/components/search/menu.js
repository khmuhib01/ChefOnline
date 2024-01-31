import {
  Card,
  CardItem,
  Container,
  Grid,
  Col,
  Thumbnail,
  Icon,
  Badge,
  ListItem,
  Left,
  Right,
  Item,
  Spinner,
  Header,
  Input,
  Body,
  Tab,
  List,
} from 'native-base';
import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  View,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import ScrollableTabString from 'react-native-scrollable-tabstring';
import Config from 'react-native-config';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import getData from '../api';
import {Text, Button, Snackbar} from 'react-native-paper';
import AppButtonContained from '../common/app-button-contained';
import AppButtonClear from '../common/app-button-clear';
import AppButtonOutline from '../common/app-button-outline';
import CartContext from '../../context/cart-context';
import axios from 'axios';
import {createStyles, maxHeight, minHeight} from 'react-native-media-queries';

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

const base = {
  restaruantNameText: {
    fontSize: 14,
  },
  medium_text: {
    fontSize: 14,
  },
  small_text: {
    fontSize: 13,
  },
  buttonText: {
    fontSize: 10,
    color: '#ed1a3b',
  },
  dishName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
};

const dynamicStyles = createStyles(
  base,
  // override styles only if screen height is less than 500
  minHeight(
    500,
    maxHeight(599, {
      restaruantNameText: {
        fontSize: 13,
      },
      medium_text: {
        fontSize: 12,
      },
      small_text: {
        fontSize: 11,
      },
      buttonText: {
        fontSize: 10,
        color: '#ed1a3b',
      },
      dishName: {
        fontSize: 12,
        fontWeight: 'bold',
      },
    }),
  ),

  minHeight(
    600,
    maxHeight(699, {
      restaruantNameText: {
        fontSize: 14,
      },
      medium_text: {
        fontSize: 13,
      },
      small_text: {
        fontSize: 12,
      },
      buttonText: {
        fontSize: 10,
        color: '#ed1a3b',
      },
      dishName: {
        fontSize: 13,
        fontWeight: 'bold',
      },
    }),
  ),

  minHeight(
    700,
    maxHeight(799, {
      restaruantNameText: {
        fontSize: 15,
      },
      medium_text: {
        fontSize: 14,
      },
      small_text: {
        fontSize: 13,
      },
      buttonText: {
        fontSize: 10,
        color: '#ed1a3b',
      },
      dishName: {
        fontSize: 14,
        fontWeight: 'bold',
      },
    }),
  ),

  minHeight(
    800,
    maxHeight(900, {
      restaruantNameText: {
        fontSize: 16,
      },
      medium_text: {
        fontSize: 15,
      },
      small_text: {
        fontSize: 14,
      },
      buttonText: {
        fontSize: 11,
        color: '#ed1a3b',
      },
      dishName: {
        fontSize: 15,
        fontWeight: 'bold',
      },
    }),
  ),

  minHeight(901, {
    restaruantNameText: {
      fontSize: 16,
    },
    medium_text: {
      fontSize: 15,
    },
    small_text: {
      fontSize: 14,
    },
    buttonText: {
      fontSize: 11,
      color: '#ed1a3b',
    },
    dishName: {
      fontSize: 15,
      fontWeight: 'bold',
    },
  }),
);

export default function Menu({navigation, route}) {
  //for context
  const {cart, setCart} = useContext(CartContext);

  //for redux
  const dispatch = useDispatch();

  const {restaurantId, restaurantName, distance} = route.params;
  const [isDataFound, setIsDataFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localTotal, setLocalTotal] = useState(0);
  const [excludeFrom, setExcludeFrom] = useState(0);

  const [apiResponse, setApiResponse] = useState({});
  const [cuisineArray, setCuisineArray] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [restaurantScheduleStatus, setRestaurantScheduleStatus] = useState('');
  const [currentApiDateTimeObj, setCurrentApiDateTimeObj] = useState('');
  const [orderPolicy, setOrderPolicy] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [cuisine, setCuisine] = useState('');
  const [scrollableTabStringRef, setScrollableTabStringRef] = useState();
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [parentDishName, setParentDishName] = useState('');
  const [options, setOptions] = useState('');
  const [aviableOffersAndDiscounts, setAviableOffersAndDiscounts] = useState(
    [],
  );
  const [offerModalVisible, setOfferModalVisible] = useState(false);

  useEffect(() => {
    console.warn(height);
    // navigation.setOptions({
    //   title: restaurantName,
    // });

    //console.log(cart);

    getRestaurantData();
    return () => setLocalTotal(cart.subTotal);
  }, []);

  useEffect(() => {
    if (scheduleList.length > 0) {
      getCurrentTime();
    }
  }, [scheduleList]);

  useEffect(() => {
    if (currentApiDateTimeObj != '') {
      getRestaurantScheduleStatus();
    }
  }, [currentApiDateTimeObj]);

  useEffect(() => {
    if (restaurantScheduleStatus != '') {
      getAvailableDiscountAndOffer();
    }
  }, [restaurantScheduleStatus]);

  useEffect(() => {
    if (cart.subTotal != localTotal) {
      setLocalTotal(cart.subTotal);
    }

    console.log('Change Cart ## ' + excludeFrom);
  }, [cart]);

  useEffect(() => {
    if (cart.subTotal != localTotal) {       
      setExcludeFrom(cart.excludeFromOffer);  
    }
    // console.warn('called 2');
    console.log('Change Cart ## ' + excludeFrom);

  }, [cart.subTotal]);

  const getRestaurantData = async () => {
    setLoading(true);
    console.log('URL: ', Config.API_URL + 'funId=81&rest_id=' + restaurantId);
    await axios
      .get(Config.API_URL + 'funId=81&rest_id=' + restaurantId)
      .then(response => {
        if (response.data.app[0].cuisine != undefined) {
          generateData(response.data.app[0].cuisine);
          setIsDataFound(true);
          setApiResponse(response.data.app[0]);
          setOrderPolicy(response.data.app[0].order_policy.policy);
          setScheduleList(response.data.app[0].restuarent_schedule.schedule);
        } else {
          setIsDataFound(false);
        }
      })
      .catch(error => {
        setLoading(false);
        console.warn(error.message);
        setIsDataFound(false);
      });
  };

  const generateData = data => {
    let tempCategory = [];
    data.forEach(function (element) {
      element.category.forEach(function (cat) {
        tempCategory.push(cat);
      });
    });
    setCategoryList(tempCategory);
    setLoading(false);
  };

  const getCurrentTime = async () => {
    await getData(Config.API_URL + 'funId=79')
      .then(response => {
        setCurrentApiDateTimeObj(response.data.data);
      })
      .catch(error => {
        console.warn(error.message);
      });
  };

  let count = 0;

  const getRestaurantScheduleStatus = () => {
    let shiftPassed = [];
    let numberOfShifts = 0;
    let tempRestaruantScheduleStatus = '';

    for (var a = 0; a < scheduleList.length; a++) {
      if (scheduleList[a].weekday_id == parseInt(currentApiDateTimeObj.dayNo)) {
        let list = scheduleList[a].list;
        for (var b = 0; b < list.length; b++) {
          if (list[b].type == '3') {
            numberOfShifts++;
            let opening_time = moment(list[b].opening_time, ['hh:mm a']);
            let closing_time = moment(list[b].closing_time, ['hh:mm a']);
            let currentTime = moment(currentApiDateTimeObj.time, ['hh:mm a']);
            if (currentTime >= opening_time && currentTime <= closing_time) {
              tempRestaruantScheduleStatus = 'OPEN';
              break;
            } else {
              if (currentTime > closing_time) {
                shiftPassed.push(list[b]);
              }
            }
          }
        }
      }
    }

    if (tempRestaruantScheduleStatus == '') {
      if (numberOfShifts > 0) {
        if (shiftPassed.length == 0) {
          tempRestaruantScheduleStatus = 'PRE-ORDER';
          console.log('PRE-ORDER');
        } else if (shiftPassed.length >= numberOfShifts) {
          tempRestaruantScheduleStatus = 'CLOSED';
          console.log('PRE-ORDER');
        } else if (
          shiftPassed.length < numberOfShifts &&
          tempRestaruantScheduleStatus == ''
        ) {
          console.log('PRE-ORDER');
          tempRestaruantScheduleStatus = 'PRE-ORDER';
        }
      } else {
        tempRestaruantScheduleStatus = 'CLOSED';
        console.log('PRE-ORDER');
      }
    }

    setRestaurantScheduleStatus(tempRestaruantScheduleStatus);
  };

  const getAvailableDiscountAndOffer = () => {
    let tempOfferDiscount = [];
    let tempDiscount = [];
    let tempOffer = [];

    if (apiResponse.discount.status != undefined) {
      if (apiResponse.discount.status == 1) {
        for (var a = 0; a < apiResponse.discount.off.length; a++) {
          let obj = {};
          obj.id = apiResponse.discount.off[a].discount_id;
          obj.title = apiResponse.discount.off[a].discount_title;
          obj.description = apiResponse.discount.off[a].discount_description;
          tempOfferDiscount.push(obj);
          tempDiscount.push(apiResponse.discount.off[a]);
        }
      }
    }

    if (apiResponse.offer.status != undefined) {
      if (apiResponse.offer.status == 1) {
        for (var a = 0; a < apiResponse.offer.offer_list.length; a++) {
          let obj = {};
          obj.id = apiResponse.offer.offer_list[a].id;
          obj.title = apiResponse.offer.offer_list[a].offer_title;
          obj.description = apiResponse.offer.offer_list[a].description;
          tempOffer.push(apiResponse.offer.offer_list[a]);
          tempOfferDiscount.push(obj);
        }
      }
    }

    setAviableOffersAndDiscounts(tempOfferDiscount);
    getPaymentMethod(tempDiscount, tempOffer);
  };

  const getPaymentMethod = async (
    availableDiscounts = [],
    availableOffers = [],
  ) => {
    await getData(Config.API_URL + 'funId=78&rest_id=' + restaurantId)
      .then(response => {
        let payload = {};
        payload.restaurantId = restaurantId;
        payload.restaurantName = restaurantName;
        payload.restaurantScheduleList =
          apiResponse.restuarent_schedule.schedule;
        payload.availableOrderPolicy = apiResponse.order_policy.policy;
        payload.availableDiscounts = availableDiscounts;
        payload.availableOffers = availableOffers;
        payload.restaruantScheduleStatus = restaurantScheduleStatus;
        payload.latitude = apiResponse.latitude;
        payload.longitude = apiResponse.longitude;

        if (response.data.status == 'Success') {
          payload.paymentMethods = response.data.payment_methods;
          let donationObj = {};
          donationObj.donation_msg = response.data.donation_msg;
          donationObj.donation_site_url = response.data.donation_site_url;
          donationObj.donation_title = response.data.donation_title;
          payload.donationDetail = donationObj;
        } else {
          payload.paymentMethods = [];
          payload.donationDetail = {};
        }
        dispatch({type: 'SET_RESTAURANT_DATA', payload: payload});
      })
      .catch(error => {
        console.warn(error.message);
      });
  };

  const addItemToCart = item => {
    let tempTotal = parseFloat(localTotal);
    tempTotal += parseFloat(item.dish_price);
    setLocalTotal(tempTotal);

    tempTotal = cart.subTotal;
    tempTotal += parseFloat(item.dish_price);

    tempTotal = parseFloat(tempTotal.toFixed(2));

    let exclude_from_offer = item.exclude_from_offer;
    let excludeFromTotal = parseFloat(excludeFrom);
    if (exclude_from_offer) {
      excludeFromTotal += parseFloat(item.dish_price);

      excludeFromTotal = parseFloat(excludeFromTotal.toFixed(2));

      setExcludeFrom(excludeFromTotal);

      console.log(excludeFromTotal + ' ## Not for Discount ## ' + parseFloat(item.dish_price));
    }

    let tempBadgeCount = cart.badgeCount;
    tempBadgeCount++;
    let tempAssociativeMenuObj = cart.associativeMenuObj;
    let tempDish = cart.dish;
    let index = -1;
    if (tempDish.length > 0) {
      index = tempDish.findIndex(
        array_item => array_item.dish_id === item.dish_id,
      );
    }
    if (index >= 0) {
      tempDish[index].quantity++;
      tempAssociativeMenuObj[item.dish_id] = tempDish[index].quantity;
    } else {
      let obj = {};
      obj.dish_id = item.dish_id;
      obj.dish_name = item.dish_name;
      obj.exclude_from_offer = item.exclude_from_offer;
      obj.dish_price = parseFloat(item.dish_price);
      obj.quantity = 1;
      tempDish.push(obj);
      tempAssociativeMenuObj[item.dish_id] = 1;
    }

    //console.log(tempTotal);

    let payload = {};
    payload.dish = tempDish;
    payload.subTotal = tempTotal;
    payload.excludeFromOffer = excludeFromTotal;
    payload.associativeMenuObj = tempAssociativeMenuObj;
    payload.badgeCount = tempBadgeCount;
    payload.availedDiscountAmount = cart.availedDiscountAmount;
    payload.selectedOrderPolicy = cart.selectedOrderPolicy;
    payload.availedDiscount = cart.availedDiscount;
    payload.availedOffer = cart.availedOffer;
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = cart.selectedPaymentMethod;
    payload.scheduleList = cart.scheduleList;

    setCart(payload);
  };

  const addOptionsToCart = item => {
    let tempTotal = localTotal;
    tempTotal += parseFloat(item.option_price);
    setLocalTotal(tempTotal);

    tempTotal = cart.subTotal;
    tempTotal += parseFloat(item.option_price);

    tempTotal = parseFloat(tempTotal.toFixed(2));

    //console.log(tempTotal);
    let tempBadgeCount = cart.badgeCount;
    tempBadgeCount++;
    let tempAssociativeMenuObj = cart.associativeMenuObj;

    let tempDish = cart.dish;
    let index = -1;
    if (tempDish.length > 0) {
      index = tempDish.findIndex(
        array_item => array_item.dish_id === item.self_id,
      );
    }
    if (index >= 0) {
      tempDish[index].quantity++;
      tempAssociativeMenuObj[item.self_id] = tempDish[index].quantity;
    } else {
      let obj = {};
      obj.dish_id = item.self_id;
      obj.dish_name = parentDishName + item.option_name;
      obj.exclude_from_offer = item.exclude_from_offer;
      obj.dish_price = parseFloat(item.option_price);
      obj.quantity = 1;
      tempDish.push(obj);
      tempAssociativeMenuObj[item.self_id] = 1;
    }

    let payload = {};
    payload.dish = tempDish;
    payload.subTotal = tempTotal;
    payload.excludeFromOffer = excludeFrom;
    payload.associativeMenuObj = tempAssociativeMenuObj;
    payload.availedDiscountAmount = cart.availedDiscountAmount;
    payload.badgeCount = tempBadgeCount;
    payload.selectedOrderPolicy = cart.selectedOrderPolicy;
    payload.availedDiscount = cart.availedDiscount;
    payload.availedOffer = cart.availedOffer;
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = cart.selectedPaymentMethod;
    payload.scheduleList = cart.scheduleList;
    setCart(payload);
  };

  const removeItemFromCart = item => {
    let tempDish = cart.dish;
    let index = -1;
    if (tempDish.length > 0) {
      index = tempDish.findIndex(
        array_item => array_item.dish_id === item.dish_id,
      );
    }

    if (index >= 0) {
      let tempTotal = localTotal;
      tempTotal -= parseFloat(item.dish_price);

      setLocalTotal(tempTotal);

      tempTotal = cart.subTotal;
      tempTotal -= parseFloat(item.dish_price);

      tempTotal = parseFloat(tempTotal.toFixed(2));

      let exclude_from_offer = item.exclude_from_offer;
      let excludeFromTotal = parseFloat(excludeFrom);

      if (exclude_from_offer) {
        excludeFromTotal -= parseFloat(item.dish_price);

        excludeFromTotal = parseFloat(excludeFromTotal.toFixed(2));

        setExcludeFrom(excludeFromTotal);

        //console.log(excludeFromTotal + ' ## Not for Discount ## ' + parseFloat(item.dish_price));
      }

      let tempBadgeCount = cart.badgeCount;
      tempBadgeCount--;
      let tempAssociativeMenuObj = cart.associativeMenuObj;

      if (tempDish[index].quantity == 1) {
        tempDish.splice(index, 1);
        tempAssociativeMenuObj[item.dish_id] = 0;
      } else {
        tempDish[index].quantity--;
        tempAssociativeMenuObj[item.dish_id] = tempDish[index].quantity;
      }

      //console.log(tempTotal);

      let payload = {};
      payload.dish = tempDish;
      payload.subTotal = tempTotal;
      payload.excludeFromOffer = excludeFromTotal;
      payload.availedDiscountAmount = cart.availedDiscountAmount;
      payload.associativeMenuObj = tempAssociativeMenuObj;
      payload.badgeCount = tempBadgeCount;
      payload.selectedOrderPolicy = cart.selectedOrderPolicy;
      payload.availedDiscount = cart.availedDiscount;
      payload.availedOffer = cart.availedOffer;
      payload.availedVoucher = cart.availedVoucher;
      payload.selectedPaymentMethod = cart.selectedPaymentMethod;
      payload.scheduleList = cart.scheduleList;
      setCart(payload);
    }
  };

  const removeOptionFromCart = item => {
    let tempDish = cart.dish;
    let index = -1;
    if (tempDish.length > 0) {
      index = tempDish.findIndex(
        array_item => array_item.dish_id === item.self_id,
      );
    }

    if (index >= 0) {
      let tempTotal = localTotal;
      tempTotal -= parseFloat(item.option_price);

      tempTotal = parseFloat(tempTotal.toFixed(2));

      //console.log(tempTotal);

      setLocalTotal(tempTotal);

      tempTotal = cart.subTotal;
      tempTotal -= parseFloat(item.option_price);
      let tempBadgeCount = cart.badgeCount;
      tempBadgeCount--;
      let tempAssociativeMenuObj = cart.associativeMenuObj;
      //tempAssociativeMenuObj[item.self_id] = tempDish[index].quantity--;

      if (tempDish[index].quantity == 1) {
        tempDish.splice(index, 1);
        tempAssociativeMenuObj[item.self_id] = 0;
      } else {
        tempDish[index].quantity--;
        tempAssociativeMenuObj[item.self_id] = tempDish[index].quantity;
      }

      let payload = {};
      payload.dish = tempDish;
      payload.subTotal = tempTotal;
      payload.excludeFromOffer = excludeFrom;
      payload.associativeMenuObj = tempAssociativeMenuObj;
      payload.availedDiscountAmount = cart.availedDiscountAmount;
      payload.badgeCount = tempBadgeCount;
      payload.selectedOrderPolicy = cart.selectedOrderPolicy;
      payload.availedDiscount = cart.availedDiscount;
      payload.availedOffer = cart.availedOffer;
      payload.availedVoucher = cart.availedVoucher;
      payload.selectedPaymentMethod = cart.selectedPaymentMethod;
      payload.scheduleList = cart.scheduleList;
      setCart(payload);
    }
  };

  const scrollToIndexFailed = error => {
    const offset = error.averageItemLength * error.index;
    scrollableTabStringRef.scrollToOffset({offset});
    setTimeout(
      () =>
        scrollableTabStringRef.scrollToIndex({
          animated: true,
          index: error.index,
        }),
      1,
    );
  };

  const renderOffers = ({item}) => {
    return (
      <ListItem>
        <Text>
          {item.title}{' '}
          {item.description != undefined
            ? item.description.replace(/<\/?[^>]+(>|$)/g, ' ')
            : ''}
        </Text>
      </ListItem>
    );
  };

  const renderOptions = ({item}) => {
    return (
      <ListItem>
        <Col style={{flex: 1.6}}>
          <Text style={{fontSize: 14}}>{item.option_name}</Text>
          {item.option_description != '' && (
            <Text style={{fontSize: 12}}>{item.option_description.trim()}</Text>
          )}
        </Col>
        <Col style={{flex: 1}}>
          <Grid>
            <Col
              style={{
                alignSelf: 'center',
                flex: 1,
              }}>
              <Text style={{textAlign: 'center'}}>
                &pound;{item.option_price}
              </Text>
            </Col>

            {cart.associativeMenuObj[item.self_id] == undefined ? (
              <Col style={{flex: 1.5, alignSelf: 'center'}}>
                <Button
                  mode="outlined"
                  color="#ed1a3b"
                  style={{borderColor: '#ed1a3b'}}
                  onPress={() => addOptionsToCart(item)}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#ed1a3b',
                    }}>
                    ADD
                  </Text>
                </Button>
              </Col>
            ) : (
              <>
                {cart.associativeMenuObj[item.self_id] == 0 && (
                  <Col style={{flex: 1.5, alignSelf: 'center'}}>
                    <Button
                      mode="outlined"
                      color="#ed1a3b"
                      style={{borderColor: '#ed1a3b'}}
                      onPress={() => addOptionsToCart(item)}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#ed1a3b',
                        }}>
                        ADD
                      </Text>
                    </Button>
                  </Col>
                )}
              </>
            )}

            {cart.associativeMenuObj[item.self_id] != undefined && (
              <>
                {cart.associativeMenuObj[item.self_id] > 0 && (
                  <Col
                    style={{
                      alignSelf: 'flex-end',
                      flex: 1.5,
                    }}>
                    <Grid>
                      <Col style={{alignSelf: 'center'}}>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            removeOptionFromCart(item);
                          }}>
                          <Icon
                            style={{
                              color: '#ed1a3b',
                              textAlign: 'center',
                              borderColor: '#ed1a3b',
                              borderRadius: 2,
                              borderWidth: 0.5,
                              fontSize: 20,
                            }}
                            type="AntDesign"
                            name="minus"
                          />
                        </TouchableWithoutFeedback>
                      </Col>
                      <Col style={{alignSelf: 'center'}}>
                        <Text style={{textAlign: 'center'}}>
                          {cart.associativeMenuObj[item.self_id]}
                        </Text>
                      </Col>

                      <Col style={{alignSelf: 'center'}}>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            addOptionsToCart(item);
                          }}>
                          <Icon
                            style={{
                              color: '#ed1a3b',
                              textAlign: 'center',
                              borderColor: '#ed1a3b',
                              borderRadius: 2,
                              borderWidth: 0.5,
                              fontSize: 17,
                            }}
                            type="Ionicons"
                            name="add-sharp"
                          />
                        </TouchableWithoutFeedback>
                      </Col>
                    </Grid>
                  </Col>
                )}
              </>
            )}
          </Grid>
        </Col>
      </ListItem>
    );
  };

  return (
    <Container
      style={{
        justifyContent: 'center',
        paddingTop: 20,
        backgroundColor: '#fff',
      }}>
      {loading ? (
        // <ActivityIndicator size="large" color="#ed1a3b" />

        <SkeletonPlaceholder style={{paddingTop: 40}}>
          <View
            style={{
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <View
              style={{
                marginTop: 6,
                width: Dimensions.get('window').width * 0.95,
                borderRadius: 10,
                height: 100,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <View>
              <View
                style={{
                  width: Dimensions.get('window').width,
                  height: 40,
                  borderRadius: 4,
                }}
              />

              <View
                style={{
                  marginTop: 6,
                  width: 80,
                  height: 20,
                  marginLeft: 10,
                  borderRadius: 4,
                }}
              />

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    marginTop: 6,
                    width: 120,
                    height: 40,
                    marginLeft: 10,
                    marginRight: Dimensions.get('window').width / 4,
                    borderRadius: 4,
                  }}
                />
                <View
                  style={{
                    marginTop: 6,
                    width: 40,
                    height: 20,
                    marginLeft: 20,
                    borderRadius: 4,
                  }}
                />

                <View
                  style={{
                    marginTop: 6,
                    width: 100,
                    height: 20,
                    marginLeft: 5,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <View>
              <View
                style={{
                  width: Dimensions.get('window').width,
                  height: 40,
                  borderRadius: 4,
                }}
              />

              <View
                style={{
                  marginTop: 6,
                  width: 80,
                  height: 20,
                  marginLeft: 10,

                  borderRadius: 4,
                }}
              />

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    marginTop: 6,
                    width: 120,
                    height: 40,
                    marginLeft: 10,
                    marginRight: Dimensions.get('window').width / 4,
                    borderRadius: 4,
                  }}
                />
                <View
                  style={{
                    marginTop: 6,
                    width: 40,
                    height: 20,
                    marginLeft: 20,
                    borderRadius: 4,
                  }}
                />

                <View
                  style={{
                    marginTop: 6,
                    width: 100,
                    height: 20,
                    marginLeft: 5,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <View>
              <View
                style={{
                  width: Dimensions.get('window').width,
                  height: 40,
                  borderRadius: 4,
                }}
              />

              <View
                style={{
                  marginTop: 6,
                  width: 80,
                  height: 20,
                  marginLeft: 10,

                  borderRadius: 4,
                }}
              />

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    marginTop: 6,
                    width: 120,
                    height: 40,
                    marginLeft: 10,
                    marginRight: Dimensions.get('window').width / 4,
                    borderRadius: 4,
                  }}
                />
                <View
                  style={{
                    marginTop: 6,
                    width: 40,
                    height: 20,
                    marginLeft: 20,
                    borderRadius: 4,
                  }}
                />

                <View
                  style={{
                    marginTop: 6,
                    width: 100,
                    height: 20,
                    marginLeft: 5,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <View>
              <View
                style={{
                  width: Dimensions.get('window').width,
                  height: 40,
                  borderRadius: 4,
                }}
              />

              <View
                style={{
                  marginTop: 6,
                  width: 80,
                  height: 20,
                  marginLeft: 10,

                  borderRadius: 4,
                }}
              />

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    marginTop: 6,
                    width: 120,
                    height: 40,
                    marginLeft: 10,
                    marginRight: Dimensions.get('window').width / 4,
                    borderRadius: 4,
                  }}
                />
                <View
                  style={{
                    marginTop: 6,
                    width: 40,
                    height: 20,
                    marginLeft: 20,
                    borderRadius: 4,
                  }}
                />

                <View
                  style={{
                    marginTop: 6,
                    width: 100,
                    height: 20,
                    marginLeft: 5,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <View>
              <View
                style={{
                  width: Dimensions.get('window').width,
                  height: 40,
                  borderRadius: 4,
                }}
              />

              <View
                style={{
                  marginTop: 6,
                  width: 80,
                  height: 20,
                  marginLeft: 10,

                  borderRadius: 4,
                }}
              />

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    marginTop: 6,
                    width: 120,
                    height: 40,
                    marginLeft: 10,
                    marginRight: Dimensions.get('window').width / 4,
                    borderRadius: 4,
                  }}
                />
                <View
                  style={{
                    marginTop: 6,
                    width: 40,
                    height: 20,
                    marginLeft: 20,
                    borderRadius: 4,
                  }}
                />

                <View
                  style={{
                    marginTop: 6,
                    width: 100,
                    height: 20,
                    marginLeft: 5,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>
        </SkeletonPlaceholder>
      ) : (
        <>
          {!isDataFound ? (
            <View style={{paddingHorizontal: 5}}>
              <Icon
                type="MaterialIcons"
                name="error"
                style={{alignSelf: 'center', fontSize: 150, color: '#70757aad'}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: 20,
                  color: '#70757aad',
                  marginBottom: 5,
                }}>
                SORRY! NO DATA FOUND
              </Text>
              <AppButtonContained
                text={'GO TO HOME'}
                onClick={() => {
                  navigation.popToTop();
                }}
              />
            </View>
          ) : (
            <>
              {restaurantScheduleStatus == 'CLOSED' ? (
                <View style={{paddingHorizontal: 5}}>
                  <Icon
                    type="MaterialIcons"
                    name="error"
                    style={{
                      alignSelf: 'center',
                      fontSize: 150,
                      color: '#70757aad',
                    }}
                  />
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontSize: 18,
                      color: '#70757aad',
                      marginBottom: 5,
                    }}>
                    SORRY! RESTAURANT IS CLOSED FOR TODAY
                  </Text>
                  <AppButtonContained
                    text={'GO TO HOME'}
                    onClick={() => {
                      navigation.popToTop();
                    }}
                  />
                </View>
              ) : (
                <>
                  <Modal
                    style={styles.centeredView}
                    animationType="slide"
                    transparent={true}
                    visible={optionModalVisible}
                    onRequestClose={() => {
                      setOptionModalVisible(!optionModalVisible);
                    }}>
                    <View style={styles.centeredView}>
                      <View style={styles.modalView}>
                        <Card style={{width: 340, maxHeight: height - 100}} transparent>
                          <CardItem
                            style={{
                              justifyContent: 'center',
                              backgroundColor: '#f1f1f1',
                            }}>
                            <Left>
                              <Text>{parentDishName}</Text>
                            </Left>
                            <Right>
                              <Text style={{color: '#EC1A3A'}}>
                                TOTAL: &pound;{localTotal.toFixed(2)}
                              </Text>
                            </Right>
                          </CardItem>
                          <FlatList
                            data={options}
                            renderItem={renderOptions}
                            keyExtractor={(item) => item.self_id}
                          />
                          <CardItem footer style={{alignSelf: 'center'}}>
                            <AppButtonContained
                              text={'CLOSE'}
                              onClick={() => {
                                setParentDishName('');
                                setOptions([]);
                                setOptionModalVisible(!optionModalVisible);
                              }}
                            />
                          </CardItem>
                        </Card>
                      </View>
                    </View>
                  </Modal>

                  <Modal
                    style={styles.centeredView}
                    animationType="slide"
                    transparent={true}
                    visible={offerModalVisible}
                    onRequestClose={() => {
                      setOfferModalVisible(!offerModalVisible);
                    }}>
                    <View style={styles.centeredView}>
                      <View style={styles.modalView}>
                        <Card style={{width: 340, maxHeight: height - 100}} transparent>
                          <CardItem
                            style={{
                              justifyContent: 'center',
                              backgroundColor: '#f1f1f1',
                            }}>
                            <Text>AVAILABLE OFFERS</Text>
                          </CardItem>

                          <FlatList
                            data={aviableOffersAndDiscounts}
                            renderItem={renderOffers}
                            keyExtractor={(item) => item.id}
                          />
                          <CardItem footer style={{alignSelf: 'center'}}>
                            <AppButtonContained
                              text={'CLOSE'}
                              onClick={() => {
                                setOfferModalVisible(false);
                              }}
                            />
                          </CardItem>
                        </Card>
                      </View>
                    </View>
                  </Modal>

                  <Card
                    style={{
                      borderRadius: 10,
                      marginLeft: 10,
                      marginRight: 10,
                      marginTop: 20,
                    }}>
                    <CardItem style={{borderRadius: 10, paddingBottom: 0}}>
                      <Grid>
                        <Col>
                          <Text style={dynamicStyles.restaruantNameText}>
                            {restaurantName}
                          </Text>
                        </Col>

                        <Col style={{alignItems: 'flex-end'}}>
                          {apiResponse.discount != undefined && (
                            <>
                              {apiResponse.discount.status == 1 && (
                                <>
                                  <Text
                                    style={{
                                      backgroundColor: '#ff4a66',
                                      color: '#fff',
                                      fontSize: 10,
                                      paddingVertical: 1,
                                      paddingHorizontal: 2,
                                      textTransform: 'capitalize',
                                      borderRadius: 3,
                                    }}>
                                    {apiResponse.discount.off != undefined
                                      ? apiResponse.discount.off[0].discount_title.substring(
                                          0,
                                          13,
                                        ) + '*'
                                      : ''}
                                  </Text>
                                  <Text style={dynamicStyles.medium_text}>
                                    Min: &pound;
                                    {apiResponse.discount.off != undefined
                                      ? apiResponse.discount.off[0]
                                          .eligible_amount
                                      : ''}
                                  </Text>
                                </>
                              )}
                            </>
                          )}
                        </Col>
                      </Grid>
                    </CardItem>

                    <CardItem
                      style={{
                        borderRadius: 10,
                        paddingTop: 3,
                        paddingBottom: 2,
                      }}>
                      <Grid>
                        {orderPolicy.map((item, index) => (
                          <>
                            {item.policy_name == 'Collection' ? (
                              <Col>
                                {restaurantScheduleStatus == 'OPEN' ? (
                                  <Text style={dynamicStyles.medium_text}>
                                    <Icon
                                      style={styles.icon}
                                      type="FontAwesome5"
                                      name="shopping-bag"
                                    />
                                    {'  '}
                                    {item.policy_time}
                                    {' mins'}
                                  </Text>
                                ) : (
                                  <Text style={dynamicStyles.medium_text}>
                                    <Icon
                                      style={styles.icon}
                                      type="FontAwesome5"
                                      name="shopping-bag"
                                    />
                                    {'  '}
                                    {restaurantScheduleStatus}
                                  </Text>
                                )}
                              </Col>
                            ) : (
                              <Col style={{alignItems: 'center'}}>
                                {restaurantScheduleStatus == 'OPEN' ? (
                                  <Text style={dynamicStyles.medium_text}>
                                    <Icon
                                      style={styles.icon}
                                      type="FontAwesome5"
                                      name="bicycle"
                                    />
                                    {'  '}
                                    {item.policy_time} {' mins'}
                                  </Text>
                                ) : (
                                  <Text style={dynamicStyles.medium_text}>
                                    <Icon
                                      style={styles.icon}
                                      type="FontAwesome5"
                                      name="bicycle"
                                    />{' '}
                                    {restaurantScheduleStatus}
                                  </Text>
                                )}
                              </Col>
                            )}
                          </>
                        ))}

                        <Col style={{alignItems: 'flex-end'}}>
                          {distance != '' && (
                            <Text style={dynamicStyles.medium_text}>
                              <Icon
                                type="Ionicons"
                                name="location"
                                style={styles.icon}
                              />{' '}
                              {distance}
                            </Text>
                          )}
                        </Col>
                      </Grid>
                    </CardItem>

                    {apiResponse.order_policy != undefined && (
                      <CardItem
                        style={{
                          borderRadius: 10,
                          paddingTop: 2,
                          paddingBottom: 5,
                        }}>
                        <FlatList
                          data={apiResponse.order_policy.policy}
                          renderItem={({item}) => (
                            <>
                              {item.policy_name == 'Delivery' && (
                                <Text style={dynamicStyles.medium_text}>
                                  Minimum Delivery: &pound;
                                  {parseFloat(item.min_order).toFixed(2)}
                                </Text>
                              )}
                            </>
                          )}
                          keyExtractor={(item) => item.policy_id}
                        />
                      </CardItem>
                    )}
                    <CardItem
                      style={{
                        borderRadius: 10,
                        paddingTop: 3,
                        paddingBottom: 2,
                      }}>
                      <Grid
                        style={{
                          justifyContent: 'center',
                        }}>
                        <Col
                          style={{
                            borderRightWidth: 1,
                            borderRightColor: '#ed1a3b',
                            width: 80,
                          }}>
                          <Button
                            small
                            compact={true}
                            transparent
                            color="#ed1a3b"
                            style={{paddingTop: 0, alignSelf: 'center'}}
                            onPress={() => {
                              navigation.navigate('Review', {
                                restaurantId: restaurantId,
                              });
                            }}>
                            <Text style={dynamicStyles.buttonText}>REVIEW</Text>
                          </Button>
                        </Col>
                        <Col
                          style={{
                            width: 60,
                          }}>
                          <Button
                            small
                            compact={true}
                            transparent
                            color="#ed1a3b"
                            style={{paddingTop: 0, alignSelf: 'center'}}
                            onPress={() => {
                              navigation.navigate('Info', {
                                restaurantData: apiResponse,
                              });
                            }}>
                            <Text style={dynamicStyles.buttonText}>INFO</Text>
                          </Button>
                        </Col>
                        {apiResponse.accept_reservation == '1' && (
                          <Col
                            style={{
                              borderLeftWidth: 1,
                              borderLeftColor: '#ed1a3b',
                              width: 130,
                            }}>
                            <Button
                              small
                              compact={true}
                              transparent
                              color="#ed1a3b"
                              style={{paddingTop: 0, alignSelf: 'center'}}
                              onPress={() => {
                                navigation.navigate('Reservation', {
                                  restaurantData: apiResponse,
                                });
                              }}>
                              <Text style={dynamicStyles.buttonText}>
                                RESERVATION
                              </Text>
                            </Button>
                          </Col>
                        )}
                        {aviableOffersAndDiscounts.length > 0 && (
                          <Col
                            style={{
                              borderLeftWidth: 1,
                              borderLeftColor: '#ed1a3b',
                              width: 80,
                            }}>
                            <Button
                              small
                              compact={true}
                              transparent
                              color="#ed1a3b"
                              style={{paddingTop: 0, alignSelf: 'center'}}
                              onPress={() => {
                                setOfferModalVisible(!offerModalVisible);
                              }}>
                              <Text style={dynamicStyles.buttonText}>
                                OFFER
                              </Text>
                            </Button>
                          </Col>
                        )}
                      </Grid>
                    </CardItem>
                  </Card>

                  <View style={{flex: 1}}>
                    <ScrollableTabString
                      ref={(ref) => setScrollableTabStringRef(ref)}
                      dataTabs={categoryList}
                      dataSections={categoryList}
                      renderSection={(item, i) => (
                        <View>
                          <ListItem
                            key={item.category_id.toString()}
                            itemDivider>
                            <Text style={styles.large_text}>
                              {item.category_name}
                            </Text>
                          </ListItem>

                          {item.dish.map((i, index) => (
                            <ListItem key={i.dish_id.toString()}>
                              <Col style={{flex: 1.5}}>
                                <Text style={dynamicStyles.dishName}>
                                  {i.dish_name}
                                </Text>
                                {i.dish_description != '' && (
                                  <Text style={dynamicStyles.medium_text}>
                                    {i.dish_description.trim()}
                                  </Text>
                                )}

                                {i.dish_allergens != null && (
                                  <FlatList
                                    horizontal
                                    data={i.dish_allergens}
                                    renderItem={({item, index}) => (
                                      <Text style={dynamicStyles.medium_text}>
                                        {index == 0 && `Allergence: `}
                                        {item == '1' && `Fish`}
                                        {item == '2' && `Peanuts`}
                                        {item == '3' && `Nut`}
                                        {item == '4' && `Egg`}
                                        {item == '5' && `Milk`}
                                        {item == '6' && `Mustard`}
                                        {item == '7' && `Soya`}
                                        {item == '8' && `Crustaceans`}
                                        {item == '9' && `Sesame Seeds`}
                                        {item == '10' && `Cereals glut`}
                                        {index + 1 != i.dish_allergens.length &&
                                          ', '}
                                      </Text>
                                    )}
                                    keyExtractor={(item, index) => {
                                      return 'allergence_' + item + '_' + index;
                                    }}
                                  />
                                )}
                              </Col>
                              <Col style={{flex: 0.1}} />
                              <Col style={{flex: 1}}>
                                {i.option == undefined ? (
                                  <Grid>
                                    <Col
                                      style={{
                                        alignSelf: 'center',
                                        flex: 0.9,
                                      }}>
                                      <Text style={{textAlign: 'center'}}>
                                        &pound;{i.dish_price}
                                      </Text>
                                    </Col>

                                    {cart.associativeMenuObj[i.dish_id] ==
                                    undefined ? (
                                      <>
                                        {i.is_pizza_menu ? (
                                          <Col
                                            style={{
                                              flex: 1.5,
                                              alignSelf: 'center',
                                            }}>
                                            <Button
                                              mode="outlined"
                                              color="#ed1a3b"
                                              compact={true}
                                              labelStyle={{fontSize: 12}}
                                              style={{borderColor: '#ed1a3b'}}
                                              onPress={() =>
                                                navigation.navigate(
                                                  'PizzaMenuRegular',
                                                  {
                                                    param: i,
                                                  },
                                                )
                                              }>
                                              VIEW
                                            </Button>
                                          </Col>
                                        ) : (
                                          <Col
                                            style={{
                                              flex: 1.5,
                                              alignSelf: 'center',
                                            }}>
                                            <Button
                                              mode="outlined"
                                              color="#ed1a3b"
                                              compact={true}
                                              labelStyle={{fontSize: 12}}
                                              style={{borderColor: '#ed1a3b'}}
                                              onPress={() => addItemToCart(i)}>
                                              ADD
                                            </Button>
                                          </Col>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {cart.associativeMenuObj[i.dish_id] ==
                                          0 && (
                                          <>
                                            {!i.is_pizza_menu && (
                                              <Col
                                                style={{
                                                  flex: 1.5,
                                                  alignSelf: 'center',
                                                }}>
                                                <Button
                                                  mode="outlined"
                                                  compact={true}
                                                  color="#ed1a3b"
                                                  labelStyle={{fontSize: 12}}
                                                  style={{
                                                    borderColor: '#ed1a3b',
                                                  }}
                                                  onPress={() =>
                                                    addItemToCart(i)
                                                  }>
                                                  ADD
                                                </Button>
                                              </Col>
                                            )}
                                          </>
                                        )}
                                      </>
                                    )}

                                    {cart.associativeMenuObj[i.dish_id] !=
                                      undefined && (
                                      <>
                                        {i.is_pizza_menu ? (
                                          <Col
                                            style={{
                                              flex: 1.5,
                                              alignSelf: 'center',
                                            }}>
                                            <Button
                                              mode="outlined"
                                              color="#ed1a3b"
                                              compact={true}
                                              labelStyle={{fontSize: 12}}
                                              style={{borderColor: '#ed1a3b'}}
                                              onPress={() =>
                                                navigation.navigate(
                                                  'PizzaMenuRegular',
                                                  {
                                                    param: i,
                                                  },
                                                )
                                              }>
                                              VIEW
                                            </Button>
                                          </Col>
                                        ) : (
                                          <>
                                            {cart.associativeMenuObj[
                                              i.dish_id
                                            ] > 0 && (
                                              <Col
                                                style={{
                                                  alignSelf: 'flex-end',
                                                  flex: 1.5,
                                                }}>
                                                <Grid>
                                                  <Col
                                                    style={{
                                                      alignSelf: 'center',
                                                    }}>
                                                    <TouchableWithoutFeedback
                                                      onPress={() => {
                                                        removeItemFromCart(i);
                                                      }}>
                                                      <Icon
                                                        style={{
                                                          color: '#ed1a3b',
                                                          textAlign: 'center',
                                                          borderColor:
                                                            '#ed1a3b',
                                                          borderRadius: 2,
                                                          borderWidth: 0.5,
                                                          fontSize: 20,
                                                        }}
                                                        type="AntDesign"
                                                        name="minus"
                                                      />
                                                    </TouchableWithoutFeedback>
                                                  </Col>
                                                  <Col
                                                    style={{
                                                      alignSelf: 'center',
                                                    }}>
                                                    <Text
                                                      style={{
                                                        textAlign: 'center',
                                                      }}>
                                                      {
                                                        cart.associativeMenuObj[
                                                          i.dish_id
                                                        ]
                                                      }
                                                    </Text>
                                                  </Col>

                                                  <Col
                                                    style={{
                                                      alignSelf: 'center',
                                                    }}>
                                                    <TouchableWithoutFeedback
                                                      onPress={() => {
                                                        addItemToCart(i);
                                                      }}>
                                                      <Icon
                                                        style={{
                                                          color: '#ed1a3b',
                                                          textAlign: 'center',
                                                          borderColor:
                                                            '#ed1a3b',
                                                          borderRadius: 2,
                                                          borderWidth: 0.5,
                                                          fontSize: 17,
                                                        }}
                                                        type="Ionicons"
                                                        name="add-sharp"
                                                      />
                                                    </TouchableWithoutFeedback>
                                                  </Col>
                                                </Grid>
                                              </Col>
                                            )}
                                          </>
                                        )}
                                      </>
                                    )}
                                  </Grid>
                                ) : (
                                  <Grid>
                                    <Col
                                      style={{
                                        alignSelf: 'center',
                                        flex: 0.9,
                                      }}>
                                      <Text style={{textAlign: 'center'}}>
                                        &pound;{i.dish_price}
                                      </Text>
                                    </Col>
                                    <Col style={{flex: 1.5,alignSelf: 'center'}}>
                                      <Button
                                        mode="outlined"
                                        compact={true}
                                        color="#ed1a3b"
                                        labelStyle={{fontSize: 11}}
                                        style={{borderColor: '#ed1a3b'}}
                                        onPress={() => {
                                          setParentDishName(i.dish_name);
                                          setOptions(i.option);
                                          setOptionModalVisible(
                                            !optionModalVisible,
                                          );
                                        }}>
                                        {' '}
                                        OPTIONS
                                      </Button>
                                    </Col>
                                  </Grid>
                                )}
                              </Col>
                            </ListItem>
                          ))}
                        </View>
                      )}
                      renderTabName={(item, index) => (
                        <Text
                          key={item.category_name.toString()}
                          style={styles.large_text}>
                          {item.category_name.toUpperCase()}
                        </Text>
                      )}
                      selectedTabStyle={{
                        borderRadius: 10,
                        backgroundColor: '#fff',
                        margin: 2,
                        borderWidth: 0,
                        marginHorizontal: 10,
                        borderBottomWidth: 3,
                        borderBottomColor: '#ed1a3b',
                        color: '#ed1a3b',
                        borderRadius: 0,
                        marginVertical: 7,
                        paddingBottom: 5,
                      }}
                      unselectedTabStyle={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        borderWidth: 1,
                        margin: 2,
                        borderWidth: 0,
                        color: '#000',
                        marginHorizontal: 10,
                        marginVertical: 7,
                      }}
                    />
                  </View>

                  {localTotal > 0 && (
                    <View style={{flex: 0.1}}>
                      <Snackbar
                        style={{backgroundColor: '#ed1a3b', color: '#fff'}}
                        visible={localTotal > 0}
                        theme={{colors: {accent: 'white'}}}
                        onDismiss={() => {}}
                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'center',
                        }}
                        action={{
                          label: 'GO TO CART',
                          action: '#fff',
                          onPress: () => {
                            navigation.navigate('Cart');
                          },
                        }}>
                        <Text
                          style={{
                            flex: 1,
                            color: '#fff',
                            borderRightWidth: 1,
                          }}>
                          TOTAL: &pound; {localTotal.toFixed(2)}
                        </Text>
                      </Snackbar>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  large_text: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  medium_text: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  small_text: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  icon: {
    fontSize: 14,
    color: '#ff4a66',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    backgroundColor: 'rgba(163, 163, 163, 0.89)',
  },
});