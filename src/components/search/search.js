import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';

import {
  Container,
  View,
  Item,
  Icon,
  Input,
  Spinner,
  H3,
  Card,
  CardItem,
  Col,
  Thumbnail,
  ActionSheet,
  Left,
  Body,
  Grid,
} from 'native-base';
import {Picker} from '@react-native-picker/picker';
import {Snackbar, Button, Text} from 'react-native-paper';
import GetLocation from 'react-native-get-location';
import Swiper from 'react-native-swiper';
import AppButtonClear from '../common/app-button-clear';
import CartContext from '../../context/cart-context';
import {useDispatch, useSelector} from 'react-redux';

import Config from 'react-native-config';
import getData from '../api';
import AppButtonContained from '../common/app-button-contained';
import {createStyles, maxHeight, minHeight} from 'react-native-media-queries';
import {TouchableOpacity} from 'react-native';

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

// Define your styles
const base = {
  sliderView: {
    height: 250,
  },
  formView: {
    height: 250,
    justifyContent: 'flex-start',
  },
  bottomView: {
    height: 250,
  },
  slider: {
    width: width * 1,
    height: 200,
  },
  searchTextField: {
    paddingTop: 0,
    paddingBottom: 0,
    height: 30,
    fontSize: 14,
  },
  pickerStyle: {
    height: 35,
    width: 90,
  },
  homePageImg: {
    width: width * 0.91,
    height: width * 0.53,
    alignSelf: 'center',
    justifyContent: 'center',
  },
};

const dynamicStyles = createStyles(
  base,
  // override styles only if screen height is less than 500
  minHeight(
    500,
    maxHeight(599, {
      sliderView: {
        marginTop: 25,
        height: 170,
      },
      formView: {
        height: 160,
      },
      bottomView: {
        flex: 1,
      },
      slider: {
        width: width * 1,
        height: 130,
      },
      searchTextField: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 25,
        fontSize: 12,
      },
      pickerStyle: {
        height: 25,
        width: 100,
      },
      homePageImg: {
        width: width * 0.91,
        height: width * 0.53,
        alignSelf: 'center',
        justifyContent: 'center',
      },
    }),
  ),

  minHeight(
    600,
    maxHeight(699, {
      sliderView: {
        marginTop: 25,
        height: 180,
      },
      formView: {
        height: 170,
      },
      bottomView: {
        flex: 1,
      },
      slider: {
        width: width * 1,
        alignSelf: 'center',
        height: 130,
      },
      searchTextField: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 25,
        fontSize: 12,
      },
      pickerStyle: {
        height: 25,
        width: 100,
      },
      homePageImg: {
        width: width * 0.91,
        height: width * 0.53,
        alignSelf: 'center',
        justifyContent: 'center',
      },
    }),
  ),

  minHeight(
    700,
    maxHeight(799, {
      sliderView: {
        marginTop: 25,
        height: 210,
      },
      formView: {
        height: 180,
      },
      bottomView: {
        flex: 1,
      },
      slider: {
        width: width * 1,
        height: 150,
      },
      searchTextField: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 30,
        fontSize: 13,
      },
      pickerStyle: {
        height: 35,
        width: 90,
      },
      homePageImg: {
        width: width * 0.91,
        height: width * 0.53,
        alignSelf: 'center',
        justifyContent: 'center',
      },
    }),
  ),

  minHeight(
    800,
    maxHeight(900, {
      sliderView: {
        height: 250,
      },
      formView: {
        height: 210,
      },
      bottomView: {
        flex: 1,
      },
      slider: {
        width: width * 0.88,
        alignSelf: 'center',
        height: 240,
      },
      searchTextField: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 40,
        fontSize: 15,
      },
      pickerStyle: {
        height: 30,
        width: 90,
        flex: 1,
      },
      homePageImg: {
        width: width * 0.91,
        height: width * 0.53,
        alignSelf: 'center',
        justifyContent: 'center',
      },
    }),
  ),

  minHeight(910, {
    sliderView: {
      marginTop: 20,
      height: 240,
    },
    formView: {
      height: 200,
    },
    bottomView: {
      flex: 1,
    },
    slider: {
      width: width * 0.88,
      alignSelf: 'center',
      height: 200,
    },
    searchTextField: {
      paddingTop: 0,
      paddingBottom: 0,
      height: 35,
      fontSize: 15,
    },
    pickerStyle: {
      height: 35,
      width: 90,
    },
    homePageImg: {
      width: width * 0.91,
      height: width * 0.53,
      alignSelf: 'center',
      justifyContent: 'center',
    },
  }),
);

