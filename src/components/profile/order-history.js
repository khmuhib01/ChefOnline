import React, {useEffect, useState, useContext} from 'react';
import {StyleSheet, TouchableWithoutFeedback, View, Alert} from 'react-native';
import Config from 'react-native-config';
import getData from '../api';
import {
  Body,
  Card,
  CardItem,
  Container,
  Icon,
  Left,
  Right,
  Spinner,
  Text,
  Col,
} from 'native-base';
import {FlatList} from 'react-native-gesture-handler';
import {useSelector, useDispatch} from 'react-redux';
import AppButtonClear from '../common/app-button-clear';
import AppButtonContained from '../common/app-button-contained';
import {Snackbar} from 'react-native-paper';
import CartContext from '../../context/cart-context';

import moment from 'moment';

export default function OrderHistory({navigation}) {
  //for context
  const {cart, setCart} = useContext(CartContext);

  //for redux
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState();
  const [msg, setMsg] = useState();
  const profile = useSelector((state) => state.profile);
  const [visibleSnackbar, setVisibleSnackbar] = React.useState(false);
  const [snackbarMsg, setsnackbarMsg] = useState('');

  //for reorder
  const [selectedOrder, setselectedOrder] = useState({});
  const [
    selectedRestaruantApiResponse,
    setselectedRestaruantApiResponse,
  ] = useState({});
  const [currentApiDateTimeObj, setCurrentApiDateTimeObj] = useState('');
  const [restaurantDishList, setRestaurantDishList] = useState([]);
  const [restaurantScheduleStatus, setRestaurantScheduleStatus] = useState('');
  const [aviableOffersAndDiscounts, setAviableOffersAndDiscounts] = useState(
    [],
  );

  useEffect(() => {
    getOrderHistory();
  }, []);

  useEffect(() => {
    if (selectedRestaruantApiResponse.restaurant_id != undefined) {
      //getCurrentTime();
      generateDishList();
    }
  }, [selectedRestaruantApiResponse]);

  useEffect(() => {
    if (restaurantDishList.length > 0) {
      getCurrentTime();
    }
  }, [restaurantDishList]);

  useEffect(() => {
    if (currentApiDateTimeObj != '') {
      getRestaurantScheduleStatus();
    }
  }, [currentApiDateTimeObj]);

  const getOrderHistory = async () => {
    setLoading(true);
    await getData(
      Config.API_URL + 'funId=13&userid=' + profile.userDetails.userid,
    )
      .then((response) => {
        if (response.data.status == 'Success') {
          setApiResponse(response.data.orders);
          setMsg(response.data.msg);
        } else {
          // console.warn(response.data.app[0].msg);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error);
      });
  };

  const onPressReOrder = (order) => {
    if (cart.badgeCount == 0) {
      setLoading(true);
      setselectedOrder(order);
      getRestaruantMenu(order);
    } else {
      showAlert(order);
    }
  };

  const getRestaruantMenu = async (order) => {
    setLoading(true);
    await getData(Config.API_URL + 'funId=81&rest_id=' + order.rest_id)
      .then((response) => {
        if (response.data.app[0].red_sticker == '0') {
          setselectedRestaruantApiResponse(response.data.app[0]);
        } else {
          setsnackbarMsg('This restaurant is currently unavailable.');
          setVisibleSnackbar(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error);
      });
  };

  const generateDishList = () => {
    let dishes = [];
    for (var a = 0; a < selectedRestaruantApiResponse.cuisine.length; a++) {
      for (
        var b = 0;
        b < selectedRestaruantApiResponse.cuisine[a].category.length;
        b++
      ) {
        for (
          var c = 0;
          c < selectedRestaruantApiResponse.cuisine[a].category[b].dish.length;
          c++
        ) {
          dishes.push(
            selectedRestaruantApiResponse.cuisine[a].category[b].dish[c],
          );
        }
      }
    }

    setRestaurantDishList(dishes);
  };

  const getCurrentTime = async () => {
    await getData(Config.API_URL + 'funId=79')
      .then((response) => {
        setCurrentApiDateTimeObj(response.data.data);
      })
      .catch((error) => {
        console.warn(error.message);
        setLoading(false);
      });
  };

  const getRestaurantScheduleStatus = () => {
    let shiftPassed = [];
    let numberOfShifts = 0;
    let tempRestaruantScheduleStatus = '';
    let scheduleList =
      selectedRestaruantApiResponse.restuarent_schedule == undefined
        ? []
        : selectedRestaruantApiResponse.restuarent_schedule.schedule;

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
        } else if (shiftPassed.length >= numberOfShifts) {
          tempRestaruantScheduleStatus = 'CLOSED';
        } else if (
          shiftPassed.length < numberOfShifts &&
          tempRestaruantScheduleStatus == ''
        ) {
          tempRestaruantScheduleStatus = 'PRE-ORDER';
        }
      } else {
        tempRestaruantScheduleStatus = 'CLOSED';
      }
    }

    setRestaurantScheduleStatus(tempRestaruantScheduleStatus);

    if (
      tempRestaruantScheduleStatus == 'PRE-ORDER' ||
      tempRestaruantScheduleStatus == 'OPEN'
    ) {
      getOrderData();
    } else if (tempRestaruantScheduleStatus == 'CLOSED') {
      setsnackbarMsg('This restaurant is closed now.');
      setVisibleSnackbar(true);
      setLoading(false);
    } else {
      setsnackbarMsg('This restaurant is currently unavailable.');
      setVisibleSnackbar(true);
      setLoading(false);
    }
  };

  const getOrderData = async () => {
    await getData(
      Config.API_URL + 'funId=14&order_id=' + selectedOrder.order_no,
    )
      .then((response) => {
        addItemsToCart(response.data.order[0].ordered_dish.dish_choose);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error);
      });
  };

  const showAlert = (order) => {
    Alert.alert(
      'MESSAGE',
      'Your cart will be lost while you select different restaurant',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            let payload = {
              dish: [],
              subTotal: 0.0,
              availedDiscountAmount: 0.0,
              associativeMenuObj: {},
              badgeCount: 0,
              selectedOrderPolicy: {},
              availedDiscount: {},
              availedOffer: {},
              availedVoucher: {},
              selectedPaymentMethod: {},
              scheduleList: [],
            };
            setCart(payload);
            dispatch({type: 'CLEAR_RESTAURANT_DATA'});

            setselectedOrder(order);
            getRestaruantMenu(order);

            // addItemsToCart(response.data.order[0].ordered_dish.dish_choose);
            // navigation.navigate('Menu', {
            //   restaurantId: param.rest_id,
            //   restaurantName: param.restaurant_name,
            //   distance: param.distance,
            // });
          },
        },
      ],
      {cancelable: false},
    );
  };

  const addItemsToCart = (dishList) => {
    console.log('Ordered Dish List: ', dishList);
    console.log('Restaurant Dish List: ', restaurantDishList);
    let tempTotal = 0;
    let tempBadgeCount = 0;
    let dishFound = 0;

    let tempAssociativeMenuObj = cart.associativeMenuObj;
    let tempDish = {};
    tempDish = cart.dish;

    for (var a = 0; a < dishList.length; a++) {
      for (var b = 0; b < restaurantDishList.length; b++) {
        if (restaurantDishList[b].option == undefined) {
          //has no option
          if (dishList[a].dish_id == restaurantDishList[b].dish_id) {

            
            if (dishList[a].pizza == undefined || dishList[a].pizza == null) {
              tempTotal =
                tempTotal +
                parseFloat(restaurantDishList[b].dish_price) *
                  parseFloat(dishList[a].quantity);
            } else {
              tempTotal =
                tempTotal +
                parseFloat(dishList[a].pizza.dish_price) *
                  parseFloat(dishList[a].quantity);
            }

            tempBadgeCount = tempBadgeCount + parseInt(dishList[a].quantity);

            let obj = {};
            obj.dish_id = dishList[a].dish_id;
            obj.dish_name = dishList[a].dish_name;
            obj.dish_price = parseFloat(dishList[a].dish_price);
            obj.quantity = parseInt(dishList[a].quantity);
            obj.pizza = dishList[a].pizza;
            tempDish.push(obj);
            tempAssociativeMenuObj[dishList[a].dish_id] = 1;

            let payload = {};
            payload.dish = tempDish;
            payload.subTotal = tempTotal;
            payload.associativeMenuObj = tempAssociativeMenuObj;
            payload.badgeCount = tempBadgeCount;
            payload.availedDiscountAmount = 0;
            payload.selectedOrderPolicy = {};
            payload.availedDiscount = {};
            payload.availedOffer = {};
            payload.availedVoucher = {};
            payload.selectedPaymentMethod = {};
            payload.scheduleList = cart.scheduleList;
            setCart(payload);
            dishFound++;
            break;
          }
        } else {
          //has  option
          for (var c = 0; c < restaurantDishList[b].option.length; c++) {
            if (
              dishList[a].dish_id == restaurantDishList[b].option[c].self_id
            ) {


              if (dishList[a].pizza == undefined || dishList[a].pizza == null) {
                tempTotal =
                  tempTotal +
                  parseFloat(restaurantDishList[b].option[c].option_price) *
                    parseFloat(dishList[a].quantity);
              } else {
                tempTotal =
                  tempTotal +
                  parseFloat(dishList[a].pizza.dish_price) *
                    parseFloat(dishList[a].quantity);
              }

              tempBadgeCount = tempBadgeCount + parseInt(dishList[a].quantity);

              let obj = {};
              obj.dish_id = restaurantDishList[b].option[c].self_id;
              obj.dish_name =
                restaurantDishList[b].dish_name +
                restaurantDishList[b].option[c].option_name;
              obj.dish_price = parseFloat(
                restaurantDishList[b].option[c].option_price,
              );
              obj.quantity = parseInt(dishList[a].quantity);
              obj.pizza = dishList[a].pizza;
              tempDish.push(obj);
              tempAssociativeMenuObj[dishList[a].dish_id] = 1;

              let payload = {};
              payload.dish = tempDish;
              payload.subTotal = tempTotal;
              payload.associativeMenuObj = tempAssociativeMenuObj;
              payload.badgeCount = tempBadgeCount;
              payload.availedDiscountAmount = 0;
              payload.selectedOrderPolicy = {};
              payload.availedDiscount = {};
              payload.availedOffer = {};
              payload.availedVoucher = {};
              payload.selectedPaymentMethod = {};
              payload.scheduleList = cart.scheduleList;
              setCart(payload);
              dishFound++;
              break;
            }
          }
        }
      }
    }

    if (dishFound > 0) {
      getAvailableDiscountAndOffer();
    }
  };

  const getAvailableDiscountAndOffer = () => {
    let tempOfferDiscount = [];
    let tempDiscount = [];
    let tempOffer = [];

    if (selectedRestaruantApiResponse.discount.status != undefined) {
      if (selectedRestaruantApiResponse.discount.status == 1) {
        for (
          var a = 0;
          a < selectedRestaruantApiResponse.discount.off.length;
          a++
        ) {
          let obj = {};
          obj.id = selectedRestaruantApiResponse.discount.off[a].discount_id;
          obj.title =
            selectedRestaruantApiResponse.discount.off[a].discount_title;
          obj.description =
            selectedRestaruantApiResponse.discount.off[a].discount_description;
          tempOfferDiscount.push(obj);
          tempDiscount.push(selectedRestaruantApiResponse.discount.off[a]);
        }
      }
    }

    if (selectedRestaruantApiResponse.offer.status != undefined) {
      if (selectedRestaruantApiResponse.offer.status == 1) {
        for (
          var a = 0;
          a < selectedRestaruantApiResponse.offer.offer_list.length;
          a++
        ) {
          let obj = {};
          obj.id = selectedRestaruantApiResponse.offer.offer_list[a].id;
          obj.title =
            selectedRestaruantApiResponse.offer.offer_list[a].offer_title;
          obj.description =
            selectedRestaruantApiResponse.offer.offer_list[a].description;
          tempOffer.push(selectedRestaruantApiResponse.offer.offer_list[a]);
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
    await getData(Config.API_URL + 'funId=78&rest_id=' + selectedOrder.rest_id)
      .then((response) => {
        let payload = {};
        payload.restaurantId = selectedOrder.rest_id;
        payload.restaurantName = selectedOrder.restaurant_name;
        payload.restaurantScheduleList =
          selectedRestaruantApiResponse.restuarent_schedule.schedule;
        payload.availableOrderPolicy =
          selectedRestaruantApiResponse.order_policy.policy;
        payload.availableDiscounts = availableDiscounts;
        payload.availableOffers = availableOffers;
        payload.restaruantScheduleStatus = restaurantScheduleStatus;
        payload.latitude = selectedRestaruantApiResponse.latitude;
        payload.longitude = selectedRestaruantApiResponse.longitude;

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

        navigation.navigate('Cart');
      })
      .catch((error) => {
        console.warn(error.message);
      });
  };

  const renderOrders = ({item}) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate('OrderHistoryDetail', {
            orderId: item.order_no,
          });
        }}>
        <Card style={styles.card}>
          <CardItem style={styles.cardItem} bordered>
            <Left>
              <Text style={styles.text} numberOfLines={1}>
                {item.restaurant_name}
              </Text>
            </Left>
            <Right>
              <Text style={styles.text}>ORDER ID - {item.order_no}</Text>
            </Right>
          </CardItem>
          <CardItem style={styles.cardItem}>
            <Left>
              <Icon style={styles.icon} type="Ionicons" name="location" />
              <Text style={styles.text}>{item.postcode}</Text>
            </Left>
            <Right>
              <Text style={styles.text}>{item.delivery_date}</Text>
            </Right>
          </CardItem>
          <CardItem style={styles.cardItem}>
            <Text style={styles.text}>
              IN: {item.order_time} | OUT: {item.delivery_time}
            </Text>
          </CardItem>
          <CardItem style={styles.cardItem}>
            <Left>
              {item.order_type == 'Collection' ? (
                <>
                  <Icon style={styles.icon} type="Entypo" name="shopping-bag" />
                  <Text style={styles.text}>{item.order_type}</Text>
                </>
              ) : (
                <>
                  <Icon style={styles.icon} type="FontAwesome" name="bicycle" />
                  <Text style={styles.text}>{item.order_type}</Text>
                </>
              )}
            </Left>
            <Right>
              <Text style={styles.text}>
                {item.payment_method}: &pound;{item.grand_total}
              </Text>
            </Right>
          </CardItem>

          <CardItem footer style={styles.cardItem}>
            <Col style={{marginRight: 2}}>
              <AppButtonContained
                text="REORDER"
                onClick={() => onPressReOrder(item)}
              />
            </Col>
            <Col>
              <AppButtonContained
                text="REVIEW & RATING"
                onClick={() => {
                  navigation.navigate('RatingAndReview', {
                    orderId: item.order_no,
                  });
                }}
              />
            </Col>
          </CardItem>
        </Card>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <Container style={{padding: 5, justifyContent: 'center'}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <>
          {/* <Text style={{alignSelf: 'center'}}>{msg}</Text> */}
          <FlatList
            data={apiResponse}
            renderItem={renderOrders}
            keyExtractor={(item) => item.order_no}
          />
          <Snackbar
            visible={visibleSnackbar}
            duration={10000}
            onDismiss={() => {
              setVisibleSnackbar(false);
            }}
            action={{
              label: 'Okay',
              onPress: () => {
                setVisibleSnackbar(false);
              },
            }}>
            {snackbarMsg}
          </Snackbar>
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
  },
  cardItem: {
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  text: {
    fontSize: 12,
  },
  icon: {
    fontSize: 18,
    color: '#EC1A3A',
  },
});
