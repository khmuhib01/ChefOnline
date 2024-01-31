import {
  Container,
  Card,
  CardItem,
  ListItem,
  Col,
  Grid,
  Icon,
  Item,
  H1,
  Header,
  Left,
  Title,
  Right,
} from 'native-base';
import React, {useState, useEffect, useContext} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Text, Snackbar, Button, RadioButton, Appbar} from 'react-native-paper';
import AppButtonClear from '../common/app-button-clear';
import AppButtonContained from '../common/app-button-contained';
import CartContext from '../../context/cart-context';
import {useDispatch, useSelector} from 'react-redux';

export default function Cart({navigation, route}) {
  //for context
  const {cart, setCart} = useContext(CartContext);
  //for redux
  const dispatch = useDispatch();
  const restaurant = useSelector(state => state.restaurant);
  const profile = useSelector(state => state.profile);

  const rest_id = useSelector(state => state.restaurant.restaurantId);
  const rest_name = useSelector(state => state.restaurant.restaurantName);

  const [localSubTotal, setLocalSubTotal] = useState(0);
  const [localDiscount, setLocalDiscount] = useState(0);
  const [localTotal, setLocalTotal] = useState(0);
  const [excludeFrom, setExcludeFrom] = useState(0);

  const [availableDiscountList, setAvailableDiscountList] = useState([]);
  const [availableOfferList, setAvailableOfferList] = useState([]);
  const [snackBarErrorMessage, setSnackBarErrorMessage] = useState('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);

  // React.useLayoutEffect(() => {
  //   let text = 'ADD MORE';
  //   if (cart.dish.length == 0) {
  //     text = 'GO TO HOME';
  //   }

  //   navigation.setOptions({
  //     headerRight: () => <AppButtonClear text={text} onClick={gotoMenu} />,
  //   });
  // }, [navigation]);

  useEffect(() => {
    setLocalSubTotal(cart.subTotal);
    setLocalDiscount(cart.availedDiscountAmount);
    let temp = cart.subTotal - cart.availedDiscountAmount;
    //console.log(cart);
    setLocalTotal(temp);
    setExcludeFrom(cart.excludeFromOffer);

    console.log('First Load Not for Discount @@' + cart.excludeFromOffer);
  }, []);

  useEffect(() => {}, [restaurant]);

  useEffect(() => {
    if (cart.subTotal != localTotal) {
      setLocalSubTotal(cart.subTotal);
      let temp = cart.subTotal - cart.availedDiscountAmount;
      setLocalTotal(temp);
      setExcludeFrom(cart.excludeFromOffer);
      setLocalDiscount(0);
      calculateDiscount();
      calculateOffer();
    }
    // console.warn('called 2');
  }, [cart.subTotal]);

  useEffect(() => {
    calculateDiscount();
    calculateOffer();
  }, [
    cart.selectedOrderPolicy,
    cart.availedDiscount,
    cart.availedOffer,
    localSubTotal,
  ]);

  useEffect(() => {
    let temp = cart.subTotal - localDiscount;
    setLocalTotal(temp);
    setExcludeFrom(cart.excludeFromOffer);

    let payload = {};
    payload.dish = cart.dish;
    payload.subTotal = cart.subTotal;
    payload.excludeFromOffer = cart.excludeFromOffer;
    payload.associativeMenuObj = cart.associativeMenuObj;
    payload.availedDiscountAmount = localDiscount;
    payload.badgeCount = cart.badgeCount;
    payload.selectedOrderPolicy = cart.selectedOrderPolicy;
    payload.availedDiscount = cart.availedDiscount;
    payload.availedOffer = cart.availedOffer;
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = cart.selectedPaymentMethod;
    payload.scheduleList = cart.scheduleList;
    setCart(payload);
  }, [localDiscount]);

  const gotoCheckout = () => {
    navigation.navigate('Checkout');
  };

  const gotoMenu = () => {
    if (cart.dish.length == 0) {
      navigation.reset({index: 0, routes: [{name: 'Search'}]});
    } else {
      navigation.navigate('Menu', {
        restaurantId: restaurant.restaurantId,
        restaurantName: restaurant.restaurantName,
        distance: 0,
      });

      // navigation.navigate('Menu');
    }
  };

  /*const increaseItemQuantity = (item) => { 

    let tempTotal = 0;
     
    if(item.pizza == undefined || item.pizza == null){
      
      tempTotal = localSubTotal + parseFloat(item.dish_price);

      tempTotal = (tempTotal).toFixed(2);

      console.log(localSubTotal);

      console.log(item.dish_price);

    }else{
      tempTotal = localSubTotal + parseFloat(item.pizza.dish_price);

      tempTotal = (tempTotal).toFixed(2);

    }  
    
    console.log(tempTotal);
    
    setLocalSubTotal(tempTotal);    
    
    tempTotal = tempTotal - localDiscount;
    setLocalTotal(tempTotal);

    tempTotal = cart.subTotal;

    let exclude_from_offer = item.exclude_from_offer; 
    let excludeFromTotal = parseFloat(excludeFrom);	
    
    if(exclude_from_offer){			
			excludeFromTotal += parseFloat(item.dish_price);
      			
			setExcludeFrom(excludeFromTotal);

			console.log(excludeFromTotal + ' ## Not for Discount ## ' + parseFloat(item.dish_price));
		}
    
    if(item.pizza == undefined || item.pizza == null){
      tempTotal = localSubTotal + parseFloat(item.dish_price);
    }else{
      tempTotal = localSubTotal + parseFloat(item.pizza.dish_price);
    }  
   
    let tempBadgeCount = cart.badgeCount;
    tempBadgeCount++;


    let tempDish = cart.dish;
    let index = -1;

    if (tempDish.length > 0) {
      index = tempDish.findIndex(
        (array_item) => array_item.dish_id === item.dish_id,
      );
    }
    tempDish[index].quantity++;
    let tempAssociativeMenuObj = cart.associativeMenuObj;
    tempAssociativeMenuObj[item.dish_id] = tempDish[index].quantity;

    let payload = {};

    payload.dish = tempDish;
    payload.subTotal = tempTotal;
    payload.excludeFromOffer = excludeFromTotal;
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
  }; */

  const increaseItemQuantity = item => {
    let tempTotal = 0;
    let excludeFromTotal = cart.excludeFromOffer;
    let tempBadgeCount = cart.badgeCount;
    let tempDish = [...cart.dish];
    let index = tempDish.findIndex(
      array_item => array_item.dish_id === item.dish_id,
    );

    if (index === -1) {
      tempDish.push({...item, quantity: 1});
    } else {
      tempDish[index].quantity++;
    }

    if (item.exclude_from_offer) {
      excludeFromTotal += parseFloat(item.dish_price);
      excludeFromTotal = parseFloat(excludeFromTotal.toFixed(2));
    }

    if (item.pizza) {
      tempTotal = localSubTotal + parseFloat(item.pizza.dish_price);
    } else {
      tempTotal = localSubTotal + parseFloat(item.dish_price);
    }

    tempTotal = parseFloat(tempTotal.toFixed(2));

    console.log(tempTotal);

    let tempAssociativeMenuObj = {
      ...cart.associativeMenuObj,
      [item.dish_id]: tempDish[index].quantity,
    };

    let payload = {
      dish: tempDish,
      subTotal: tempTotal,
      excludeFromOffer: excludeFromTotal,
      associativeMenuObj: tempAssociativeMenuObj,
      availedDiscountAmount: cart.availedDiscountAmount,
      badgeCount: tempBadgeCount + 1,
      selectedOrderPolicy: cart.selectedOrderPolicy,
      availedDiscount: cart.availedDiscount,
      availedOffer: cart.availedOffer,
      availedVoucher: cart.availedVoucher,
      selectedPaymentMethod: cart.selectedPaymentMethod,
      scheduleList: cart.scheduleList,
    };

    setCart(payload);
  };

  const decreaseItemQuantity = item => {
    let tempDish = cart.dish;
    let index = -1;
    if (tempDish.length > 0) {
      index = tempDish.findIndex(
        array_item => array_item.dish_id === item.dish_id,
      );
    }
    let tempTotal = 0;
    if (item.pizza == undefined || item.pizza == null) {
      tempTotal = localSubTotal - parseFloat(item.dish_price);
    } else {
      tempTotal = localSubTotal - parseFloat(item.pizza.dish_price);
    }

    setLocalSubTotal(tempTotal);

    tempTotal = tempTotal - localDiscount;

    setLocalTotal(tempTotal);

    tempTotal = cart.subTotal;

    let exclude_from_offer = item.exclude_from_offer;
    let excludeFromTotal = parseFloat(excludeFrom);

    if (exclude_from_offer) {
      excludeFromTotal -= parseFloat(item.dish_price);

      excludeFromTotal = parseFloat(excludeFromTotal.toFixed(2));

      setExcludeFrom(excludeFromTotal);

      console.log(
        excludeFromTotal +
          ' ## Not for Discount ## ' +
          parseFloat(item.dish_price),
      );
    }

    if (item.pizza == undefined || item.pizza == null) {
      tempTotal = parseFloat(tempTotal) - parseFloat(item.dish_price);
    } else {
      tempTotal = tempTotal - parseFloat(item.pizza.dish_price);
    }

    tempTotal = parseFloat(tempTotal.toFixed(2));

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
    let payload = {};

    console.log(tempTotal);

    payload.dish = tempDish;
    payload.subTotal = tempTotal;
    payload.excludeFromOffer = excludeFromTotal;
    payload.availedDiscountAmount = cart.availedDiscountAmount;
    payload.badgeCount = tempBadgeCount;
    payload.associativeMenuObj = cart.associativeMenuObj;
    payload.selectedOrderPolicy = cart.selectedOrderPolicy;
    payload.availedDiscount = cart.availedDiscount;
    payload.availedOffer = cart.availedOffer;
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = cart.selectedPaymentMethod;
    payload.scheduleList = cart.scheduleList;
    setCart(payload);
    //console.log(tempTotal);
  };

  const onSelectOrderPolicy = policy => {
    let payload = {};
    payload.dish = cart.dish;
    payload.subTotal = cart.subTotal;
    payload.excludeFromOffer = cart.excludeFromOffer;
    payload.availedDiscountAmount = cart.availedDiscountAmount;
    payload.associativeMenuObj = cart.associativeMenuObj;
    payload.badgeCount = cart.badgeCount;
    payload.selectedOrderPolicy = policy;
    payload.availedDiscount = {};
    payload.availedOffer = {};
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = cart.selectedPaymentMethod;
    payload.scheduleList = cart.scheduleList;
    setCart(payload);
  };

  const calculateDiscount = () => {
    if (cart.selectedOrderPolicy.policy_id) {
      //console.log('policy is selected');

      let excludeFromTotal = cart.subTotal - cart.excludeFromOffer;

      excludeFromTotal = parseFloat(excludeFromTotal.toFixed(2));

      // console.log("Subtotal ##" + cart.subTotal);

      // console.log('For Discount ## ' + excludeFromTotal);

      // console.log('Not For Discount ## ' + cart.excludeFromOffer);

      let tempAvailableDiscountList = [];

      for (var a = 0; a < restaurant.availableDiscounts.length; a++) {
        if (
          (restaurant.availableDiscounts[a].restaurant_order_policy_id == 0 ||
            restaurant.availableDiscounts[a].restaurant_order_policy_id ==
              cart.selectedOrderPolicy.policy_id) &&
          restaurant.availableDiscounts[a].active == 1
        ) {
          if (
            excludeFromTotal >=
            parseFloat(restaurant.availableDiscounts[a].eligible_amount)
          ) {
            tempAvailableDiscountList.push(restaurant.availableDiscounts[a]);
            if (restaurant.availableDiscounts[a].default == '1') {
              if (cart.availedDiscount.discount_id == undefined) {
                let payload = {};
                payload.dish = cart.dish;
                payload.subTotal = cart.subTotal;
                payload.excludeFromOffer = cart.excludeFromOffer;
                payload.availedDiscountAmount = cart.availedDiscountAmount;
                payload.associativeMenuObj = cart.associativeMenuObj;
                payload.badgeCount = cart.badgeCount;
                payload.selectedOrderPolicy = cart.selectedOrderPolicy;
                payload.availedDiscount = restaurant.availableDiscounts[a];
                payload.availedOffer = cart.availedOffer;
                payload.availedVoucher = cart.availedVoucher;
                payload.selectedPaymentMethod = cart.selectedPaymentMethod;
                payload.scheduleList = cart.scheduleList;
                setCart(payload);

                //console.log(payload)
              }
            }

            //console.log(tempAvailableDiscountList);

            setAvailableDiscountList(tempAvailableDiscountList);

            if (cart.availedDiscount.discount_id != undefined) {
              if (cart.availedDiscount.discount_type == 'Percentage') {
                let tempDiscount =
                  (parseFloat(excludeFromTotal) *
                    parseFloat(cart.availedDiscount.discount_amount)) /
                  100;
                setLocalDiscount(tempDiscount.toFixed(2));
              } else {
                let tempDiscount = parseFloat(
                  cart.availedDiscount.discount_amount,
                );
                setLocalDiscount(tempDiscount.toFixed(2));
              }
            } else {
              setLocalDiscount(0);
            }
          } else {
            setLocalDiscount(0);
            setAvailableDiscountList([]);
          }
        } else {
          console.log('Not for Discount !! ..' + cart.availedDiscountAmount);
          setAvailableDiscountList([]);
          setLocalDiscount(0);
        }
      }
    } else {
      setAvailableDiscountList([]);
    }
  };

  /*const calculateDiscount = () => {
    if (cart.selectedOrderPolicy.policy_id) {
      //console.warn('policy is selected');
      let tempAvailableDiscountList = [];
      for (var a = 0; a < restaurant.availableDiscounts.length; a++) {
        if (
          (restaurant.availableDiscounts[a].restaurant_order_policy_id == 0 ||
            restaurant.availableDiscounts[a].restaurant_order_policy_id ==
              cart.selectedOrderPolicy.policy_id) &&
          restaurant.availableDiscounts[a].active == 1
        ) {
          if (
            cart.subTotal >=
            parseFloat(restaurant.availableDiscounts[a].eligible_amount)
          ) {
            tempAvailableDiscountList.push(restaurant.availableDiscounts[a]);

            if (restaurant.availableDiscounts[a].default == '1') {
              if (cart.availedDiscount.discount_id == undefined) {
                let payload = {};
                payload.dish = cart.dish;
                payload.subTotal = cart.subTotal;
                payload.availedDiscountAmount = cart.availedDiscountAmount;
                payload.associativeMenuObj = cart.associativeMenuObj;
                payload.badgeCount = cart.badgeCount;
                payload.selectedOrderPolicy = cart.selectedOrderPolicy;
                payload.availedDiscount = restaurant.availableDiscounts[a];
                payload.availedOffer = cart.availedOffer;
                payload.availedVoucher = cart.availedVoucher;
                payload.selectedPaymentMethod = cart.selectedPaymentMethod;
                payload.scheduleList = cart.scheduleList;
                setCart(payload);
              }
            }

            // New Think Code 
            setAvailableDiscountList(tempAvailableDiscountList);

            if (cart.availedDiscount.discount_id != undefined) {
              if (cart.availedDiscount.discount_type == 'Percentage') {
                let tempDiscount =
                  (parseFloat(cart.subTotal) *
                    parseFloat(cart.availedDiscount.discount_amount)) /
                  100;
                setLocalDiscount(tempDiscount.toFixed(2));
              } else {
                let tempDiscount = parseFloat(cart.availedDiscount.discount_amount);
                setLocalDiscount(tempDiscount.toFixed(2));
              }
            } else {
              setLocalDiscount(0);
               
            }
            //End
          }
        }else{
          setAvailableDiscountList([]);    
        }
      }
      
    } else {
      setAvailableDiscountList([]);       
    }
  };*/

  const calculateOffer = () => {
    let excludeFromTotal = cart.subTotal - cart.excludeFromOffer;

    if (cart.selectedOrderPolicy.policy_id) {
      let tempAvailableOfferList = [];
      for (var a = 0; a < restaurant.availableOffers.length; a++) {
        if (
          (restaurant.availableOffers[a].restaurant_order_policy_id == '0' ||
            restaurant.availableOffers[a].restaurant_order_policy_id ==
              cart.selectedOrderPolicy.policy_id) &&
          restaurant.availableOffers[a].active == 1
        ) {
          if (
            excludeFromTotal >=
            parseFloat(restaurant.availableOffers[a].eligible_amount)
          ) {
            //console.log(excludeFromTotal);

            tempAvailableOfferList.push(restaurant.availableOffers[a]);

            if (restaurant.availableOffers[a].default == '1') {
              onSelectOffer(restaurant.availableOffers[a]);
            }
          }
        }
      }

      setAvailableOfferList(tempAvailableOfferList);
    } else {
      setAvailableOfferList([]);
    }
  };

  const onSelectDiscount = discount => {
    let payload = {};
    payload.dish = cart.dish;
    payload.subTotal = cart.subTotal;
    payload.excludeFromOffer = cart.excludeFromOffer;
    payload.availedDiscountAmount = cart.availedDiscountAmount;
    payload.badgeCount = cart.badgeCount;
    payload.associativeMenuObj = cart.associativeMenuObj;
    payload.selectedOrderPolicy = cart.selectedOrderPolicy;
    payload.availedDiscount = discount;
    payload.availedOffer = cart.availedOffer;
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = cart.selectedPaymentMethod;
    payload.scheduleList = cart.scheduleList;
    setCart(payload);
  };

  const onSelectOffer = offer => {
    let payload = {};
    payload.dish = cart.dish;
    payload.subTotal = cart.subTotal;
    payload.excludeFromOffer = cart.excludeFromOffer;
    payload.availedDiscountAmount = cart.availedDiscountAmount;
    payload.badgeCount = cart.badgeCount;
    payload.associativeMenuObj = cart.associativeMenuObj;
    payload.selectedOrderPolicy = cart.selectedOrderPolicy;
    payload.availedDiscount = cart.availedDiscount;
    payload.availedOffer = offer;
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = cart.selectedPaymentMethod;
    payload.scheduleList = cart.scheduleList;
    setCart(payload);
  };

  const isDiscountSelected = item => {
    if (cart.availedDiscount.discount_id == item.discount_id) {
      return true;
    }
    return false;
  };

  const isOfferSelected = item => {
    if (cart.availedOffer.id == item.id) {
      return true;
    }
    return false;
  };

  const onPressProceed = () => {
    if (cart.selectedOrderPolicy.policy_id != undefined) {
      if (profile.isUserLoggedIn) {
        if (localTotal >= parseFloat(cart.selectedOrderPolicy.min_order)) {
          if (cart.selectedOrderPolicy.policy_name == 'Delivery') {
            navigation.navigate('DeliveryDetail');
          } else {
            let payload = {
              postcode: profile.userDetails.postcode
                ? profile.userDetails.postcode
                : '',
              addressOne: profile.userDetails.address1
                ? profile.userDetails.address1
                : '',
              addressTwo: profile.userDetails.address2
                ? profile.userDetails.address2
                : '',
              town: profile.userDetails.town ? profile.userDetails.town : '',
              deliveryFee: 0.0,
            };

            navigation.navigate('Checkout', {
              userDeliveryDetail: payload,
            });
          }
        } else {
          let text =
            'Minimum order amount is ' + cart.selectedOrderPolicy.min_order;
          setSnackBarErrorMessage(text);
          setVisibleSnackBar(true);
        }
      } else {
        navigation.navigate('Profile', {screen: 'Login'});
      }
    } else {
      setSnackBarErrorMessage('Please select your order type');
      setVisibleSnackBar(true);
    }
  };

  const renderDiscountList = ({item}) => {
    return (
      <ListItem
        style={{
          marginLeft: 0,
          paddingBottom: 0,
          paddingTop: 0,
          borderBottomWidth: 0.3,
          borderBottomColor: '#f0f0f0',
        }}
      >
        <RadioButton.Android
          color="#EC1A3A"
          value={item.discount_id}
          status={isDiscountSelected(item) === true ? 'checked' : 'unchecked'}
          onPress={() => onSelectDiscount(item)}
        />

        <Text style={{fontSize: 13}}>
          {item.discount_title}{' '}
          {item.discount_description != undefined
            ? item.discount_description.replace(/<\/?[^>]+(>|$)/g, ' ')
            : ''}
        </Text>
      </ListItem>
    );
  };

  const renderOfferList = ({item}) => {
    return (
      <ListItem
        style={{
          marginLeft: 0,
          paddingBottom: 0,
          paddingTop: 0,
          borderBottomWidth: 0.3,
          borderBottomColor: '#f0f0f0',
        }}
      >
        <RadioButton.Android
          color="#EC1A3A"
          value={item.id}
          status={isOfferSelected(item) === true ? 'checked' : 'unchecked'}
          onPress={() => onSelectOffer(item)}
        />

        <Text style={styles.text}>
          {item.offer_title}{' '}
          {item.description != undefined
            ? item.description.replace('<br>', ' ')
            : ''}
          ;
        </Text>
      </ListItem>
    );
  };

  const renderCartItem = ({item}) => {
    //console.log(item);
    return (
      <>
        <Item style={{paddingVertical: 10}}>
          <Col style={{flex: 0.8}}>
            <Text>{item.quantity} X </Text>
          </Col>
          <Col style={{flex: 4}}>
            {item.pizza == undefined ? (
              <Text>{item.dish_name}</Text>
            ) : (
              <>
                <Text>{item.dish_name}</Text>

                <FlatList
                  data={item.pizza.order_items.layers}
                  renderItem={({item}) => (
                    <Text style={{fontSize: 11}}>{item.material_name}</Text>
                  )}
                  keyExtractor={(item, index) => {
                    return item.material_id + '_' + index;
                  }}
                />
                <FlatList
                  data={item.pizza.order_items.toppings}
                  renderItem={({item}) => (
                    <Text style={{fontSize: 10}}>
                      {' '}
                      + {item.quantity} X {item.name}
                    </Text>
                  )}
                  keyExtractor={(item, index) => {
                    return item.id + '_' + index;
                  }}
                />
              </>
            )}
          </Col>
          <Col style={{flex: 3}}>
            <Grid>
              <Col style={{alignSelf: 'center', flex: 1}}>
                <Icon
                  style={{
                    color: '#ed1a3b',
                    textAlign: 'center',

                    // fontSize: 20,
                  }}
                  type="AntDesign"
                  name="minussquareo"
                  onPress={() => {
                    decreaseItemQuantity(item);
                  }}
                />
              </Col>
              <Col style={{alignSelf: 'center', flex: 1.5}}>
                {item.pizza == undefined || item.pizza == null ? (
                  <Text style={{textAlign: 'center'}}>
                    &pound;{parseFloat(item.dish_price).toFixed(2)}
                  </Text>
                ) : (
                  <Text style={{textAlign: 'center'}}>
                    &pound;{parseFloat(item.pizza.dish_price).toFixed(2)}
                  </Text>
                )}
              </Col>

              <Col style={{alignSelf: 'center', flex: 1}}>
                <Icon
                  style={{
                    color: '#ed1a3b',
                    textAlign: 'center',
                  }}
                  type="AntDesign"
                  name="plussquareo"
                  onPress={() => {
                    increaseItemQuantity(item);
                  }}
                />
              </Col>
            </Grid>
          </Col>
        </Item>
      </>
    );
  };

  return (
    <Container>
      {cart.dish.length == 0 ? (
        <View style={{justifyContent: 'center', flex: 1}}>
          <Icon
            style={{color: '#c1c1c1', alignSelf: 'center', fontSize: 200}}
            type="AntDesign"
            name="shoppingcart"
          />
          <H1 style={{color: '#c1c1c1', alignSelf: 'center'}}>
            YOUR CART IS EMPTY
          </H1>
        </View>
      ) : (
        <>
          <View>
            <Header style={{backgroundColor: 'white'}}>
              <Left>
                <Title style={{color: '#000'}}>Your Cart</Title>
              </Left>
              <Right>
                <Button
                  hasText
                  color="#ed1a3b"
                  onPress={() => {
                    // alert(restaurant.restaurantName);
                    navigation.navigate('Menu', {
                      restaurantId: restaurant.restaurantId,
                      restaurantName: restaurant.restaurantName,
                      distance: 0,
                    });
                  }}
                >
                  Add More
                </Button>
              </Right>
            </Header>

            <FlatList
              style={{alignSelf: 'center', marginTop: 5}}
              data={restaurant.availableOrderPolicy}
              horizontal
              renderItem={({item}) => (
                <Button
                  style={[
                    cart.selectedOrderPolicy.policy_id === item.policy_id
                      ? styles.selectedBtnColor
                      : styles.unselectedBtnColor,
                  ]}
                  mode="contained"
                  onPress={() => onSelectOrderPolicy(item)}
                >
                  <Text style={{color: '#fff', fontSize: 13}}>
                    {restaurant.restaruantScheduleStatus == 'PRE-ORDER' && (
                      <>{restaurant.restaruantScheduleStatus} </>
                    )}
                    {item.policy_name}
                  </Text>
                </Button>
              )}
              keyExtractor={(item, index) => {
                return 'Policy' + index + item.policy_id;
              }}
            />
          </View>

          <View style={{marginHorizontal: 5}}>
            <Card style={{borderRadius: 10, maxHeight: 250}}>
              <CardItem style={{borderRadius: 10}}>
                <FlatList
                  data={cart.dish}
                  renderItem={renderCartItem}
                  keyExtractor={(item, index) => {
                    return index + '_' + item.dish_id;
                  }}
                />
              </CardItem>
            </Card>
          </View>

          <View style={{marginHorizontal: 5}}>
            {availableDiscountList.length > 0 && (
              <Card style={{borderRadius: 10}}>
                <CardItem
                  bordered
                  style={{borderRadius: 10, paddingTop: 5, paddingBottom: 5}}
                >
                  <Text style={{fontSize: 13, color: '#000'}}>
                    AVAILABLE DISCOUNTS
                  </Text>
                </CardItem>
                <CardItem
                  style={{
                    borderRadius: 10,
                    maxHeight: 100,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 5,
                  }}
                >
                  <FlatList
                    data={availableDiscountList}
                    renderItem={renderDiscountList}
                    keyExtractor={(item, index) => {
                      return 'discount' + index + item.discount_id;
                    }}
                  />
                </CardItem>
              </Card>
            )}

            {availableOfferList.length > 0 && (
              <Card style={{borderRadius: 10}}>
                <CardItem
                  bordered
                  style={{borderRadius: 10, paddingTop: 5, paddingBottom: 5}}
                >
                  <Text style={{fontSize: 13, color: '#000'}}>
                    AVAILABLE OFFERS
                  </Text>
                </CardItem>
                <CardItem
                  style={{
                    borderRadius: 10,
                    maxHeight: 100,
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 5,
                  }}
                >
                  <FlatList
                    data={availableOfferList}
                    renderItem={renderOfferList}
                    keyExtractor={(item, index) => {
                      return 'offer' + index + item.id;
                    }}
                  />
                </CardItem>
              </Card>
            )}
          </View>

          <View>
            <Snackbar
              visible={visibleSnackBar}
              onDismiss={() => {}}
              action={{
                label: 'OK',
                onPress: () => {
                  setVisibleSnackBar(false);
                  setSnackBarErrorMessage('');
                },
              }}
            >
              {snackBarErrorMessage}
            </Snackbar>
          </View>

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
              label: 'PROCEED',
              action: '#fff',
              onPress: () => {
                onPressProceed();
              },
            }}
          >
            <Text
              style={{
                flex: 1,
                color: '#fff',
                borderRightWidth: 1,
                fontSize: 12,
              }}
            >
              SUBTOTAL: &pound; {localSubTotal.toFixed(2)}
              {localDiscount > 0 && (
                <>
                  {'\n'}
                  DISCOUNT: &pound; {localDiscount}
                </>
              )}
              {'\n'}
              TOTAL: &pound; {localTotal.toFixed(2)}
            </Text>
          </Snackbar>
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  icon: {
    color: '#ed1a3b',
  },
  unselectedBtnColor: {
    backgroundColor: '#999999',
    marginHorizontal: 2,

    alignSelf: 'center',
  },
  selectedBtnColor: {
    backgroundColor: '#ed1a3b',
    marginHorizontal: 2,

    alignSelf: 'center',
  },
});
