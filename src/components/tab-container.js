import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Icon} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SearchTab from './search';
import CartTab from './cart';
import ProfileTab from './profile';
import SettingsTab from './settings';
import CartContext from '../context/cart-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function TabContainer({navigation, route}) {
  const [cart, setCart] = useState({
    dish: [],
    subTotal: 0.0,
    availedDiscountAmount: 0.0,
    badgeCount: 0,
    selectedOrderPolicy: {},
    availedDiscount: {},
    availedOffer: {},
    availedVoucher: {},
    selectedPaymentMethod: {},
    scheduleList: [],
    associativeMenuObj:{}
  });

  const value = {cart, setCart};

  return (
    <CartContext.Provider value={value}>
      <NavigationContainer independent={true}>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName;

              if (route.name === 'Search') {
                iconName = focused ? 'search-circle' : 'search-circle-outline';
              } else if (route.name === 'Cart') {
                iconName = focused ? 'cart' : 'cart-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person-circle' : 'person-circle-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
          }}>
          <Tab.Screen name="Search" component={SearchTab} />

          <Tab.Screen
            name="Cart"
            component={CartTab}
            options={{tabBarBadge: cart.badgeCount}}
          />
          <Tab.Screen name="Profile" component={ProfileTab} />
          <Tab.Screen name="Settings" component={SettingsTab} />
        </Tab.Navigator>
      </NavigationContainer>
    </CartContext.Provider>
  );
}

const styles = StyleSheet.create({});
