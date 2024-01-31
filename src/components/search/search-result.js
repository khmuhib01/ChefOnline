import {
  Container,
  Col,
  Icon,
  Thumbnail,
  CardItem,
  Card,
  Left,
  Body,
  Grid,
  Label,
} from 'native-base';
import {Snackbar, Title, Text} from 'react-native-paper';

import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Modal,
  View,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import AppButtonContained from '../common/app-button-contained';
import Config from 'react-native-config';
import getData from '../api';
import CartContext from '../../context/cart-context';
import {useDispatch, useSelector} from 'react-redux';
import {createStyles, maxHeight, minHeight} from 'react-native-media-queries';

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

// Define your styles
const base = {
  restaurantNameText: {
    fontSize: 14,
  },
  ashText: {
    fontSize: 12,
    color: '#7a7a7a',
    textTransform: 'capitalize',
  },
  discountText: {
    backgroundColor: '#ff4a66',
    color: '#fff',
    fontSize: 12,
    paddingVertical: 1,
    paddingHorizontal: 2,
    textTransform: 'capitalize',
    borderRadius: 3,
    alignSelf: 'flex-end',
  },
  discountAshText: {
    fontSize: 12,
    color: '#7a7a7a',
    textAlign: 'right',
  },
  thumbnailLeft: {
    flex: 1,
  },
  restaurantInfoBody: {
    flex: 3.5,
  },
};

const dynamicStyles = createStyles(
  base,
  // override styles only if screen height is less than 500
  minHeight(
    500,
    maxHeight(599, {
      restaurantNameText: {
        fontSize: 12,
      },
      ashText: {
        fontSize: 10,
        color: '#7a7a7a',
        textTransform: 'capitalize',
      },
      discountText: {
        backgroundColor: '#ff4a66',
        color: '#fff',
        fontSize: 10,
        paddingVertical: 1,
        paddingHorizontal: 2,
        textTransform: 'capitalize',
        borderRadius: 3,
        alignSelf: 'flex-end',
      },
      discountAshText: {
        fontSize: 10,
        color: '#7a7a7a',
        textAlign: 'right',
      },
      thumbnailLeft: {
        flex: 1.3,
      },
      restaurantInfoBody: {
        flex: 3.5,
      },
    }),
  ),

  minHeight(
    600,
    maxHeight(699, {
      restaurantNameText: {
        fontSize: 15,
      },
      ashText: {
        fontSize: 13,
        color: '#7a7a7a',
        textTransform: 'capitalize',
      },
      discountText: {
        backgroundColor: '#ff4a66',
        color: '#fff',
        fontSize: 10,
        paddingVertical: 1,
        paddingHorizontal: 2,
        textTransform: 'capitalize',
        borderRadius: 3,
        alignSelf: 'flex-end',
      },
      discountAshText: {
        fontSize: 10,
        color: '#7a7a7a',
        textAlign: 'right',
      },
      thumbnailLeft: {
        flex: 1.2,
      },
      restaurantInfoBody: {
        flex: 3.5,
      },
    }),
  ),

  minHeight(
    700,
    maxHeight(799, {
      restaurantNameText: {
        fontSize: 16,
      },
      ashText: {
        fontSize: 14,
        color: '#7a7a7a',
        textTransform: 'capitalize',
      },
      discountText: {
        backgroundColor: '#ff4a66',
        color: '#fff',
        fontSize: 11,
        paddingVertical: 1,
        paddingHorizontal: 2,
        textTransform: 'capitalize',
        borderRadius: 3,
        alignSelf: 'flex-end',
      },
      discountAshText: {
        fontSize: 11,
        color: '#7a7a7a',
        textAlign: 'right',
      },
      thumbnailLeft: {
        flex: 1.1,
      },
      restaurantInfoBody: {
        flex: 3.5,
      },
    }),
  ),

  minHeight(
    800,
    maxHeight(900, {
      restaurantNameText: {
        fontSize: 16,
      },
      ashText: {
        fontSize: 14,
        color: '#7a7a7a',
        textTransform: 'capitalize',
      },
      discountText: {
        backgroundColor: '#ff4a66',
        color: '#fff',
        fontSize: 13,
        paddingVertical: 1,
        paddingHorizontal: 2,
        textTransform: 'capitalize',
        borderRadius: 3,
        alignSelf: 'flex-end',
      },
      discountAshText: {
        fontSize: 13,
        color: '#7a7a7a',
        textAlign: 'right',
      },
      thumbnailLeft: {
        flex: 1.1,
      },
      restaurantInfoBody: {
        flex: 3.5,
      },
    }),
  ),

  minHeight(901, {
    restaurantNameText: {
      fontSize: 16,
    },
    ashText: {
      fontSize: 14,
      color: '#7a7a7a',
      textTransform: 'capitalize',
    },
    discountText: {
      backgroundColor: '#ff4a66',
      color: '#fff',
      fontSize: 12,
      paddingVertical: 1,
      paddingHorizontal: 2,
      textTransform: 'capitalize',
      borderRadius: 3,
      alignSelf: 'flex-end',
    },
    discountAshText: {
      fontSize: 12,
      color: '#7a7a7a',
      textAlign: 'right',
    },
    thumbnailLeft: {
      flex: 1,
    },
    restaurantInfoBody: {
      flex: 3.5,
    },
  }),
);

