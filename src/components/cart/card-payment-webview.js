import {Container, Text} from 'native-base';
import React, {useContext, useEffect} from 'react';
import {StyleSheet,Dimensions} from 'react-native';
import AppButtonContained from '../common/app-button-contained';
import {useDispatch, useSelector} from 'react-redux';
import AutoHeightWebView from 'react-native-autoheight-webview';
import CartContext from '../../context/cart-context';


export default function CardPaymentWebview({navigation, route}) {
  const dispatch = useDispatch();
   //for context
   const {cart, setCart} = useContext(CartContext);

  const {url} = route.params;

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
    <Container>
      <AutoHeightWebView
        style={{width: Dimensions.get('window').width - 15, marginTop: 35}}
        // customScript={`document.body.style.background = 'lightyellow';`}
        customStyle={`* { font-family: 'Times New Roman';    }   p {     font-size: 16px;   }    `}
        onSizeUpdated={(size) => console.log(size.height)}
        files={[
          {
            href: 'cssfileaddress',
            type: 'text/css',
            rel: 'stylesheet',
          },
        ]}
        source={{
          uri: url,
        }}
        scalesPageToFit={true}
        viewportContent={'width=device-width, user-scalable=no'}
      />

      <AppButtonContained text={'Go To Home'} onClick={goToHome} />
    </Container>
  );
}

const styles = StyleSheet.create({});
