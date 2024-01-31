import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Root } from "native-base";
import Search from './search';
import SearchResult from './search-result';
import Menu from './menu';
import Info from './info';
import Review from './review';
import Reservation from './reservation';
import PizzaMenuRegular from './PizzaMenuRegular/index';


const SearchStack = createStackNavigator();

export default function SearchTab() {
  return (
    <Root>
      <SearchStack.Navigator>
        <SearchStack.Screen
          name="Search"
          options={{ headerShown: false }}
          component={Search}
        />
        <SearchStack.Screen
          name="SearchResult"
          options={{ title: 'Restaurants', }}
          component={SearchResult}
        />
        <SearchStack.Screen
          name="Menu"
          options={{ headerTransparent: 'true', title: '' }}
          component={Menu}
        />
        <SearchStack.Screen
          name="Info"
          options={{ title: 'Info' }}
          component={Info}
        />
        <SearchStack.Screen
          name="Review"
          options={{ title: 'Review' }}
          component={Review}
        />
        <SearchStack.Screen
          name="Reservation"
          options={{ title: 'Reservation' }}
          component={Reservation}
        />
        <SearchStack.Screen
          name="PizzaMenuRegular"
          options={{headerShown: false}}
          component={PizzaMenuRegular}
        />
      </SearchStack.Navigator>
    </Root>
  );
}