export default function Search({navigation, route}) {
  //for context
  const {cart, setCart} = useContext(CartContext);

  //for redux
  const restaurant = useSelector(state => state.restaurant);
  const dispatch = useDispatch();

  const [searchedText, setSearchedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNearByRestaurants, setloadingNearByRestaurants] = useState(
    false,
  );
  const [featuredRestaurantList, setFeaturedRestaurantList] = useState([]);
  const [sliderImages, setsliderImages] = useState([]);
  const [isOnlineOrderSelected, setisOnlineOrderSelected] = useState(true);
  const [selectedCuisine, setselectedCuisine] = useState('');
  const [loadNearByRestaurants, setloadNearByRestaurants] = useState(false);
  const [nearbyRestaurantPostCode, setnearbyRestaurantPostCode] = useState('');
  const [nearbyRestaurantList, setnearbyRestaurantList] = useState([]);

  //for snackbar
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [cuisines, setcuisines] = useState([]);

  useEffect(() => {
    const parent = navigation.dangerouslyGetParent();
    parent.setOptions({
      tabBarVisible: true,
    });
    getSliderImages();
    getCuisines();
    getCurrentLocationForNearByRestaurants();
    // console.warn(height);
  }, []);

  useEffect(() => {
    if (loadNearByRestaurants && nearbyRestaurantList.length == 0) {
      getNearbyRestaurants();
    }
  }, [loadNearByRestaurants]);

  const getSliderImages = async () => {
    await getData(Config.API_URL + 'funId=122')
      .then(response => {
        if (response.data.result != undefined) {
          setsliderImages(response.data.result);
        }
      })
      .catch(error => {
        setSnackBarMessage(JSON.stringify(error));
      });
  };

  const getCuisines = async () => {
    setLoading(true);
    await getData(Config.API_URL + 'funId=124')
      .then(response => {
        let temp = [];
        temp.push('All');
        for (var a = 0; a < response.data.length; a++) {
          temp.push(response.data[a]);
        }
        setcuisines(temp);

        setLoading(false);
      })
      .catch(error => {
        setSnackBarMessage(JSON.stringify(error));
        setLoading(false);
      });
  };

  const getFeaturedRestaurants = async () => {
    // await getData(
    //   'http://smartrestaurantsolutions.com/mobile-react-api/test/Trigger.php?funId=2',
    // )

    await getData(
      'http://smartrestaurantsolutions.com/mobile-react-api/live/Trigger.php?funId=2',
    )
      .then(response => {
        if (response.data.featured.length > 0) {
          setFeaturedRestaurantList(response.data.featured);
        }
      })
      .catch(error => {
        setSnackBarMessage(JSON.stringify(error));
      });
  };

  const getCurrentLocation = () => {
    setLoading(true);
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(location => {
        getPostcode(location.latitude, location.longitude);
      })
      .catch(error => {
        setLoading(false);
        console.warn(error.message);
      });
  };

  const getCurrentLocationForNearByRestaurants = () => {
    setLoading(true);
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(location => {
        getPostcodeForNearByRestaurants(location.latitude, location.longitude);
      })
      .catch(error => {
        setLoading(false);
        console.warn(error.message);
      });
  };

  const getPostcode = async (latitude, longitude) => {
    // let url =
    //   'https://api.postcodes.io/postcodes?lon=-0.0738251&lat=51.5239319';
    let url =
      'https://api.postcodes.io/postcodes?lon=-0.0738251' +
      longitude +
      '&lat=' +
      latitude;

    await getData(url)
      .then(response => {
        if (response.data.status == 200) {
          if (response.data.result != null) {
            setSearchedText(response.data.result[0].postcode);
          } else {
            setSnackBarMessage('SORRY! NO POSTCODE FOUND');
            setVisibleSnackBar(true);
          }
        } else {
          setSnackBarMessage(response.data.error);
          setVisibleSnackBar(true);
        }

        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.warn(error.message);
      });
  };

  const getPostcodeForNearByRestaurants = async (latitude, longitude) => {
    let url =
      'https://api.postcodes.io/postcodes?lon=-0.0738251' +
      longitude +
      '&lat=' +
      latitude;

    await getData(url)
      .then(response => {
        if (response.data.status == 200) {
          if (response.data.result != null) {
            setnearbyRestaurantPostCode(response.data.result[0].postcode);
            setloadNearByRestaurants(true);
          } else {
            // setnearbyRestaurantPostCode('e16sa');
            // setloadNearByRestaurants(true);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        //console.warn(error.message);
      });
  };

  const getNearbyRestaurants = async postCode => {
    setloadingNearByRestaurants(true);
    await getData(
      Config.API_URL +
        'funId=6&searchText=' +
        nearbyRestaurantPostCode +
        '&orderType=takeaway' +
        '&cuisineType=all&pageNo=1',
    )
      .then(response => {
        console.log(response.data);
        if (response.data.status == 'Success') {
          setnearbyRestaurantList(response.data.app);
          //console.warn(response.data);
        }
        setLoading(false);
        setloadingNearByRestaurants(false);
      })
      .catch(error => {
        setLoading(false);
        console.warn(error.message);
      });
  };

  const onClickSearchButton = async () => {
    setLoading(true);
    let ordertype = isOnlineOrderSelected ? 'takeaway' : 'reservation';
    let cuisineType =
      selectedCuisine == '' || selectedCuisine == undefined
        ? 'all'
        : selectedCuisine;
    console.log(
      Config.API_URL +
        'funId=6&searchText=' +
        searchedText +
        '&orderType=' +
        ordertype +
        '&cuisineType=' +
        cuisineType.replace('&', 'and') +
        '&pageNo=1',
    );
    await getData(
      Config.API_URL +
        'funId=6&searchText=' +
        searchedText +
        '&orderType=' +
        ordertype +
        '&cuisineType=' +
        cuisineType.replace('&', 'and') +
        '&pageNo=1',
    )
      .then(response => {
        console.log(response.data);
        if (response.data.status == 'Success') {
          navigation.navigate('SearchResult', {
            apiResponse: response.data,
            searchedText: searchedText,
            ordertype: ordertype,
            cuisineType: cuisineType,
          });
        } else {
          setSnackBarMessage(response.data.app[0].msg);
          setVisibleSnackBar(true);
        }
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.warn(error.message);
      });
  };

  // const goToRestaurant = (param) => {
  //   if (restaurant.restaurantId == '' || cart.badgeCount == 0) {
  //     let payload = {
  //       dish: [],
  //       subTotal: 0.0,
  //       availedDiscountAmount: 0.0,
  //       associativeMenuObj: {},
  //       badgeCount: 0,
  //       selectedOrderPolicy: {},
  //       availedDiscount: {},
  //       availedOffer: {},
  //       availedVoucher: {},
  //       selectedPaymentMethod: {},
  //       scheduleList: [],
  //     };
  //     setCart(payload);
  //     dispatch({type: 'CLEAR_RESTAURANT_DATA'});

  //     navigation.navigate('Menu', {
  //       restaurantId: param.rest_id,
  //       restaurantName: param.restaurant_name,
  //       distance: '',
  //     });
  //   } else if (restaurant.restaurantId == param.rest_id) {
  //     navigation.navigate('Menu', {
  //       restaurantId: param.rest_id,
  //       restaurantName: param.restaurant_name,
  //       distance: '',
  //     });
  //   } else {
  //     Alert.alert(
  //       'MESSAGE',
  //       'Your cart will be lost while you select different restaurant',
  //       [
  //         {
  //           text: 'Cancel',
  //           onPress: () => console.log('Cancel Pressed'),
  //           style: 'cancel',
  //         },
  //         {
  //           text: 'OK',
  //           onPress: () => {
  //             let payload = {
  //               dish: [],
  //               subTotal: 0.0,
  //               availedDiscountAmount: 0.0,
  //               associativeMenuObj: {},
  //               badgeCount: 0,
  //               selectedOrderPolicy: {},
  //               availedDiscount: {},
  //               availedOffer: {},
  //               availedVoucher: {},
  //               selectedPaymentMethod: {},
  //               scheduleList: [],
  //             };
  //             setCart(payload);
  //             dispatch({type: 'CLEAR_RESTAURANT_DATA'});
  //             navigation.navigate('Menu', {
  //               restaurantId: param.rest_id,
  //               restaurantName: param.restaurant_name,
  //               distance: '',
  //             });
  //           },
  //         },
  //       ],
  //       {cancelable: false},
  //     );
  //   }

  //   // navigation.navigate('Menu', {
  //   //   restaurantId: param.rest_id,
  //   //   restaurantName: param.restaurant_name,
  //   // });
  // };

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
    // console.warn(props.item);

    for (let discount of props.item) {
      if (discount.order_type == 'Delivery' || discount.order_type == 'Both') {
        return (
          <View>
            <Text
              style={{
                backgroundColor: '#ff4a66',
                color: '#fff',
                fontSize: 10,
                paddingVertical: 1,
                paddingHorizontal: 2,
                textTransform: 'capitalize',
                borderRadius: 3,
                alignSelf: 'flex-end',
              }}
            >
              {discount.discount_title}
            </Text>

            <Text
              style={{
                fontSize: 9,
                color: '#7a7a7a',
                textAlign: 'right',
              }}
            >
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

  const renderNearByRestaurant = ({item}) => {
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
            <CardItem style={styles.cardItem}>
              <Left style={{flex: 1}}>
                <Thumbnail square source={{uri: item.logo}} />
              </Left>
              <Body style={{flex: 4}}>
                <Grid>
                  <Col style={{flex: 1.5}}>
                    <Text style={styles.medium_text}>
                      {item.restaurant_name}
                    </Text>
                    <FlatList
                      data={item.available_cuisine.cuisine}
                      horizontal
                      renderItem={({item, index}) => (
                        <Text style={styles.small_text}>
                          {index > 0 ? ', ' : ''}
                          {item.name}
                        </Text>
                      )}
                      keyExtractor={item => item.cuisine_id}
                    />

                    <Grid>
                      <Col style={{flex: 1.5}}>
                        {item.rating.rating_count != '0' ? (
                          <Text style={styles.small_text}>
                            <Icon
                              type="FontAwesome"
                              name="star"
                              style={{color: '#ff4a66', fontSize: 12}}
                            />{' '}
                            {parseFloat(item.rating.avg_rating).toFixed(1)}(
                            {item.rating.review_count} review)
                          </Text>
                        ) : (
                          <Text style={styles.small_text}>
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
                          <Text style={styles.small_text}>
                            <Icon
                              type="Entypo"
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
                            <Text style={styles.small_text}>
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
                <Text style={styles.reservationText}>
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
                      <Col>
                        {item.policy_name == 'Collection' ? (
                          <Text style={styles.small_text}>
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
                          <Text style={styles.small_text}>
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
                      </Col>
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
    <Container>
      <StatusBar
        translucent={false}
        backgroundColor="#fff"
        barStyle="dark-content"
      />
      <View style={dynamicStyles.sliderView}>
        {sliderImages.length > 0 && (
          <Swiper
            autoplay={true}
            showsButtons={false}
            autoplayTimeout={8}
            activeDotColor="#ed1a3b"
            dotStyle={{marginTop: 0}}
            activeDotStyle={{marginTop: 0}}
            dotColor="#d6d6d6"
            style={{
              alignSelf: 'flex-start',
              justifyContent: 'flex-end',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
            }}
            showsPagination={true}
          >
            {sliderImages.map((item, index) => (
              <Image
                resizeMode="contain"
                key={item.id}
                source={{uri: item.url}}
                style={dynamicStyles.slider}
              />
            ))}
          </Swiper>
        )}
      </View>
      <View style={dynamicStyles.formView}>
        {loading ? (
          <Spinner color="#ed1a3b" />
        ) : (
          <Card
            transparent
            style={{
              marginLeft: width * 0.06,
              marginRight: width * 0.06,
              backgroundColor: '#d1d1d1',
              borderRadius: 5,

              marginTop: 0,
            }}
          >
            <CardItem
              style={{
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingTop: 0,
              }}
            >
              <Button
                mode="contained"
                color={isOnlineOrderSelected ? '#ed1a3b' : '#816161'}
                compact={true}
                labelStyle={{
                  textTransform: 'capitalize',
                }}
                style={{
                  marginRight: 2,
                  alignSelf: 'flex-end',
                  borderRadius: 0,
                  borderTopLeftRadius: 5,
                }}
                onPress={() => setisOnlineOrderSelected(true)}
              >
                <Text style={{fontSize: 12, color: '#fff'}}>
                  Order a Takeaway
                </Text>
              </Button>
              <Button
                mode="contained"
                color={!isOnlineOrderSelected ? '#ed1a3b' : '#816161'}
                compact={true}
                labelStyle={{
                  textTransform: 'capitalize',
                }}
                style={{
                  marginRight: 2,
                  alignSelf: 'flex-end',
                  borderRadius: 0,
                  borderTopRightRadius: 5,
                }}
                onPress={() => setisOnlineOrderSelected(false)}
              >
                <Text style={{fontSize: 12, color: '#fff'}}>
                  Make a Reservation
                </Text>
              </Button>
            </CardItem>
            <CardItem
              style={{
                backgroundColor: '#d1d1d1',
                borderTopColor: '#ed1a3b',
                borderTopWidth: 5,
                paddingBottom: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Item
                regular
                bordered
                style={{backgroundColor: '#fff', borderRadius: 5}}
              >
                <Input
                  value={searchedText}
                  onChangeText={text => {
                    setSearchedText(text);
                  }}
                  placeholder="Postcode/Town/Restaurant Name"
                  style={dynamicStyles.searchTextField}
                />
                <TouchableWithoutFeedback
                  onPress={() => {
                    getCurrentLocation();
                  }}
                >
                  <Icon name="locate" style={{color: '#EC1A3A'}} />
                </TouchableWithoutFeedback>
              </Item>
            </CardItem>

            {cuisines.length > 0 && (
              <CardItem
                style={{
                  backgroundColor: '#d1d1d1',
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
              >
                <Item
                  regular
                  onPress={() => {
                    ActionSheet.show(
                      {
                        options: cuisines,
                        title: 'Select Cuisine',
                      },
                      index => {
                        //this.setState({clicked: BUTTONS[buttonIndex]});
                        setselectedCuisine(cuisines[index]);
                      },
                    );
                  }}
                  bordered
                  style={{backgroundColor: '#fff', borderRadius: 5}}
                >
                  <Input
                    value={selectedCuisine}
                    placeholder="Select Cuisine"
                    style={dynamicStyles.searchTextField}
                    editable={false}
                  />

                  <Icon
                    name="chevron-small-down"
                    type="Entypo"
                    style={{color: '#EC1A3A'}}
                  />
                </Item>
              </CardItem>
            )}

            <CardItem
              style={{
                backgroundColor: '#d1d1d1',
                borderRadius: 5,
                paddingTop: 5,
              }}
            >
              <Button
                disabled={searchedText == ''}
                mode="contained"
                color="#ed1a3b"
                compact={true}
                style={{flex: 1}}
                onPress={() => onClickSearchButton()}
              >
                Find Restaurant
              </Button>
            </CardItem>
          </Card>
        )}
      </View>
      <View style={dynamicStyles.bottomView}>
        {loadingNearByRestaurants ? (
          <Spinner color="#ed1a3b" />
        ) : (
          <>
            {nearbyRestaurantList.length == 0 ? (
              <Image
                resizeMode="contain"
                source={require('../../assets/images/home-page-image.png')}
                style={dynamicStyles.homePageImg}
              />
            ) : (
              <>
                <H3
                  style={{
                    color: '#000',
                    fontWeight: 'bold',
                    paddingLeft: 25,
                    fontSize: 15,
                  }}
                >
                  Restaurants Nearby
                </H3>

                <FlatList
                  data={nearbyRestaurantList}
                  style={{paddingHorizontal: 22}}
                  numColumns={1}
                  renderItem={renderNearByRestaurant}
                  keyExtractor={(item, index) => {
                    return index + 'rest_id' + item.rest_id;
                  }}
                />
              </>
            )}
          </>
        )}
      </View>

      <Snackbar
        visible={visibleSnackBar}
        duration={6000}
        onDismiss={() => {
          setSnackBarMessage('');
          setVisibleSnackBar(false);
        }}
        action={{
          label: 'OK',
          onPress: () => {
            setSnackBarMessage('');
            setVisibleSnackBar(false);
          },
        }}
      >
        {snackBarMessage}
      </Snackbar>
    </Container>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: width * 1,
    height: height * 0.25,
  },
  logo: {
    alignSelf: 'center',
    width: width * 0.73,
    height: width * 0.1,
  },
  homePageImg: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: width * 0.91,
    height: width * 0.53,
  },
  input: {
    fontSize: 14,
  },
  text: {
    fontSize: 12,
  },
  item: {
    borderRadius: 10,
    paddingHorizontal: 5,
    marginBottom: 20,
    marginLeft: width * 0.05,
    marginRight: width * 0.05,
  },
  card: {
    borderRadius: 10,
    flex: 1,
  },
  icon: {
    fontSize: 14,
    color: '#ff4a66',
  },
  small_text: {
    fontSize: 10,
    color: '#7a7a7a',
    textTransform: 'capitalize',
  },
  medium_text: {
    fontSize: 12,
    // fontWeight: 'bold',
  },
  reservationText: {
    fontSize: 10,
    color: '#7a7a7a',
    textTransform: 'capitalize',
    textAlign: 'left',
    justifyContent: 'flex-start',
  },
  cardItem: {
    borderRadius: 10,
    paddingLeft: 8,
    paddingBottom: 5,
  },
  selectedLabel: {
    color: '#fff',
  },
  unselectedLabel: {
    color: '#000',
  },
});
