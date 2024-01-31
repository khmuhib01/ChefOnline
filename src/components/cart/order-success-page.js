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
  Spinner,
} from 'native-base';
import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
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

export default function OrderSuccessPage({navigation, route}) {
  const {
    isOrderSuccess,
    voucherDiscount,
    discount,
    deliveryFee,
    offer,
    grandTotal,
    specialInstruction,
    selectedTime,
    message,
    carrierBagQtn,
    carrierBagTotal,
  } = route.params;
  //for context
  const {cart, setCart} = useContext(CartContext);
  //for redux
  const restaurant = useSelector((state) => state.restaurant);
  const profile = useSelector((state) => state.profile);
  const dispatch = useDispatch();

  const [orderStatus, setorderStatus] = useState('');

  useEffect(() => {
    const parent = navigation.dangerouslyGetParent();
    parent.setOptions({
      tabBarVisible: false,
    });
  }, []);

  const goToHome = () => {
    let payload = {};
    payload.dish = [];
    payload.subTotal = 0.0;
    payload.associativeMenuObj = {};
    payload.availedDiscountAmount = 0.0;
    payload.badgeCount = 0;
    payload.selectedOrderPolicy = {};
    payload.availedDiscount = {};
    payload.availedOffer = {};
    payload.availedVoucher = {};
    payload.selectedPaymentMethod = {};
    payload.scheduleList = [];
    setCart(payload);

    dispatch({type: 'CLEAR_RESTAURANT_DATA'});

    navigation.reset({
      index: 0,
      routes: [{name: 'Search'}],
    });
  };

  // return <AppButtonContained text={'Go To Home'} onClick={goToHome} />;
  return (
    <Container style={{padding: 5, justifyContent: 'center'}}>
      {isOrderSuccess ? (
        <Title
          style={{color: '#28a745', textAlign: 'center', paddingVertical: 5}}>
          ORDER SUCCESSFUL
        </Title>
      ) : (
        <Title
          style={{color: '#ed1a3b', textAlign: 'center', paddingVertical: 5}}>
          ORDER FAILED
        </Title>
      )}

      {message != undefined && (
        <Card style={{borderRadius: 10}}>
          <CardItem style={{borderRadius: 10}}>
            <Text>{message} </Text>
          </CardItem>
        </Card>
      )}

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
      </View>

      <View>
        <Card style={{borderRadius: 10}}>
          <CardItem style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
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
          {parseFloat(discount) > 0 && (
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
                    {parseFloat(discount).toFixed(2)}
                  </Text>
                </Col>
              </Item>
            </CardItem>
          )}
          {voucherDiscount > 0 && (
            <CardItem
              style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
              <Item style={{borderBottomWidth: 0}}>
                <Col style={{flex: 3}}>
                  <Text style={styles.text}>VOUCHER DISCOUNT</Text>
                </Col>
                <Col style={{flex: 2}}></Col>
                <Col style={{flex: 1}}>
                  <Text style={{textAlign: 'right', fontSize: 13}}>
                    &pound;{voucherDiscount.toFixed(2)}
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

          <CardItem style={{borderRadius: 10, paddingTop: 2, paddingBottom: 2}}>
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

          {offer.description != undefined && (
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
                  {offer.offer_title} {offer.description}
                </Text>
              </Item>
            </CardItem>
          )}
        </Card>
      </View>

      <View>
        <Card transparent>
          <CardItem style={{paddingTop: 2, paddingBottom: 2}}>
            <Text style={{fontSize: 16}}>
              ORDER TYPE: {cart.selectedOrderPolicy.policy_name.toUpperCase()}
            </Text>
          </CardItem>
          <CardItem style={{paddingTop: 2, paddingBottom: 2}}>
            <Text style={{fontSize: 16}}>
              PAYMENT METHOD:{' '}
              {cart.selectedPaymentMethod.payment_method.toUpperCase()}
            </Text>
          </CardItem>
          <CardItem style={{paddingTop: 2, paddingBottom: 2}}>
            <Text style={{fontSize: 16}}>
              {cart.selectedOrderPolicy.policy_name.toUpperCase()} TIME:{' '}
              {selectedTime}
            </Text>
          </CardItem>
          {carrierBagTotal > 0 && (
            <CardItem style={{paddingTop: 2, paddingBottom: 2}}>
              <Text style={{fontSize: 16}}>TOTAL BAG: {carrierBagQtn}</Text>
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
      <AppButtonContained text={'Go To Home'} onClick={goToHome} />
    </Container>
  );
}

const styles = StyleSheet.create({});
