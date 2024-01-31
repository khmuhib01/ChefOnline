import {
  Container,
  Card,
  View,
  CardItem,
  Item,
  Col,
  Icon,
  Grid,
  Textarea,
  Input,
  ActionSheet,
  Spinner,
  Content,
} from 'native-base';
import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import CartContext from '../../context/cart-context';

import moment from 'moment';
import Config from 'react-native-config';
import {Text, Button, Title, Snackbar} from 'react-native-paper';
import getData from '../api';
import AppButtonContained from '../common/app-button-contained';
import {FlatList} from 'react-native-gesture-handler';
import CartItem from '../common/cart-item';
import AppButtonClear from '../common/app-button-clear';
import {Picker} from '@react-native-picker/picker';

const {width} = Dimensions.get('window');

export default function Checkout({navigation, route}) {
  //for context
  const {cart, setCart} = useContext(CartContext);
  //for redux
  const restaurant = useSelector((state) => state.restaurant);
  const profile = useSelector((state) => state.profile);

  const {userDeliveryDetail} = route.params;

  const [carrierBagQtn, setcarrierBagQtn] = useState(0);
  const [carrierBagUnitCharge, setcarrierBagUnitCharge] = useState(0.0);
  const [carrierBagTotal, setcarrierBagTotal] = useState(0.0);

  const [localAvailedDiscountAmount, setlocalAvailedDiscountAmount] = useState(
    cart.availedDiscountAmount,
  );
  const [localAvailedOffer, setlocalAvailedOffer] = useState(cart.availedOffer);
  const [voucherObj, setvoucherObj] = useState({});
  const [voucherDiscountAmount, setvoucherDiscountAmount] = useState(0);
  const [donationAmount, setdonationAmount] = useState(0);
  const [deliveryFee, setdeliveryFee] = useState(
    userDeliveryDetail.deliveryFee,
  );
  const [grandTotal, setgrandTotal] = useState(0);
  const [isApplicableWithOffer, setisApplicableWithOffer] = useState(true);
  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [insideUk, setInsideUk] = useState(2);
  const [userIp, setUserIp] = useState('');
  const [restaurantScheduleList, setRestaurantScheduleList] = useState([]);
  const [selectedTime, setselectedTime] = useState();
  const [specialInstruction, setspecialInstruction] = useState('');
  const [specialInsctructionVisible, setSpecialInsctructionVisible] = useState(
    false,
  );
  const [textAreaInput, setTextAreaInput] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherErrorMsg, setVoucherErrorMsg] = useState('');
  const [
    voucherDiscountModalVisible,
    setVoucherDiscountModalVisible,
  ] = useState(false);

  const [snackbarVisible, setsnackbarVisible] = useState(false);
  const [snackbarMessage, setsnackbarMessage] = useState('');
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [isDonationAdded, setisDonationAdded] = useState(false);

  const [visibleVerificationModal, setvisibleVerificationModal] = useState(
    false,
  );
  const [verificationCode, setverificationCode] = useState('');
  const [apiVerificationCode, setapiVerificationCode] = useState('');
  const [verificationCodeErrorMsg, setverificationCodeErrorMsg] = useState('');
  const [deliveryTimeForASAP, setdeliveryTimeForASAP] = useState('');

  const [restaurantServiceId, setrestaurantServiceId] = useState('');

  useEffect(() => {
    getCarrierBagData();
    calculateGrandTotal();
    getUserIp();
    getCurrentTime();
  }, []);

  useEffect(() => {
    if (voucherObj.id != undefined) {
      calculateVoucherDiscount();
    }
  }, [voucherObj]);

  useEffect(() => {
    if (voucherDiscountAmount > 0) {
      calculateGrandTotal();
    }
  }, [voucherDiscountAmount]);

  useEffect(() => {
    calculateGrandTotal();
  }, [carrierBagTotal]);

  useEffect(() => {
    if (donationAmount > 0) {
      calculateGrandTotal();
      setisDonationAdded(true);
    }
  }, [donationAmount]);

  useEffect(() => {
    if (isDonationAdded) {
      confirmOrder();
    }
  }, [isDonationAdded]);

  const calculateGrandTotal = () => {
    let tempTotal = cart.subTotal;
    tempTotal =
      tempTotal +
      deliveryFee +
      carrierBagTotal +
      donationAmount -
      localAvailedDiscountAmount -
      voucherDiscountAmount;
    setgrandTotal(tempTotal);
  };

  const getUserIp = async () => {
    await getData(Config.API_URL + 'funId=44')
      .then((response) => {
        if (response.data.status == '1') {
          if (response.data.details.country == 'UK') {
            setInsideUk(1);
            setUserIp(response.data.details.ip);
          } else {
            setInsideUk(2);
            setUserIp(response.data.details.ip);
          }
        }
      })
      .catch((error) => {
        console.warn(error.message);
      });
  };

  const getCarrierBagData = async () => {
    await getData(
      Config.API_URL + 'funId=130&rest_id=' + restaurant.restaurantId,
    )
      .then((response) => {
        if (response.data.status == '1') {
          setrestaurantServiceId(response.data.restaurant_service_id);
          setcarrierBagUnitCharge(parseFloat(response.data.price));
          setcarrierBagTotal(parseFloat(response.data.price));
          setcarrierBagQtn(1);
        }
      })
      .catch((error) => {
        console.warn(error.message);
      });
  };

  const getCurrentTime = async () => {
    await getData(Config.API_URL + 'funId=79')
      .then((response) => {
        let payload = {};
        payload.currentTime = response.data.data;
        payload.restaurantScheduleList = restaurant.restaurantScheduleList;
        payload.type = cart.selectedOrderPolicy.policy_name;

        getScheduleList(payload);
      })
      .catch((error) => {
        console.warn(error.message);
      });
  };

  const getScheduleList = (payload) => {
    let isRestaurantOpen = false;
    let startTime = null;
    let endTime = null;
    let additionalTime = null;
    let currentTime = moment(payload.currentTime.time, ['hh:mm a']);
    let availableShifts = [];

    let list = payload.restaurantScheduleList.find(
      (list) => list.day_name === payload.currentTime.day,
    );

    for (let shift of list.list) {
      if (shift.type == '3') {
        let opening_time = moment(shift.opening_time, ['hh:mm a']);
        let closing_time = moment(shift.closing_time, ['hh:mm a']);

        if (currentTime >= opening_time && currentTime <= closing_time) {
          isRestaurantOpen = true;
          availableShifts.push(shift);
        } else if (currentTime < opening_time) {
          availableShifts.push(shift);
        }
      }
    }

    let localScheduleList = [];

    for (let currentShift of availableShifts) {
      let opening_time = moment(currentShift.opening_time, ['hh:mm a']);
      let closing_time = moment(currentShift.closing_time, ['hh:mm a']);

      if (currentTime >= opening_time) {
        startTime = currentTime;
      } else {
        startTime = opening_time;
      }

      if (payload.type == 'Collection') {
        additionalTime = currentShift.Collection;
      } else {
        additionalTime = currentShift.Delivery;
      }
      endTime = closing_time;

      startTime = moment(startTime).add(additionalTime, 'minutes');

      if (isRestaurantOpen) {
        localScheduleList.push('ASAP');
      }
      localScheduleList.push(moment(startTime).format('hh:mm a'));

      while (startTime <= endTime) {
        startTime = moment(startTime).add(15, 'minutes');
        if (startTime <= endTime) {
          localScheduleList.push(moment(startTime).format('hh:mm a'));
        }
      }
    }
    setRestaurantScheduleList(localScheduleList);
  };

  const calculateVoucherDiscount = () => {
    if (voucherObj.status == '1') {
      if (voucherObj.applicable_with_other_offers == '0') {
        let temp = 0;
        if (voucherObj.is_fixed == '1') {
          temp = parseFloat(voucherObj.discount_amount);
        } else {
          let tempGrandTotal = cart.subTotal;
          temp =
            (tempGrandTotal * parseFloat(voucherObj.discount_amount)) / 100;
        }

        setlocalAvailedDiscountAmount(0);
        setlocalAvailedOffer({});
        setvoucherDiscountAmount(temp);
      } else {
        let temp = 0;
        if (voucherObj.is_fixed == '1') {
          temp = parseFloat(voucherObj.discount_amount);
        } else {
          temp =
            ((grandTotal - parseFloat(deliveryFee)) *
              parseFloat(voucherObj.discount_amount)) /
            100;
        }

        setvoucherDiscountAmount(temp);
      }
    }
  };

  const increaseCarrierBagQtn = () => {
    let tempQtn = carrierBagQtn;
    let tempCarrierBagTotal = carrierBagTotal;

    tempQtn++;
    tempCarrierBagTotal = tempQtn * carrierBagUnitCharge;

    setcarrierBagQtn(tempQtn);
    setcarrierBagTotal(tempCarrierBagTotal);
  };

  const decreaseCarrierBagQtn = () => {
    let tempQtn = carrierBagQtn;
    let tempCarrierBagTotal = carrierBagTotal;

    tempQtn--;
    tempCarrierBagTotal = tempQtn * carrierBagUnitCharge;

    setcarrierBagQtn(tempQtn);
    setcarrierBagTotal(tempCarrierBagTotal);
  };

  const onSubmitVoucherCode = async (discountCode) => {
    setVoucherLoading(true);
    await getData(
      Config.API_URL +
        'funId=117&rest_id=' +
        restaurant.restaurantId +
        '&user_id=' +
        profile.userDetails.userid +
        '&voucherCode=' +
        discountCode +
        '&grand_total=' +
        grandTotal,
    )
      .then((response) => {
        if (response.data.status == 1) {
          console.log(response.data.data.voucher);
          setvoucherObj(response.data.data.voucher);
          setVoucherErrorMsg('');
          setVoucherDiscountModalVisible(false);
          setInput('');
        } else {
          setVoucherLoading(false);
          setVoucherErrorMsg(response.data.message);
        }
        setVoucherLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setVoucherLoading(false);
      });
  };

  const onSelectPaymentMethod = (paymentMethod) => {
    let payload = {};
    payload.dish = cart.dish;
    payload.subTotal = cart.subTotal;
    payload.availedDiscountAmount = cart.availedDiscountAmount;
    payload.associativeMenuObj = cart.associativeMenuObj;
    payload.badgeCount = cart.badgeCount;
    payload.selectedOrderPolicy = cart.selectedOrderPolicy;
    payload.availedDiscount = cart.availedDiscount;
    payload.availedOffer = cart.availedOffer;
    payload.availedVoucher = cart.availedVoucher;
    payload.selectedPaymentMethod = paymentMethod;
    payload.scheduleList = cart.scheduleList;
    setCart(payload);
  };

  const onClickConfirm = () => {
    if (cart.selectedOrderPolicy.policy_name == 'Delivery') {
      if (
        grandTotal - parseFloat(deliveryFee) <
        parseFloat(cart.selectedOrderPolicy.min_order)
      ) {
        let msg =
          'Minimum order amount is ' + cart.selectedOrderPolicy.min_order;
        setsnackbarMessage(msg);
        setsnackbarVisible(true);
      } else {
        if (cart.selectedPaymentMethod.payment_settings_id == undefined) {
          setsnackbarMessage('Please select a payment option to confirm');
          setsnackbarVisible(true);
        } else {
          if (selectedTime == undefined) {
            let msg =
              'Please select your desired ' +
              cart.selectedOrderPolicy.policy_name +
              ' time';
            setsnackbarMessage(msg);
            setsnackbarVisible(true);
          } else {
            if (cart.selectedPaymentMethod.payment_settings_id == '0') {
              confirmOrder();
            } else {
              setDonationModalVisible(true);
            }
          }
        }
      }
    } else {
      if (cart.selectedPaymentMethod.payment_settings_id == undefined) {
        setsnackbarMessage('Please select a payment option to confirm');
        setsnackbarVisible(true);
      } else {
        if (selectedTime == undefined) {
          let msg =
            'Please select your desired ' +
            cart.selectedOrderPolicy.policy_name +
            ' time';
          setsnackbarMessage(msg);
          setsnackbarVisible(true);
        } else {
          if (cart.selectedPaymentMethod.payment_settings_id == '0') {
            confirmOrder();
          } else {
            setDonationModalVisible(true);
          }
        }
      }
    }
  };

  const confirmOrder = async () => {
    setLoading(true);
    let OrderList = [];
    // for (var a = 0; a < cart.dish.length; a++) {
    //   let obj = {
    //     DishId: cart.dish[a].dish_id,
    //     quantity: cart.dish[a].quantity,
    //   };
    //   OrderList.push(obj);
    // }

    for (var a = 0; a < cart.dish.length; a++) {
      let obj = {};
      if (cart.dish[a].pizza == undefined) {
        obj = {
          DishId: cart.dish[a].dish_id,
          quantity: cart.dish[a].quantity,
        };
      } else {
        let pizza = cart.dish[a].pizza;
        pizza['dish_name'] = cart.dish[a].dish_name;
        pizza['dish_price'] = cart.dish[a].dish_price.toFixed(2);
        pizza['quantity'] = cart.dish[a].quantity;

        obj = {
          DishId: cart.dish[a].dish_id,
          quantity: cart.dish[a].quantity,
          pizza: pizza,
        };
      }

      OrderList.push(obj);
    }

    let vId = voucherObj.id == undefined ? 0 : voucherObj.id;

    let pltfrm = Platform.OS == 'ios' ? 1 : 2;
    let discount_id =
      localAvailedDiscountAmount > 0 ? cart.availedDiscount.discount_id : '';

    let ofrId =
      localAvailedOffer.id != undefined
        ? JSON.stringify([{offer_id: localAvailedOffer.id}])
        : JSON.stringify([]);

    let carrierBag =
      carrierBagTotal > 0
        ? JSON.stringify([
            {
              restaurant_service_id: restaurantServiceId,
              quantity: carrierBagQtn,
              price: carrierBagUnitCharge,
            },
          ])
        : JSON.stringify([]);

    let pre_order_delivery_time =
      selectedTime == 'ASAP' ? deliveryTimeForASAP : selectedTime;

    let url =
      Config.API_URL +
      'funId=98&user_id=' +
      profile.userDetails.userid +
      '&order_policy_id=' +
      cart.selectedOrderPolicy.policy_id +
      '&OrderList=' +
      JSON.stringify(OrderList) +
      '&post_code=' +
      userDeliveryDetail.postcode +
      '&address=' +
      encodeURIComponent(userDeliveryDetail.addressOne) +
      '&city=' +
      encodeURIComponent(userDeliveryDetail.town) +
      '&payment_option=' +
      cart.selectedPaymentMethod.payment_settings_id +
      '&total_amount=' +
      parseFloat(cart.subTotal).toFixed(2) +
      '&grand_total=' +
      parseFloat(grandTotal).toFixed(2) +
      '&discount_id=' +
      discount_id +
      '&voucher_id=' +
      vId +
      '&offer_id=' +
      ofrId +
      '&carrierBag=' +
      carrierBag +
      '&pre_order_delivery_time=' +
      pre_order_delivery_time +
      '&comments=' +
      encodeURIComponent(specialInstruction) +
      '&payment_status=0&paypal_transection_id=0&verification_code=0&platform=' +
      pltfrm +
      '&delivery_charge=' +
      deliveryFee +
      '&donate_comments=null&donate_amount=' +
      donationAmount +
      '&ip_address=' +
      userIp +
      '&inside_uk=' +
      insideUk +
      '&card_fee=0&is_varification_required=false&is_special_message_required=false&user_address_ext_id=0&updated_api=1&rest_id=' +
      restaurant.restaurantId;

    await getData(url)
      .then((response) => {
        if (response.data.status == 'Success') {
          if (cart.selectedPaymentMethod.payment_settings_id == '12') {
            navigation.navigate('CardPaymentWebview', {
              url:
                response.data.barclay_response.Body.beginWebPaymentResponse
                  .return.redirectURL,
            });
          } else if (
            cart.selectedPaymentMethod.payment_settings_id == '5' &&
            restaurant.restaurantId == '757'
          ) {
            navigation.navigate('CardPaymentWebview', {
              url:
                'http://aromatakeaway.co.uk/worldpay_app/index.php?order_id=' +
                response.data.order_ID +
                '&grand_total=' +
                response.data.grand_total,
            });
          } else {
            navigation.navigate('OrderSuccessPage', {
              isOrderSuccess: true,
              voucherDiscount: voucherDiscountAmount,
              discount: localAvailedDiscountAmount,
              deliveryFee: deliveryFee,
              offer: localAvailedOffer,
              grandTotal: grandTotal,
              specialInstruction: specialInstruction,
              selectedTime: selectedTime,
              carrierBagQtn: carrierBagQtn,
              carrierBagTotal: carrierBagTotal,
              message:
                'Thank you for placing your order with ' +
                restaurant.restaurantName +
                '. An order confirmation email has been sent to ' +
                profile.userDetails.email,
            });
          }
          setLoading(false);
        } else if (response.data.status == 'sms_sent') {
          setapiVerificationCode(response.data.code);
          setvisibleVerificationModal(true);
        } else {
          navigation.navigate('OrderSuccessPage', {
            isOrderSuccess: false,
            voucherDiscount: voucherDiscountAmount,
            discount: localAvailedDiscountAmount,
            deliveryFee: deliveryFee,
            offer: localAvailedOffer,
            grandTotal: grandTotal,
            specialInstruction: specialInstruction,
            selectedTime: selectedTime,
            carrierBagQtn: carrierBagQtn,
            carrierBagTotal: carrierBagTotal,
            message: response.data.msg,
          });
          setLoading(false);
        }
      })
      .catch((error) => {
        console.warn(error.message);
        setLoading(false);
      });
  };

  const reSubmitWithVerificationCode = async (verificationCode) => {
    if (apiVerificationCode == verificationCode) {
      setverificationCodeErrorMsg('');
      setvisibleVerificationModal(false);
      setLoading(true);
      let OrderList = [];
      // for (var a = 0; a < cart.dish.length; a++) {
      //   let obj = {
      //     DishId: cart.dish[a].dish_id,
      //     quantity: cart.dish[a].quantity,
      //   };
      //   OrderList.push(obj);
      // }

      for (var a = 0; a < cart.dish.length; a++) {
        let obj = {};
        if (cart.dish[a].pizza == undefined) {
          obj = {
            DishId: cart.dish[a].dish_id,
            quantity: cart.dish[a].quantity,
          };
        } else {
          let pizza = cart.dish[a].pizza;
          pizza['dish_name'] = cart.dish[a].dish_name;
          pizza['dish_price'] = cart.dish[a].dish_price.toFixed(2);
          pizza['quantity'] = cart.dish[a].quantity;

          obj = {
            DishId: cart.dish[a].dish_id,
            quantity: cart.dish[a].quantity,
            pizza: pizza,
          };
        }

        OrderList.push(obj);
      }

      let vId = voucherObj.id == undefined ? 0 : voucherObj.id;

      let pltfrm = Platform.OS == 'ios' ? 1 : 2;
      let discount_id =
        localAvailedDiscountAmount > 0 ? cart.availedDiscount.discount_id : '';

      let ofrId =
        localAvailedOffer.id != undefined
          ? JSON.stringify([{offer_id: localAvailedOffer.id}])
          : JSON.stringify([]);

      let carrierBag =
        carrierBagTotal > 0
          ? JSON.stringify([
              {
                restaurant_service_id: restaurantServiceId,
                quantity: carrierBagQtn,
                price: carrierBagUnitCharge,
              },
            ])
          : JSON.stringify([]);

      let pre_order_delivery_time =
        selectedTime == 'ASAP' ? deliveryTimeForASAP : selectedTime;

      let url =
        Config.API_URL +
        'funId=98&user_id=' +
        profile.userDetails.userid +
        '&order_policy_id=' +
        cart.selectedOrderPolicy.policy_id +
        '&OrderList=' +
        JSON.stringify(OrderList) +
        '&post_code=' +
        userDeliveryDetail.postcode +
        '&address=' +
        encodeURIComponent(userDeliveryDetail.addressOne) +
        '&city=' +
        encodeURIComponent(userDeliveryDetail.town) +
        '&payment_option=' +
        cart.selectedPaymentMethod.payment_settings_id +
        '&total_amount=' +
        parseFloat(cart.subTotal).toFixed(2) +
        '&grand_total=' +
        parseFloat(grandTotal).toFixed(2) +
        '&discount_id=' +
        discount_id +
        '&voucher_id=' +
        vId +
        '&offer_id=' +
        ofrId +
        '&carrierBag=' +
        carrierBag +
        '&pre_order_delivery_time=' +
        pre_order_delivery_time +
        '&comments=' +
        encodeURIComponent(specialInstruction) +
        '&payment_status=0&paypal_transection_id=0&verification_code=' +
        verificationCode +
        '&platform=' +
        pltfrm +
        '&delivery_charge=' +
        deliveryFee +
        '&donate_comments=null&donate_amount=' +
        donationAmount +
        '&ip_address=' +
        userIp +
        '&inside_uk=' +
        insideUk +
        '&card_fee=0&is_varification_required=false&is_special_message_required=false&user_address_ext_id=0&updated_api=1&rest_id=' +
        restaurant.restaurantId;

      await getData(url)
        .then((response) => {
          console.log(response.data);
          if (response.data.status == 'Success') {
            if (cart.selectedPaymentMethod.payment_settings_id == '12') {
              navigation.navigate('CardPaymentWebview', {
                url:
                  response.data.barclay_response.Body.beginWebPaymentResponse
                    .return.redirectURL,
              });
            } else if (
              cart.selectedPaymentMethod.payment_settings_id == '5' &&
              restaurant.restaurantId == '757'
            ) {
              navigation.navigate('CardPaymentWebview', {
                url:
                  'http://aromatakeaway.co.uk/worldpay_app/index.php?order_id=' +
                  response.data.order_ID +
                  '&grand_total=' +
                  response.data.grand_total,
              });
            } else {
              navigation.navigate('OrderSuccessPage', {
                isOrderSuccess: true,
                voucherDiscount: voucherDiscountAmount,
                discount: localAvailedDiscountAmount,
                deliveryFee: deliveryFee,
                offer: localAvailedOffer,
                grandTotal: grandTotal,
                specialInstruction: specialInstruction,
                selectedTime: selectedTime,
                carrierBagQtn: carrierBagQtn,
                carrierBagTotal: carrierBagTotal,
                message:
                  'Thank you for placing your order with ' +
                  restaurant.restaurantName +
                  '. An order confirmation email has been sent to ' +
                  profile.userDetails.email,
              });
            }
            setLoading(false);
          } else if (response.data.status == 'sms_sent') {
            setvisibleVerificationModal(true);
          } else {
            navigation.navigate('OrderSuccessPage', {
              isOrderSuccess: false,
              voucherDiscount: voucherDiscountAmount,
              discount: localAvailedDiscountAmount,
              deliveryFee: deliveryFee,
              offer: localAvailedOffer,
              grandTotal: grandTotal,
              specialInstruction: specialInstruction,
              selectedTime: selectedTime,
              carrierBagQtn: carrierBagQtn,
              carrierBagTotal: carrierBagTotal,
              message: response.data.msg,
            });
            setLoading(false);
          }
        })
        .catch((error) => {
          console.warn(error.message);
          setLoading(false);
        });
    } else {
      setverificationCodeErrorMsg('INVALID VERIFICATION CODE');
    }
  };

  let scheduleListItem = restaurantScheduleList.map((s, i) => {
    return <Picker.Item key={i} value={s} label={s} />;
  });

  return (
    <Container style={{paddingHorizontal: 5}}>
      <Modal
        style={styles.centeredView}
        animationType="slide"
        transparent={true}
        visible={visibleVerificationModal}
        onRequestClose={() => {
          setLoading(false);
          setvisibleVerificationModal(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Card style={{width: 340}} transparent>
              <CardItem
                style={{
                  justifyContent: 'center',
                  backgroundColor: '#f1f1f1',
                }}>
                <Text>Enter Verification Code</Text>
              </CardItem>
              <CardItem>
                <Input
                  autoFocus={true}
                  value={verificationCode}
                  placeholder="Enter Verification Code..."
                  bordered
                  style={{flex: 1, borderRadius: 10}}
                  onChangeText={(text) => {
                    setverificationCode(text);
                    setverificationCodeErrorMsg('');
                  }}
                />
              </CardItem>

              {verificationCodeErrorMsg != '' && (
                <CardItem style={{paddingTop: 0, paddingBottom: 0}}>
                  <Text style={{color: 'red', fontSize: 12}}>
                    {verificationCodeErrorMsg}
                  </Text>
                </CardItem>
              )}

              <CardItem footer style={{alignSelf: 'center'}}>
                <Col style={{paddingLeft: 2}}>
                  <AppButtonContained
                    text={'SUBMIT'}
                    disabled={verificationCode == ''}
                    onClick={() => {
                      reSubmitWithVerificationCode(verificationCode);
                      // setspecialInstruction(textAreaInput);
                      // setSpecialInsctructionVisible(
                      //   !specialInsctructionVisible,
                      // );
                    }}
                  />
                </Col>
              </CardItem>
            </Card>
          </View>
        </View>
      </Modal>
      {loading ? (
        <ActivityIndicator size="large" color="#ed1a3b" />
      ) : (
        <Content>
          <Modal
            style={styles.centeredView}
            animationType="slide"
            transparent={true}
            visible={specialInsctructionVisible}
            onRequestClose={() => {
              setSpecialInsctructionVisible(!specialInsctructionVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Card style={{width: 340}} transparent>
                  <CardItem
                    style={{
                      justifyContent: 'center',
                      backgroundColor: '#f1f1f1',
                    }}>
                    <Text>WRITE YOUR INSTRUCTION</Text>
                  </CardItem>
                  <CardItem>
                    <Textarea
                      autoFocus={true}
                      value={textAreaInput}
                      placeholder="Write from here..."
                      rowSpan={5}
                      bordered
                      style={{flex: 1, borderRadius: 10}}
                      onChangeText={(text) => setTextAreaInput(text)}
                    />
                  </CardItem>

                  <CardItem footer style={{alignSelf: 'center'}}>
                    <Col style={{paddingRight: 2}}>
                      <AppButtonContained
                        text={'CLOSE'}
                        onClick={() => {
                          setSpecialInsctructionVisible(
                            !specialInsctructionVisible,
                          );
                        }}
                      />
                    </Col>

                    <Col style={{paddingLeft: 2}}>
                      <AppButtonContained
                        text={'SUBMIT'}
                        onClick={() => {
                          setspecialInstruction(textAreaInput);
                          setSpecialInsctructionVisible(
                            !specialInsctructionVisible,
                          );
                        }}
                      />
                    </Col>
                  </CardItem>
                </Card>
              </View>
            </View>
          </Modal>

          <Modal
            style={styles.centeredView}
            animationType="slide"
            transparent={true}
            visible={voucherDiscountModalVisible}
            onRequestClose={() => {
              setVoucherDiscountModalVisible(!voucherDiscountModalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Card style={{width: 340}} transparent>
                  {voucherLoading ? (
                    <Spinner color="red" style={{width: 340}} />
                  ) : (
                    <>
                      <CardItem
                        style={{
                          justifyContent: 'center',
                          backgroundColor: '#f1f1f1',
                        }}>
                        <Text>WRITE YOUR VOUCHER CODE</Text>
                      </CardItem>
                      <CardItem>
                        <Item regular>
                          <Input
                            autoFocus={true}
                            value={input}
                            placeholder="Enter Voucher Code..."
                            bordered
                            style={{flex: 1, borderRadius: 10}}
                            onChangeText={(text) => {
                              setInput(text);
                              setVoucherErrorMsg('');
                            }}
                          />
                        </Item>
                      </CardItem>
                      <CardItem style={{paddingTop: 0, paddingBottom: 0}}>
                        <Text style={{color: 'red', fontSize: 12}}>
                          {voucherErrorMsg}
                        </Text>
                      </CardItem>
                      <CardItem footer style={{alignSelf: 'center'}}>
                        <Col style={{paddingRight: 2}}>
                          <AppButtonContained
                            text={'CLOSE'}
                            onClick={() => {
                              setInput('');
                              setVoucherDiscountModalVisible(
                                !voucherDiscountModalVisible,
                              );
                            }}
                          />
                        </Col>

                        <Col style={{paddingLeft: 2}}>
                          <AppButtonContained
                            text={'SUBMIT'}
                            onClick={() => {
                              onSubmitVoucherCode(input);

                              // setVoucherDiscountModalVisible(
                              //   !voucherDiscountModalVisible,
                              // );
                            }}
                          />
                        </Col>
                      </CardItem>
                    </>
                  )}
                </Card>
              </View>
            </View>
          </Modal>

          <Modal
            style={styles.centeredView}
            animationType="slide"
            transparent={true}
            visible={donationModalVisible}
            onRequestClose={() => {
              serDonationModalVisible(!donationModalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Card style={{width: 340}} transparent>
                  <CardItem
                    style={{
                      justifyContent: 'center',
                      backgroundColor: '#f1f1f1',
                    }}>
                    <Text>Would you like to donate &pound;1?</Text>
                  </CardItem>
                  <CardItem header bordered>
                    <Text>{restaurant.donationDetail.donation_title}</Text>
                  </CardItem>
                  <CardItem>
                    <Text>{restaurant.donationDetail.donation_msg}</Text>
                  </CardItem>

                  <AppButtonClear
                    text={'LEARN MORE'}
                    onClick={() => {
                      Linking.openURL(
                        restaurant.donationDetail.donation_site_url,
                      );
                    }}
                  />

                  <CardItem footer style={{alignSelf: 'center'}}>
                    <Col style={{paddingRight: 2}}>
                      <AppButtonContained
                        text={'NO'}
                        onClick={() => {
                          confirmOrder();
                          setDonationModalVisible(false);
                        }}
                      />
                    </Col>

                    <Col style={{paddingLeft: 2}}>
                      <AppButtonContained
                        text={'YES'}
                        onClick={() => {
                          setdonationAmount(1);
                          setDonationModalVisible(false);
                        }}
                      />
                    </Col>
                  </CardItem>
                </Card>
              </View>
            </View>
          </Modal>

          <Title style={{alignSelf: 'center'}}>
            {restaurant.restaurantName.toUpperCase()}
          </Title>
          <View>
            <Card style={{borderRadius: 10}}>
              <CardItem style={{borderRadius: 10, maxHeight: 180}}>
                <FlatList
                  data={cart.dish}
                  renderItem={({item}) => <CartItem data={item} />}
                  keyExtractor={(item) => item.dish_id}
                />
              </CardItem>
            </Card>

            {carrierBagTotal > 0 && (
              <Card style={{borderRadius: 10}}>
                <CardItem style={{borderRadius: 10}}>
                  <Col style={{flex: 0.8}}>
                    <Grid>
                      <Col style={{alignSelf: 'center', flex: 1}}>
                        <Icon
                          style={{
                            color: '#ed1a3b',
                            textAlign: 'left',
                          }}
                          type="AntDesign"
                          name="minussquareo"
                          onPress={() => {
                            decreaseCarrierBagQtn();
                          }}
                        />
                      </Col>
                      <Col style={{alignSelf: 'center', flex: 1}}>
                        <Text style={{textAlign: 'center'}}>
                          {carrierBagQtn}
                        </Text>
                      </Col>
                      <Col style={{alignSelf: 'flex-start', flex: 1}}>
                        <Icon
                          style={{
                            color: '#ed1a3b',
                            textAlign: 'left',
                          }}
                          type="AntDesign"
                          name="plussquareo"
                          onPress={() => {
                            increaseCarrierBagQtn();
                          }}
                        />
                      </Col>
                    </Grid>
                  </Col>
                  <Col style={{flex: 2}}>
                    <Text style={{textAlign: 'center'}}>Carrier Bag</Text>
                  </Col>
                  <Col style={{flex: 1}}>
                    <Text style={{textAlign: 'right'}}>
                      &pound;{carrierBagTotal.toFixed(2)}
                    </Text>
                  </Col>
                </CardItem>
              </Card>
            )}
          </View>

          <View>
            <Card style={{borderRadius: 10}}>
              <CardItem
                style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                <Item style={{borderBottomWidth: 0}}>
                  <Col style={{flex: 3}}>
                    <Text style={styles.text}>SUB-TOTAL</Text>
                  </Col>
                  <Col style={{flex: 2}}></Col>
                  <Col style={{flex: 1}}>
                    <Text style={{textAlign: 'right', fontSize: 13}}>
                      &pound;{cart.subTotal.toFixed(2)}
                    </Text>
                  </Col>
                </Item>
              </CardItem>
              {parseFloat(localAvailedDiscountAmount) > 0 && (
                <CardItem
                  style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                  <Item style={{borderBottomWidth: 0}}>
                    <Col style={{flex: 3}}>
                      <Text style={styles.text}>DISCOUNT</Text>
                    </Col>
                    <Col style={{flex: 2}}></Col>
                    <Col style={{flex: 1}}>
                      <Text style={{textAlign: 'right', fontSize: 13}}>
                        &pound;
                        {parseFloat(localAvailedDiscountAmount).toFixed(2)}
                      </Text>
                    </Col>
                  </Item>
                </CardItem>
              )}
              {voucherDiscountAmount > 0 && (
                <CardItem
                  style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                  <Item style={{borderBottomWidth: 0}}>
                    <Col style={{flex: 3}}>
                      <Text style={styles.text}>VOUCHER DISCOUNT</Text>
                    </Col>
                    <Col style={{flex: 2}}></Col>
                    <Col style={{flex: 1}}>
                      <Text style={{textAlign: 'right', fontSize: 13}}>
                        &pound;{voucherDiscountAmount.toFixed(2)}
                      </Text>
                    </Col>
                  </Item>
                </CardItem>
              )}

              {deliveryFee > 0 && (
                <CardItem
                  style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                  <Item style={{borderBottomWidth: 0}}>
                    <Col style={{flex: 3}}>
                      <Text style={styles.text}>DELIVERY FEE</Text>
                    </Col>
                    <Col style={{flex: 2}}></Col>
                    <Col style={{flex: 1}}>
                      <Text style={{textAlign: 'right', fontSize: 13}}>
                        &pound;{deliveryFee.toFixed(2)}
                      </Text>
                    </Col>
                  </Item>
                </CardItem>
              )}

              {carrierBagTotal > 0 && (
                <CardItem
                  style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                  <Item style={{borderBottomWidth: 0}}>
                    <Col style={{flex: 3}}>
                      <Text style={styles.text}>CARRIER BAG</Text>
                    </Col>
                    <Col style={{flex: 2}}></Col>
                    <Col style={{flex: 1}}>
                      <Text style={{textAlign: 'right', fontSize: 13}}>
                        &pound;{carrierBagTotal.toFixed(2)}
                      </Text>
                    </Col>
                  </Item>
                </CardItem>
              )}

              <CardItem
                style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                <Item style={{borderBottomWidth: 0}}>
                  <Col style={{flex: 3}}>
                    <Text style={styles.text}>TOTAL</Text>
                  </Col>
                  <Col style={{flex: 2}}></Col>
                  <Col style={{flex: 1}}>
                    <Text style={{textAlign: 'right', fontSize: 13}}>
                      &pound;{grandTotal.toFixed(2)}
                    </Text>
                  </Col>
                </Item>
              </CardItem>
              <CardItem
                style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                <Item style={{borderBottomWidth: 0}}>
                  <Col style={{flex: 3}}>
                    <Text style={styles.text}>ORDER TYPE</Text>
                  </Col>
                  <Col style={{flex: 1}}></Col>
                  <Col style={{flex: 2}}>
                    <Text style={{textAlign: 'right', fontSize: 13}}>
                      {cart.selectedOrderPolicy.policy_name}
                    </Text>
                  </Col>
                </Item>
              </CardItem>
              {localAvailedOffer.description != undefined && (
                <CardItem
                  style={{
                    paddingTop: 2,
                    paddingBottom: 2,
                    borderRadius: 10,
                    alignSelf: 'center',
                  }}>
                  <Item style={{borderBottomWidth: 0}}>
                    <Icon
                      style={{color: '#EC1A3A', fontSize: 18}}
                      type="AntDesign"
                      name="checksquare"
                    />
                    <Text style={{textAlign: 'center', fontSize: 13}}>
                      {localAvailedOffer.offer_title}{' '}
                      {localAvailedOffer.description}
                    </Text>
                  </Item>
                </CardItem>
              )}
            </Card>
          </View>

          <View>
            {specialInstruction != '' && (
              <Card style={{borderRadius: 10}}>
                <CardItem
                  bordered
                  style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
                  <Text style={styles.text}>SPECIAL INSTRUCTION</Text>
                </CardItem>
                <CardItem
                  style={{
                    borderRadius: 10,
                    maxHeight: 80,
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}>
                  <Text style={styles.text} numberOfLines={2}>
                    {specialInstruction}
                  </Text>
                </CardItem>
              </Card>
            )}
          </View>

          <View>
            <Item>
              <Grid>
                <Col>
                  <AppButtonClear
                    text={'ADD SPECIAL NOTE'}
                    onClick={() => {
                      setSpecialInsctructionVisible(
                        !specialInsctructionVisible,
                      );
                    }}
                  />
                </Col>
                <Col>
                  {voucherDiscountAmount == 0 && (
                    <AppButtonClear
                      text={'ADD VOUCHER CODE'}
                      onClick={() => {
                        setVoucherDiscountModalVisible(true);
                      }}
                    />
                  )}
                </Col>
              </Grid>
            </Item>
          </View>

          <AppButtonClear
            style={{textAlign: 'center'}}
            text={
              selectedTime == undefined
                ? 'SELECT TIME'
                : 'YOUR SELECTED TIME: ' + selectedTime
            }
            onClick={() => {
              ActionSheet.show(
                {
                  options: restaurantScheduleList,
                },
                (buttonIndex) => {
                  if (restaurantScheduleList[buttonIndex] == 'ASAP') {
                    setdeliveryTimeForASAP(
                      restaurantScheduleList[buttonIndex + 1],
                    );
                  }
                  setselectedTime(restaurantScheduleList[buttonIndex]);
                },
              );
            }}
          />

          <View style={{justifyContent: 'center'}}>
            <Text
              style={{paddingVertical: 3, fontSize: 14, alignSelf: 'center'}}>
              SELECT PAYMENT OPTION
            </Text>
            <Item
              style={{
                paddingVertical: 10,
                borderBottomWidth: 0,
                marginLeft: 0,
                marginRight: 0,
              }}>
              <FlatList
                data={restaurant.paymentMethods}
                numColumns={2}
                style={{alignSelf: 'flex-start'}}
                renderItem={({item}) => (
                  <Button
                    mode="contained"
                    color="#ed1a3b"
                    icon={
                      item.payment_settings_id == '0' ? 'cash' : 'credit-card'
                    }
                    style={[
                      cart.selectedPaymentMethod.payment_settings_id ===
                      item.payment_settings_id
                        ? styles.selectedBtnColor
                        : styles.unselectedBtnColor,
                    ]}
                    onPress={() => {
                      onSelectPaymentMethod(item);
                    }}>
                    {item.payment_method}
                  </Button>
                )}
                keyExtractor={(item, index) => {
                  return 'Policy' + index + item.payment_settings_id;
                }}
              />
            </Item>
          </View>

          <AppButtonContained text={'CONFIRM ORDER'} onClick={onClickConfirm} />

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => {}}
            action={{
              label: 'OK',
              onPress: () => {
                setsnackbarVisible(false);
                setsnackbarMessage('');
              },
            }}>
            {snackbarMessage}
          </Snackbar>
        </Content>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
  },

  unselectedBtnColor: {
    backgroundColor: '#999999',
    marginHorizontal: 2,
    alignSelf: 'center',
    flex: 1,
  },
  selectedBtnColor: {
    backgroundColor: '#EC1A3A',
    marginHorizontal: 2,
    alignSelf: 'center',
    flex: 1,
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
    marginTop: 50,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 0,
    backgroundColor: 'rgba(163, 163, 163, 0.89)',
  },
});
