import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Settings from './settings';
import SettingsDetail from './settings-detail';

const SettingsStack = createStackNavigator();

export default function SettingsTab() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="Settings"
        options={{title: 'SETTINGS'}}
        component={Settings}
      />
      <SettingsStack.Screen name="SettingsDetail" component={SettingsDetail}  />
    </SettingsStack.Navigator>
  );
}
