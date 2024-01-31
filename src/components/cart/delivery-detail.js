import {
  Icon,
  Container,
  Text,
  Input,
  Item,
  Card,
  CardItem,
  Spinner,
} from 'native-base';
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Modal,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import {Snackbar} from 'react-native-paper';

import AppButtonClear from '../common/app-button-clear';
import Config from 'react-native-config';
import getData from '../api';
import AppButtonContained from '../common/app-button-contained';

export default function DeliveryDetail({navigation, route}) {
  const profile = useSelector((state) => state.profile);
  const restaurant = useSelector((state) => state.restaurant);

  const [addressOne, setAddressOne] = useState('');
  const [addressTwo, setAddressTwo] = useState('');
  const [town, setTown] = useState('');
  const [postCode, setpostcode] = useState('');

  const [apiResponseDeliveryAreas, setApiResponseDeliveryAreas] = useState([]);
  const [deliveryAreasModalVisible, setDeliveryAreasModalVisible] = useState(
    false,
  );
  const [deliveryAreaModalLoading, setDeliveryAreaModalLoading] = useState(
    false,
  );
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    profile.userDetails.address1
      ? setAddressOne(profile.userDetails.address1)
      : setAddressOne('');
    profile.userDetails.address2
      ? setAddressTwo(profile.userDetails.address2)
      : setAddressTwo('');
    profile.userDetails.town ? setTown(profile.userDetails.town) : setTown('');
    profile.userDetails.postcode
      ? setpostcode(profile.userDetails.postcode)
      : setpostcode('');
  }, []);

  const onClickDeliveryAreas = async () => {
    if (apiResponseDeliveryAreas.length == 0) {
      setDeliveryAreaModalLoading(true);
      await getData(
        Config.API_URL + 'funId=48&restaurant_id=' + restaurant.restaurantId,
      )
        .then((response) => {
          if (response.data.status == 'Success') {
            setApiResponseDeliveryAreas(response.data.postcode_list.district);
            setDeliveryAreasModalVisible(!deliveryAreasModalVisible);
          } else {
            // console.warn(response.data.app[0].msg);
          }
          setDeliveryAreaModalLoading(false);
        })
        .catch((error) => {
          setDeliveryAreaModalLoading(false);
          console.warn(error.message);
        });
    } else {
      setDeliveryAreasModalVisible(!deliveryAreasModalVisible);
    }
  };

  const onClickContinue = async () => {
    setLoading(true);
    await getData(
      Config.API_URL +
        'funId=47&restaurant_id=' +
        restaurant.restaurantId +
        '&postcode=' +
        postCode,
    )
      .then((response) => {
        if (response.data.status == 'Success') {
          let deliveryFee = 0.0;
          if (
            parseFloat(response.data.user_postcode_charge.min_delivery_charge) >
            0
          ) {
            deliveryFee = parseFloat(
              response.data.user_postcode_charge.min_delivery_charge,
            );
          }

          let payload = {
            postcode: postCode,
            addressOne: addressOne,
            addressTwo: addressTwo,
            town: town,
            deliveryFee: deliveryFee,
          };

          navigation.navigate('Checkout', {
            userDeliveryDetail: payload,
          });
        } else {
          setErrorMsg(response.data.msg);
          setVisibleSnackBar(true);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error.message);
      });
  };

  return (
    <Container style={{padding: 5}}>
      {loading ? (
        <ActivityIndicator size="large" color="#ed1a3b" />
      ) : (
        <>
          <Modal
            style={styles.centeredView}
            animationType="slide"
            transparent={true}
            visible={deliveryAreasModalVisible}
            onRequestClose={() => {
              setDeliveryAreasModalVisible(!deliveryAreasModalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Card style={{width: 340}} transparent>
                  <CardItem
                    style={{
                      justifyContent: 'center',
                      backgroundColor: '#f1f1f1',
                    }}>
                    <Text>Delivery Areas</Text>
                  </CardItem>
                  <CardItem style={{maxHeight: 200}}>
                    {/* <Text>{deliveryAreas}</Text> */}

                    <FlatList
                      data={apiResponseDeliveryAreas}
                      numColumns={6}
                      renderItem={({item}) => <Text>{item}, </Text>}
                      keyExtractor={(item) => item}
                    />
                  </CardItem>

                  <CardItem footer style={{alignSelf: 'center'}}>
                    <AppButtonContained
                      text={'CLOSE'}
                      onClick={() => {
                        setDeliveryAreasModalVisible(false);
                      }}
                    />
                  </CardItem>
                </Card>
              </View>
            </View>
          </Modal>

          <Item regular style={{marginVertical: 2}}>
            <Input
              placeholder="Address One"
              value={addressOne}
              onChangeText={(addressOne) => setAddressOne(addressOne)}
            />
          </Item>
          <Item regular style={{marginVertical: 2}}>
            <Input
              placeholder="Address Two"
              value={addressTwo}
              onChangeText={(addressTwo) => setAddressTwo(addressTwo)}
            />
          </Item>
          <Item regular style={{marginVertical: 2}}>
            <Input
              placeholder="Town/city"
              value={town}
              onChangeText={(town) => setTown(town)}
            />
          </Item>

          <Item regular style={{marginVertical: 2}}>
            <Input
              placeholder="Postcode"
              value={postCode}
              onChangeText={(postCode) => setpostcode(postCode)}
            />
          </Item>

          {deliveryAreaModalLoading ? (
            <ActivityIndicator size="small" color="#ed1a3b" />
          ) : (
            <Item style={{borderBottomWidth: 0}}>
              <Icon
                type="Ionicons"
                name="location"
                style={{color: '#ed1a3b', paddingRight: 0}}
              />
              <AppButtonClear
                text={'DELIVERY AREAS'}
                onClick={onClickDeliveryAreas}
              />
            </Item>
          )}
          <AppButtonContained
            text={'CONTINUE'}
            disabled={addressOne == '' || town == '' || postCode == ''}
            onClick={onClickContinue}
          />
          <Snackbar
            visible={visibleSnackBar}
            onDismiss={() => {}}
            action={{
              label: 'OK',
              onPress: () => {
                setVisibleSnackBar(false);
              },
            }}>
            {errorMsg}
          </Snackbar>
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
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
});
