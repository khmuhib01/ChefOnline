import { Item, Col } from 'native-base';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function CartItem(props) {
  return (
    <Item style={{ paddingVertical: 10 }}>
      <Col style={{ flex: .5 }}>
        <Text style={{ textAlign: 'left' }}>{props.data.quantity} X </Text>
      </Col>
      <Col style={{ flex: 3 }}>
        {props.data.pizza == undefined ? (
          <Text>{props.data.dish_name}</Text>
        ) : (

          <>
            <Text>{props.data.dish_name}</Text>


            <FlatList
              data={props.data.pizza.order_items.layers}
              renderItem={({ item }) => (
                <Text style={{ fontSize: 11 }}>{item.material_name}</Text>
              )}
              keyExtractor={(item, index) => { return item.material_id + "_" + index }}
            />

            <FlatList
              data={props.data.pizza.order_items.toppings}
              renderItem={({ item }) => (
                <Text style={{ fontSize: 10 }}> + {item.quantity} X {item.name}</Text>
              )}
              keyExtractor={(item, index) => { return item.id + "_" + index }}
            />
          </>
        )}
      </Col>
      <Col style={{ flex: 1 }}>

        {props.data.pizza == undefined || props.data.pizza == null ? (
          <Text style={{ textAlign: 'right' }}>
            &pound;{parseFloat(props.data.dish_price).toFixed(2)}
          </Text>
        ) : (
          <Text style={{ textAlign: 'right' }}>
            &pound;{parseFloat(props.data.pizza.dish_price).toFixed(2)}
          </Text>
        )}
      </Col>
    </Item>
  );
}

const styles = StyleSheet.create({

});
