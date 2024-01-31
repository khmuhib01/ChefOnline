import {
  CardItem,
  Container,
  Content,
  Card,
  Item,
  Input,
  Col,
  Grid,
  Textarea,
  Button,
  Label,
  Spinner,
} from 'native-base';
import DatePicker from 'react-native-datepicker';

import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Snackbar, Title, Text} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import Config from 'react-native-config';
import getData from '../api';
import AppButtonContained from '../common/app-button-contained';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';



export default function EditProfile({navigation, route}) {
  let dispatch = useDispatch();

  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);


  const [title, setTitle] = useState(profile.userDetails.title);
  const [firstName, setFirstName] = useState(profile.userDetails.first_name);
  const [lastName, setLastName] = useState(profile.userDetails.last_name);
  const [email, setEmail] = useState(profile.userDetails.email);
  const [mobileNo, setMobileNo] = useState(profile.userDetails.mobile_no);
  const [telephone, setTelephone] = useState(profile.userDetails.telephone_no);
  const [dob, setDob] = useState(profile.userDetails.date_of_birth);
  const [addressOne, setAddressOne] = useState(profile.userDetails.address1);
  const [addressTwo, setAddressTwo] = useState(profile.userDetails.address2);
  const [city, setCity] = useState(profile.userDetails.town);
  const [country, setCountry] = useState(profile.userDetails.country);
  const [postcode, setPostcode] = useState(profile.userDetails.postcode);

  //for snackbar
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');

  const onSubmitUpdateProfile = async () => {

    // let convertedDob = moment(dob).format('MM-DD');    

    // console.warn(dob);

    setLoading(true);
    await getData(
      Config.API_URL +
        'funId=15&userid=' +
        profile.userDetails.userid +
        '&title=' +
        title +
        '&fname=' +
        firstName +
        '&lname=' +
        lastName +
        '&email=' +
        email +
        '&mobile_no=' +
        mobileNo +
        '&telephone_no=' +
        telephone +
        '&address1=' +
        addressOne +
        '&address2=' +
        addressTwo +
        '&city=' +
        city +
        '&country=' +
        country +
        '&postcode=' +
        postcode +
        '&dob_date=' +
        dob +
        '&doa=',
    )
      .then((response) => {
        //console.log(response);
        if (response.data.status == 'Success') {
          console.log(response.data.UserDetails);
          setDataToLocalStorage(response.data.UserDetails);
          setSnackBarMessage(response.data.msg);
          setVisibleSnackBar(true);
        } else {
          setSnackBarMessage(response.data.msg);
          setVisibleSnackBar(true);
        }

        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error);
      });
  };

  const setDataToLocalStorage = async (payload) => {
    const jsonValue = JSON.stringify(payload);
    dispatch({
      type: 'SET_LOGGED_IN_USER_INFO',
      payload: JSON.parse(jsonValue),
    });

    await AsyncStorage.setItem('@UserDetails', jsonValue);
  };

  return (
    <Container style={{padding: 5}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <Content>
          <Grid>
            <Col style={{flex: 0.5}}>
              <Item regular style={{marginRight: 2, marginVertical: 2}}>
                <Input
                  style={{fontSize: 14}}
                  placeholder="Title"
                  value={title}
                  onChangeText={(title) => setTitle(title)}
                />
              </Item>
            </Col>
            <Col style={{flex: 1}}>
              <Item
                regular
                style={{
                  marginHorizontal: 2,
                  marginVertical: 2,
                }}>
                <Input
                  style={{fontSize: 14}}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={(firstName) => setFirstName(firstName)}
                />
              </Item>
            </Col>
            <Col style={{flex: 1}}>
              <Item regular style={{marginLeft: 2, marginVertical: 2}}>
                <Input
                  style={{fontSize: 14}}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={(lastName) => setLastName(lastName)}
                />
              </Item>
            </Col>
          </Grid>

          <Item regular style={{marginVertical: 2}}>
            <Input
              disabled
              autoCapitalize='none'
              style={{fontSize: 14}}
              placeholder="Email"
              value={email}
              onChangeText={(email) => setEmail(email)}
            />
          </Item>
          <Grid>
            <Col>
              <Item regular style={{marginRight: 2, marginVertical: 2}}>
                <Input
                  style={{fontSize: 14}}
                  disabled
                  placeholder="Mobile No"
                  value={mobileNo}
                  onChangeText={(mobileNo) => setMobileNo(mobileNo)}
                />
              </Item>
            </Col>
            <Col>
              <Item regular style={{marginLeft: 2, marginVertical: 2}}>
                <Input
                  style={{fontSize: 14}}
                  placeholder="Telephone No"
                  value={telephone}
                  onChangeText={(telephone) => setTelephone(telephone)}
                />
              </Item>
            </Col>
          </Grid>

          <Item style={{marginVertical: 2}}>
            <Label style={{flex: 0.1, paddingLeft: 5}}>
              <Text style={{fontSize: 14}}>DOB</Text>
            </Label>

            <DatePicker
              disabled={profile.userDetails.date_of_birth != ''}
              style={{flex: 1, fontSize: 14}}
              date={dob}
              mode="date"
              placeholder="select date"
              format="MM-DD"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              onDateChange={(date) => {
                setDob(date);
              }}
            />
          </Item>

          <Item regular style={{marginVertical: 2}}>
            <Textarea
              rowSpan={2}
              style={{fontSize: 14}}
              placeholder="Address 1"
              value={addressOne}
              onChangeText={(addressOne) => setAddressOne(addressOne)}
            />
          </Item>
          <Item regular style={{marginVertical: 2}}>
            <Textarea
              rowSpan={2}
              placeholder="Address 2"
              value={addressTwo}
              style={{fontSize: 14}}
              onChangeText={(addressTwo) => setAddressTwo(addressTwo)}
            />
          </Item>

          <Grid>
            <Col>
              <Item regular style={{marginRight: 2, marginVertical: 2}}>
                <Input
                  style={{fontSize: 14}}
                  placeholder="Town/City"
                  value={city}
                  onChangeText={(city) => setCity(city)}
                />
              </Item>
            </Col>
            <Col>
              <Item regular style={{marginLeft: 2, marginVertical: 2}}>
                <Input
                  style={{fontSize: 14}}
                  placeholder="Country"
                  value={country}
                  onChangeText={(country) => setCountry(country)}
                />
              </Item>
            </Col>
          </Grid>

          <Item regular style={{marginVertical: 2, marginBottom: 5}}>
            <Input
              style={{fontSize: 14}}
              placeholder="Post Code"
              value={postcode}
              onChangeText={(postcode) => setPostcode(postcode)}
            />
          </Item>

          <AppButtonContained
            text={'UPDATE PROFILE'}
            onClick={onSubmitUpdateProfile}
          />
        </Content>
      )}

      <Snackbar
        visible={visibleSnackBar}
        onDismiss={() => {}}
        action={{
          label: 'OK',
          onPress: () => {
            setSnackBarMessage('');
            setVisibleSnackBar(false);
          },
        }}>
        {snackBarMessage}
      </Snackbar>
    </Container>
  );
}

const styles = StyleSheet.create({});
