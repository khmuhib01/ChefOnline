import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TabContainer from './tab-container';
import Splash from './splash';
import ForceUpdate from './force-update';
const Stack = createStackNavigator();


export default function Route() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Splash" component={Splash}   options={{headerShown: false}}/>   
        <Stack.Screen name="ForceUpdate" component={ForceUpdate} options={{headerShown: false}}/>
        <Stack.Screen name="TabContainer" component={TabContainer}  options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