export default function SearchResult({navigation, route}) {
  //for context
  const {cart, setCart} = useContext(CartContext);

  //for redux
  const restaurant = useSelector(state => state.restaurant);
  const dispatch = useDispatch();

  const {apiResponse, searchedText, ordertype, cuisineType} = route.params;
  const [restaurantList, setRestaurantList] = useState([]);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerList, setOfferList] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [continueToLoad, setContinueToLoad] = useState(true);
  const [loadingNewContent, setLoadingNewContent] = useState(false);
  const [discount, setdiscount] = useState({});

  useEffect(() => {
    console.warn(height);
    navigation.setOptions({
      title: searchedText,
    });

    //console.log(apiResponse);

    setRestaurantList(apiResponse.app);

    if (apiResponse.app.length < 3) {
      setContinueToLoad(false);
    }
  }, []);

  useEffect(() => {
    if (continueToLoad) {
      if (pageNo != 1) {
        getResutantList();
      }
    }
  }, [pageNo]);

  const loadMore = () => {
    if (continueToLoad) {
      let temp = pageNo;
      temp++;
      setPageNo(temp);
    }
  };

  const getDiscountList = item => {
    let temp = [];
    if (item.discount.status == 1) {
      for (var a = 0; a < item.discount.off.length; a++) {
        if (item.discount.off[a].active == 1) {
          let obj = {};
          obj.id = item.discount.off[a].discount_id;
          obj.text =
            item.discount.off[a].discount_title +
            ' ' +
            item.discount.off[a].discount_description;
          obj.image = item.discount.off[a].image;

          temp.push(obj);
        }
      }
    }
    if (item.offer.status == 1) {
      for (var a = 0; a < item.offer.offer_list.length; a++) {
        if (item.offer.offer_list[a].active == 1) {
          let obj = {};
          obj.id = item.offer.offer_list[a].id;
          obj.text =
            item.offer.offer_list[a].offer_title +
            ' ' +
            item.offer.offer_list[a].description;
          obj.image = item.offer.offer_list[a].image;
          temp.push(obj);
        }
      }
    }

    setOfferList(temp);
    if (temp.length > 0) {
      setOfferModalVisible(!offerModalVisible);
    }
  };

  const getResutantList = async () => {
    setLoadingNewContent(true);

    let url =
      Config.API_URL +
      'funId=6&searchText=' +
      searchedText +
      '&orderType=' +
      ordertype +
      '&cuisineType=' +
      cuisineType.replace('&', 'and') +
      '&pageNo=' +
      pageNo;

    await getData(url)
      .then(response => {
        if (response.data.status == 'Success') {
          if (response.data.app.length > 0) {
            let temp = [];
            temp = restaurantList;
            for (var a = 0; a < response.data.app.length; a++) {
              temp.push(response.data.app[a]);
            }
            setRestaurantList(restaurantList);

            if (response.data.app.length < 3) {
              setContinueToLoad(false);
            }
          } else {
            setContinueToLoad(false);
          }
        }
        setLoadingNewContent(false);
      })
      .catch(error => {
        setLoadingNewContent(false);
        console.warn(error.message);
      });
  };

  const goToRestaurant = param => {
    if (restaurant.restaurantId == '' || cart.badgeCount == 0) {
      let payload = {
        dish: [],
        subTotal: 0.0,
        availedDiscountAmount: 0.0,
        associativeMenuObj: {},
        badgeCount: 0,
        selectedOrderPolicy: {},
        availedDiscount: {},
        availedOffer: {},
        availedVoucher: {},
        selectedPaymentMethod: {},
        scheduleList: [],
      };
      setCart(payload);
      dispatch({type: 'CLEAR_RESTAURANT_DATA'});

      navigation.navigate('Menu', {
        restaurantId: param.rest_id,
        restaurantName: param.restaurant_name,
        distance: param.distance,
      });
    } else if (restaurant.restaurantId == param.rest_id) {
      navigation.navigate('Menu', {
        restaurantId: param.rest_id,
        restaurantName: param.restaurant_name,
        distance: param.distance,
      });
    } else {
      Alert.alert(
        'MESSAGE',
        'Your cart will be lost while you select different restaurant',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              let payload = {
                dish: [],
                subTotal: 0.0,
                availedDiscountAmount: 0.0,
                associativeMenuObj: {},
                badgeCount: 0,
                selectedOrderPolicy: {},
                availedDiscount: {},
                availedOffer: {},
                availedVoucher: {},
                selectedPaymentMethod: {},
                scheduleList: [],
              };
              setCart(payload);
              dispatch({type: 'CLEAR_RESTAURANT_DATA'});
              navigation.navigate('Menu', {
                restaurantId: param.rest_id,
                restaurantName: param.restaurant_name,
                distance: param.distance,
              });
            },
          },
        ],
        {cancelable: false},
      );
    }

    // navigation.navigate('Menu', {
    //   restaurantId: param.rest_id,
    //   restaurantName: param.restaurant_name,
    // });
  };

  const renderOffers = ({item}) => {
    return (
      <CardItem bordered>
        {item.image != '' && (
          <Col style={{flex: 0.3}}>
            <Thumbnail square source={{uri: item.image}} />
          </Col>
        )}
        <Col style={{flex: 1}}>
          <Text>
            {item.text != undefined ? item.text.replace('<br>', ' ') : ''}
          </Text>
        </Col>
      </CardItem>
    );
  };

  const showAlertOnRedSticker = () => {
    Alert.alert(
      'Sorry for any inconvenience',
      'Our online ordering system is coming soon.',
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  };

  const RenderDiscount = props => {
    for (let discount of props.item) {
      if (discount.order_type == 'Delivery' || discount.order_type == 'Both') {
        return (
          <View>
            <Text style={dynamicStyles.discountText}>
              {discount.discount_title}
            </Text>

            <Text style={dynamicStyles.discountAshText}>
              Min: &pound;
              {discount.eligible_amount}
            </Text>
          </View>
        );
        // return(
        //   <Text>{discount.discount_id}</Text>
        // )
      }
    }

    return <Text></Text>;
  };

  const VoucherCode = ({exdate, voucher_code}) => {
    let currentDate = new Date();

    let exDate = new Date(exdate);

    if (currentDate < exDate) {
      if (voucher_code != undefined) {
        return (
          <>
            <View style={styles.voucherCode}>
              <Text
                style={{
                  fontSize: 10,
                  paddingHorizontal: 5,
                  backgroundColor: '#ed1a3b',
                  color: '#fff',
                  textAlign: 'center',
                }}
              >
                USE CODE
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  paddingHorizontal: 5,
                  textAlign: 'center',
                }}
              >
                CHEFNEW
              </Text>
            </View>
          </>
        );
      } else {
        return <Text></Text>;
      }
    } else {
      return <Text></Text>;
    }
  };

  const renderRestaurants = ({item}) => {
    return (
      <>
        {/* {item.red_sticker == '0' && ( */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (item.red_sticker == '0') {
              goToRestaurant(item);
            } else {
              showAlertOnRedSticker();
            }
          }}
        >
          <Card style={styles.card}>
            <CardItem style={[styles.cardItem, {overflow: 'hidden'}]}>
              {item.offer.status == 1 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: -15,
                    zIndex: 99,
                    transform: [{rotate: '-45deg'}],
                    backgroundColor: '#ED193B',
                    paddingVertical: 2.5,
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={{color: '#fff', fontSize: 12}}>Offers</Text>
                </View>
              )}

              <Left
                style={[
                  {marginRight: 15, flexDirection: 'column'},
                  dynamicStyles.thumbnailLeft,
                ]}
              >
                <Thumbnail large square source={{uri: item.logo}} />
              </Left>

              <Body style={dynamicStyles.restaurantInfoBody}>
                <Grid>
                  <Col style={{flex: 1.5}}>
                    <Text style={dynamicStyles.restaurantNameText}>
                      {item.restaurant_name}
                    </Text>
                    <FlatList
                      data={item.available_cuisine.cuisine}
                      horizontal
                      renderItem={({item, index}) => (
                        <Text style={dynamicStyles.ashText}>
                          {index > 0 ? ', ' : ''}
                          {item.name}
                        </Text>
                      )}
                      keyExtractor={item => item.cuisine_id}
                    />

                    <Text style={{color: '#222', fontSize: 12}}>
                      {item.postcode}
                    </Text>

                    <Grid>
                      <Col style={{flex: 1.5}}>
                        {item.rating.rating_count != '0' ? (
                          <Text style={dynamicStyles.ashText}>
                            <Icon
                              type="FontAwesome"
                              name="star"
                              style={{color: '#ff4a66', fontSize: 12}}
                            />{' '}
                            {parseFloat(item.rating.avg_rating).toFixed(1)}(
                            {item.rating.review_count} review)
                          </Text>
                        ) : (
                          <Text style={dynamicStyles.ashText}>
                            <Icon
                              type="FontAwesome"
                              name="star-o"
                              style={{color: '#7a7a7a', fontSize: 12}}
                            />{' '}
                            ({item.rating.review_count} review)
                          </Text>
                        )}
                      </Col>
                      <Col style={{flex: 0.6}}>
                        {item.distance != '' && (
                          <Text style={dynamicStyles.ashText}>
                            <Icon
                              type="Ionicons"
                              name="location"
                              style={styles.icon}
                            />{' '}
                            {item.distance}
                          </Text>
                        )}
                      </Col>
                    </Grid>

                    <FlatList
                      data={item.order_policy.policy}
                      renderItem={({item}) => (
                        <>
                          {item.policy_name == 'Delivery' && (
                            <Text style={dynamicStyles.ashText}>
                              Minimum Delivery: &pound;
                              {parseFloat(item.min_order).toFixed(2)}
                            </Text>
                          )}
                        </>
                      )}
                      keyExtractor={item => item.policy_id}
                    />
                  </Col>
                  <Col style={{flex: 0.5}}>
                    {item.discount.off != undefined && (
                      <>
                        {item.discount.status == 1 && (
                          <RenderDiscount item={item.discount.off} />
                        )}
                      </>
                    )}

                    <VoucherCode
                      exdate={item.expires_at}
                      voucher_code={item.voucher_code}
                    />

                    {/* {item.voucher_code != undefined && (
                      <>
                        <View style={{borderWidth: 1, borderColor: "#ed1a3b", color: "#fff", width: 60, marginTop: 5, position:"absolute", right: 4, top: 0, borderRadius: 4}}>
                          <Text style={{fontSize: 10,backgroundColor: "#ed1a3b", color: "#fff", textAlign: "center"}}>USE CODE</Text>
                          <Text style={{ fontSize: 10,textAlign:"center" }}>CHEFNEW</Text>
                        </View>
                      </>
                    )}*/}
                  </Col>
                </Grid>
              </Body>
            </CardItem>
            <CardItem
              style={{
                borderRadius: 10,
                paddingLeft: 8,
                paddingTop: 5,
                paddingBottom: 5,
              }}
            >
              {item.accept_reservation == '1' && (
                <Text style={dynamicStyles.ashText}>
                  <Icon type="Entypo" name="calendar" style={styles.icon} />{' '}
                  RESERVATION {'  '}|{'  '}
                </Text>
              )}

              <FlatList
                data={item.order_policy.policy}
                horizontal
                renderItem={({item}) => (
                  <>
                    {item.policy_time != '0' && (
                      <>
                        {item.policy_name == 'Collection' ? (
                          <Text style={dynamicStyles.ashText}>
                            <Icon
                              type="Entypo"
                              name="shopping-bag"
                              style={styles.icon}
                            />
                            {' Collection ('}
                            {item.policy_time}
                            {' mins) '}
                          </Text>
                        ) : (
                          <Text style={dynamicStyles.ashText}>
                            <Text style={{color: '#c2c2c2'}}>
                              {'  '}|{'  '}
                            </Text>
                            <Icon
                              type="Ionicons"
                              name="bicycle"
                              style={styles.icon}
                            />
                            {' Delivery ('}
                            {item.policy_time}
                            {' mins)'}
                          </Text>
                        )}
                      </>
                    )}
                  </>
                )}
                keyExtractor={(item, index) => {
                  return index + 'Policy' + item.policy_id;
                }}
              />
            </CardItem>
          </Card>
        </TouchableWithoutFeedback>
        {/* )} */}
      </>
    );
  };

  return (
    <Container style={{padding: 5}}>
      <Text style={dynamicStyles.ashText}>
        {loadingNewContent ? (
          <ActivityIndicator size="small" color="#ed1a3b" />
        ) : (
          <>{restaurantList.length} </>
        )}
        RESTAURANTS FOUND
      </Text>

      <Modal
        style={styles.centeredView}
        animationType="slide"
        transparent={true}
        visible={offerModalVisible}
        onRequestClose={() => {
          setOfferModalVisible(!offerModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Card style={{width: 340}} transparent>
              <CardItem
                style={{justifyContent: 'center', backgroundColor: '#f1f1f1'}}
              >
                <Text>AVAILABLE OFFERS</Text>
              </CardItem>

              <FlatList
                data={offerList}
                renderItem={renderOffers}
                keyExtractor={item => item.id}
              />

              <CardItem footer style={{alignSelf: 'center'}}>
                <AppButtonContained
                  text={'CLOSE'}
                  onClick={() => {
                    setOfferModalVisible(false);
                  }}
                />
              </CardItem>
            </Card>
          </View>
        </View>
      </Modal>

      <FlatList
        data={restaurantList}
        renderItem={renderRestaurants}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        initialNumToRender={10}
        keyExtractor={(item, index) => {
          return index + 'rest_id' + item.rest_id;
        }}
      />

      {loadingNewContent && <ActivityIndicator size="small" color="#ed1a3b" />}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    flex: 1,
  },
  cardItem: {
    borderRadius: 10,
    paddingLeft: 8,
    paddingBottom: 5,
  },
  medium_text: {
    fontSize: 12,
  },
  small_text: {
    fontSize: 10,
    color: '#7a7a7a',
    textTransform: 'capitalize',
  },
  text: {
    fontSize: 12,
  },
  reservationText: {
    fontSize: 10,
    color: '#7a7a7a',
    textTransform: 'capitalize',
    textAlign: 'left',
    justifyContent: 'flex-start',
  },
  icon: {
    fontSize: 14,
    color: '#ff4a66',
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
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(163, 163, 163, 0.89)',
  },
  voucherCode: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ed1a3b',
    color: '#fff',
    marginTop: 5,
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: 4,
  },
});
