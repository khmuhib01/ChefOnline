import * as React from 'react';
import { Root } from "native-base";
import {createStackNavigator} from '@react-navigation/stack';
import Cart from './cart';
import Checkout from './checkout';
import DeliveryDetail from './delivery-detail';
import OrderSuccessPage from './order-success-page';
import CardPaymentWebview from './card-payment-webview';

const CartStack = createStackNavigator();

export default function CartTab() {
  return (
    <Root>
    <CartStack.Navigator>
      <CartStack.Screen
        name="Cart"
        options={{headerShown: false}}
        component={Cart}
      />
      <CartStack.Screen
        name="Checkout"
        options={{title: 'Checkout'}}
        component={Checkout}
      />
      <CartStack.Screen
        name="DeliveryDetail"
        options={{title: 'Delivery Detail'}}
        component={DeliveryDetail}
      />
      <CartStack.Screen
        name="OrderSuccessPage"
        options={{headerShown: false}}
        component={OrderSuccessPage}
      />

      <CartStack.Screen
        name="CardPaymentWebview"
        options={{headerShown: false}}
        component={CardPaymentWebview}
      />
    </CartStack.Navigator>
    </Root>
  );
}
