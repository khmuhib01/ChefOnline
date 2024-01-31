import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Title} from 'react-native-paper';
import Config from 'react-native-config';
import axios from 'axios';
import {
  Content,
  CardItem,
  Container,
  Left,
  Text,
  Card,
  Right,
  H3,
  Col,
  List,
  ListItem,
  Spinner,
  Item,
  Body,
} from 'native-base';
import {FlatList} from 'react-native-gesture-handler';
import CartItem from '../common/cart-item';

export default function OrderHistoryDetail({navigation, route}) {
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState({});
  const [orderedDish, setOrderedDish] = useState([]);
  const {orderId} = route.params;

  useEffect(() => {
    navigation.setOptions({
      title: 'ORDER NO - ' + orderId,
    });
    getOrderDetail();
  }, []);

  const getOrderDetail = async () => {
    setLoading(true);
    console.log(Config.API_URL + 'funId=14&order_id=' + orderId);
    await axios
      .get(Config.API_URL + 'funId=14&order_id=' + orderId)
      .then((response) => {
        console.log(response.data);
        setApiResponse(response.data.order[0]);
        setOrderedDish(response.data.order[0].ordered_dish.dish_choose);

        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error);
      });
  };

  const renderDish = ({item}) => {
    return (
      <Item style={{paddingVertical: 10}}>
        <Col style={{flex: 1}}>
          <Text style={{textAlign: 'left', fontSize: 12}}>
            {item.quantity} X{' '}
          </Text>
        </Col>
        <Col style={{flex: 3}}>
          {item.pizza == null ? (
            <Text style={styles.text}>{item.dish_name}</Text>
          ) : (
            <>
              <Text style={styles.text}>{item.dish_name}</Text>
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
        <Col style={{flex: 1}}>
          {item.pizza == null ? (
            <Text style={{textAlign: 'right', fontSize: 12}}>
              &pound;{item.dish_price}
            </Text>
          ) : (
            <Text style={{textAlign: 'right', fontSize: 12}}>
              &pound;{item.pizza.dish_price}
            </Text>
          )}
        </Col>
      </Item>
    );
  };

  return (
    <Container>
      {loading ? (
        <Spinner color="red" style={{justifyContent: 'center', flex: 1}} />
      ) : (
        <Content>
          <Card transparent>
            <CardItem style={{alignSelf: 'center'}}>
              <Title numberOfLines={1}>
                {apiResponse.restaurant_name != undefined
                  ? apiResponse.restaurant_name.toUpperCase()
                  : apiResponse.restaurant_name}
              </Title>
            </CardItem>
            <CardItem bordered style={styles.cardItem}>
              <Left>
                <Text style={styles.text}>IN: {apiResponse.order_time} </Text>
              </Left>
              <Right>
                <Text style={styles.text}>
                  OUT: {apiResponse.delivery_time}{' '}
                </Text>
              </Right>
            </CardItem>
            <CardItem>
              <Left>
                <Text style={styles.text}>
                  {apiResponse.address1 != undefined
                    ? apiResponse.address1
                    : ''}
                  {apiResponse.address2 != undefined
                    ? apiResponse.address2
                    : ''}
                  ,{' '}
                  {apiResponse.postcode != undefined
                    ? apiResponse.postcode
                    : ''}
                </Text>
              </Left>
              <Right>
                <Text style={styles.text}>{apiResponse.delivery_date}</Text>
              </Right>
            </CardItem>
          </Card>
          <List style={{maxHeight: 300, paddingHorizontal: 15}}>
            <Item style={{paddingVertical: 10}}>
              <Col style={{flex: 1}}>
                <Text style={{textAlign: 'left'}}>QTY</Text>
              </Col>
              <Col style={{flex: 3}}>
                <Text>DISH</Text>
              </Col>
              <Col style={{flex: 1}}>
                <Text style={{textAlign: 'right'}}>PRICE</Text>
              </Col>
            </Item>

            {/* <FlatList
              data={orderedDish}
              renderItem={({item})=>(<CartItem data={item}/>)}
              keyExtractor={(item) => item.dish_id}
            /> */}

            <FlatList
              data={orderedDish}
              renderItem={renderDish}
              keyExtractor={(item) => item.dish_id}
            />
          </List>
          <List style={{backgroundColor: '#ed1a3b', paddingHorizontal: 15}}>
            <Item
              style={{
                paddingVertical: 10,
                borderBottomWidth: 0,
                paddingTop: 3,
                paddingBottom: 3,
              }}>
              <Col style={{flex: 1}}>
                <Text style={{textAlign: 'left', fontSize: 14, color: '#fff'}}>
                  SUB-TOTAL
                </Text>
              </Col>
              <Col style={{flex: 2}}></Col>
              <Col style={{flex: 1}}>
                <Text style={{textAlign: 'right', fontSize: 14, color: '#fff'}}>
                  &pound;{parseFloat(apiResponse.sub_total).toFixed(2)}
                </Text>
              </Col>
            </Item>
            {parseFloat(apiResponse.discount_amount) > 0 && (
              <Item
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 0,
                  paddingTop: 3,
                  paddingBottom: 3,
                }}>
                <Col style={{flex: 1}}>
                  <Text
                    style={{textAlign: 'left', fontSize: 14, color: '#fff'}}>
                    DISCOUNT
                  </Text>
                </Col>
                <Col style={{flex: 3}}></Col>
                <Col style={{flex: 1}}>
                  <Text
                    style={{textAlign: 'right', fontSize: 14, color: '#fff'}}>
                    &pound;{parseFloat(apiResponse.discount_amount).toFixed(2)}
                  </Text>
                </Col>
              </Item>
            )}

            {parseFloat(apiResponse.voucher_discount_amount) > 0 && (
              <Item
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 0,
                  paddingTop: 3,
                  paddingBottom: 3,
                }}>
                <Col style={{flex: 2}}>
                  <Text
                    style={{textAlign: 'left', fontSize: 14, color: '#fff'}}>
                    VOUCHER DISCOUNT
                  </Text>
                </Col>
                <Col style={{flex: 2}}></Col>
                <Col style={{flex: 1}}>
                  <Text
                    style={{textAlign: 'right', fontSize: 14, color: '#fff'}}>
                    &pound;
                    {parseFloat(apiResponse.voucher_discount_amount).toFixed(2)}
                  </Text>
                </Col>
              </Item>
            )}

            {parseFloat(apiResponse.delivery_charge) > 0 && (
              <Item
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 0,
                  paddingTop: 3,
                  paddingBottom: 3,
                }}>
                <Col style={{flex: 2}}>
                  <Text
                    style={{textAlign: 'left', fontSize: 14, color: '#fff'}}>
                    DELIVERY FEE
                  </Text>
                </Col>
                <Col style={{flex: 2}}></Col>
                <Col style={{flex: 1}}>
                  <Text
                    style={{textAlign: 'right', fontSize: 14, color: '#fff'}}>
                    &pound;
                    {parseFloat(apiResponse.delivery_charge).toFixed(2)}
                  </Text>
                </Col>
              </Item>
            )}

            {apiResponse.carrierBagPrice != '' && (
              <Item
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 0,
                  paddingTop: 3,
                  paddingBottom: 3,
                }}>
                <Col style={{flex: 2}}>
                  <Text
                    style={{textAlign: 'left', fontSize: 14, color: '#fff'}}>
                    CARRIER BAG
                  </Text>
                </Col>
                <Col style={{flex: 2}}></Col>
                <Col style={{flex: 1}}>
                  <Text
                    style={{textAlign: 'right', fontSize: 14, color: '#fff'}}>
                    &pound;
                    {apiResponse.carrierBagPrice}
                  </Text>
                </Col>
              </Item>
            )}

            <Item
              style={{
                paddingVertical: 10,
                borderBottomWidth: 0,
                paddingTop: 3,
                paddingBottom: 3,
              }}>
              <Col style={{flex: 2}}>
                <Text style={{textAlign: 'left', fontSize: 14, color: '#fff'}}>
                  TOTAL
                </Text>
              </Col>
              <Col style={{flex: 2}}></Col>
              <Col style={{flex: 1}}>
                <Text style={{textAlign: 'right', fontSize: 14, color: '#fff'}}>
                  &pound;
                  {parseFloat(apiResponse.grand_total).toFixed(2)}
                </Text>
              </Col>
            </Item>
          </List>
          <List>
            {apiResponse.carrierBagQtn != '' && (
              <ListItem style={{paddingTop: 3, paddingBottom: 3}}>
                <Left>
                  <Text style={{fontSize: 14}}>TOTAL BAG</Text>
                </Left>
                <Right>
                  <Text style={{fontSize: 14}}>
                    {apiResponse.carrierBagQtn}
                  </Text>
                </Right>
              </ListItem>
            )}
            {apiResponse.offer_text != '' && (
              <ListItem style={{paddingTop: 3, paddingBottom: 3}}>
                <Body>
                  <Text>{apiResponse.offer_text}</Text>
                </Body>
              </ListItem>
            )}
            <ListItem style={{paddingTop: 3, paddingBottom: 3}}>
              <Left>
                <Text style={{fontSize: 14}}>PAYMENT METHOD</Text>
              </Left>
              <Right>
                <Text style={{fontSize: 14}}>{apiResponse.payment_method}</Text>
              </Right>
            </ListItem>
            <ListItem style={{paddingTop: 3, paddingBottom: 3}}>
              <Left>
                <Text style={{fontSize: 14}}>ORDER TYPE</Text>
              </Left>
              <Right>
                <Text style={{fontSize: 14}}>{apiResponse.order_type}</Text>
              </Right>
            </ListItem>
          </List>
        </Content>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
  },
  cardItem: {
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  text: {
    fontSize: 12,
  },
  icon: {
    fontSize: 18,
    color: '#EC1A3A',
  },
});
