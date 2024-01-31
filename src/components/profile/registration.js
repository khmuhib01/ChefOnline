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
  Label,
  Spinner,
} from 'native-base';
import {Checkbox, Button, Text, Snackbar} from 'react-native-paper';
import DatePicker from 'react-native-datepicker';

import React, {useEffect, useState} from 'react';
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedbackComponent,
  Platform,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Config from 'react-native-config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import moment from 'moment';
import getData from '../api';
import AppButtonContained from '../common/app-button-contained';

export default function Registraion({navigation}) {
  let dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [telephone, setTelephone] = useState('');
  const [dob, setDob] = useState('');
  const [addressOne, setAddressOne] = useState('');
  const [addressTwo, setAddressTwo] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postcode, setPostcode] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [userIp, setUserIp] = useState('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [snackBarErrorMessage, setSnackBarErrorMessage] = useState(false);
  const [visibleSuccessSnackBar, setVisibleSuccessSnackBar] = useState(false);
  const [snackBarSuccessMessage, setSnackBarSuccessMessage] = useState(false);

  const [acceptTermsAndConditions, setAcceptTermsAndConditions] = useState(
    false,
  );
  const [acceptEmailAndNewsLetter, setAcceptEmailAndNewsLetter] = useState(
    true,
  );
  const [acceptTextMessage, setAcceptTextMessage] = useState(true);

  useEffect(() => {
    getUserIp();
  }, []);

  const getUserIp = async () => {
    await getData(Config.API_URL + 'funId=44')
      .then((response) => {
        if (response.data.status == '1') {
          setUserIp(response.data.details.ip);
        }
      })
      .catch((error) => {
        console.warn(error.message);
      });
  };

  const validateEmail = () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === false) {
      return false;
    } else {
      return true;
    }
  };

  const validateMobileNo = () => {
    let reg = /^(07[\d]{8,12}|447[\d]{7,11})$/;
    if (reg.test(mobileNo) === false) {
      return false;
    } else {
      return true;
    }
  };

  const onSubmitRegisterBtn = async () => {
    if (validateEmail()) {
      if (validateMobileNo()) {
        if (password.length >= 6 && password.length <= 16) {
          if (password === retypePassword) {
            if (acceptTermsAndConditions) {
              getRegistered();
            } else {
              // console.warn('Please Check Terms and conditions');
              setSnackBarErrorMessage(
                'As you have not agreed to our Terms & Conditions, Privacy Policy & Cookie Policy, we are not able to process your request. You must agree before registering.',
              );
              setVisibleSnackBar(true);
            }
          } else {
            // console.warn('Password and Retype passoword does not match');
            setSnackBarErrorMessage(
              'Password and Retype passoword does not match',
            );
            setVisibleSnackBar(true);
          }
        } else {
          // console.warn(
          //   'Length of password should be between 6 and 16 characters.',
          // );

          setSnackBarErrorMessage(
            'Length of password should be between 6 and 16 characters',
          );
          setVisibleSnackBar(true);
        }
      } else {
        // console.warn('Please Enter Valid Mobile No');
        setSnackBarErrorMessage('Please Enter Valid Mobile No');
        setVisibleSnackBar(true);
      }
    } else {
      // console.warn('Please Enter Valid Email');
      setSnackBarErrorMessage('Please Enter Valid Email');
      setVisibleSnackBar(true);
    }
  };

  const getRegistered = async () => {
    setLoading(true);
    let want_newslatter = acceptEmailAndNewsLetter ? 1 : 0;
    let want_text_message = acceptTextMessage ? 1 : 0;
    let platform = Platform.OS == 'ios' ? 1 : 2;

    // console.log(
    //   Config.API_URL +
    //     'funId=8&title=' +
    //     title +
    //     '&fname=' +
    //     firstName +
    //     '&lname=' +
    //     lastName +
    //     '&email=' +
    //     email +
    //     '&mobile_no=' +
    //     mobileNo +
    //     '&telephone_no=' +
    //     telephone +
    //     '&postcode=' +
    //     postcode +
    //     '&address1=' +
    //     addressOne +
    //     '&address2=' +
    //     addressTwo +
    //     '&city=' +
    //     city +
    //     '&country=' +
    //     country +
    //     '&password=' +
    //     password +
    //     '&dob_date=' +
    //     dob +
    //     '&doa=&ip_address=' +
    //     userIp +
    //     '&platform=' +
    //     platform +
    //     '&want_newslatter=' +
    //     want_newslatter +
    //     '&want_text_message=' +
    //     want_text_message,
    // );

    await getData(
      Config.API_URL +
        'funId=8&title=' +
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
        '&postcode=' +
        postcode +
        '&address1=' +
        addressOne +
        '&address2=' +
        addressTwo +
        '&city=' +
        city +
        '&country=' +
        country +
        '&password=' +
        password +
        '&dob_date=' +
        dob +
        '&doa=&ip_address=' +
        userIp +
        '&platform=' +
        platform +
        '&want_newslatter=' +
        want_newslatter +
        '&want_text_message=' +
        want_text_message,
    )
      .then((response) => {
        if (response.data.status == 'Success') {
          clearAllData();
          setDataToLocalStorage(response.data.UserDetails);
          setSnackBarSuccessMessage(response.data.msg);
          setVisibleSuccessSnackBar(true);
        } else {
          setSnackBarErrorMessage(response.data.msg);
          setVisibleSnackBar(true);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error.message);
      });
  };

  const clearAllData = () => {
    setTitle('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobileNo('');
    setTelephone('');
    setDob('');
    setAddressOne('');
    setAddressTwo('');
    setCity('');
    setCountry('');
    setPostcode('');
    setPassword('');
    setRetypePassword('');
    setRetypePassword('');
    setAcceptEmailAndNewsLetter('');
    setAcceptTermsAndConditions('');
    setAcceptTextMessage('');
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
      <Content>
        {loading ? (
          <Spinner color="red" />
        ) : (
          <Content>
            <Grid>
              {/* <Col style={{flex: 0.5}}>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginRight: 2,
                    marginVertical: 2,
                    height: 35,
                  }}>
                  <Input
                    style={{fontSize: 14}}
                    placeholder="Title*"
                    value={title}
                    onChangeText={(title) => setTitle(title)}
                  />
                </Item>
              </Col> */}
              <Col style={{flex: 1}}>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginHorizontal: 2,
                    marginVertical: 2,
                   
                  }}>
                  <Input
                    style={{fontSize: 14}}
                    placeholder="First Name*"
                    value={firstName}
                    onChangeText={(firstName) => setFirstName(firstName)}
                  />
                </Item>
              </Col>
              <Col style={{flex: 1}}>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginLeft: 2,
                    marginVertical: 2,
                    
                  }}>
                  <Input
                    style={{fontSize: 14}}
                    placeholder="Last Name*"
                    value={lastName}
                    onChangeText={(lastName) => setLastName(lastName)}
                  />
                </Item>
              </Col>
            </Grid>

            <Item
              regular
              style={{borderRadius: 10, marginVertical: 2}}>
              <Input
                style={{fontSize: 14}}
                autoCapitalize='none'
                keyboardType="email-address"
                placeholder="Email*"
                value={email}
                onChangeText={(email) => setEmail(email)}
              />
            </Item>
            <Grid>
              <Col>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginRight: 2,
                    marginVertical: 2,
                    
                  }}>
                  <Input
                    style={{fontSize: 14}}
                    keyboardType='phone-pad'
                    placeholder="Mobile No*"
                    value={mobileNo}
                    onChangeText={(mobileNo) => setMobileNo(mobileNo)}
                  />
                </Item>
              </Col>
              {/* <Col>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginLeft: 2,
                    marginVertical: 2,
                    height: 35,
                  }}>
                  <Input
                    style={{fontSize: 14}}
                    placeholder="Telephone No"
                    value={telephone}
                    onChangeText={(telephone) => setTelephone(telephone)}
                  />
                </Item>
              </Col> */}
            </Grid>

            {/* <Item style={{borderRadius: 10, marginVertical: 2, height: 45}}> */}
            {/* <Input
            placeholder="DOB"
            value={dob}
            onChangeText={(dob) => setDob(dob)}
          /> */}
            {/* <Label style={{flex: 0.2, paddingLeft: 5}}>
                <Text>DOB*</Text>
              </Label>

              <DatePicker
                style={{flex: 1}}
                date={dob}
                mode="date"
                placeholder="select date"
                format="DD-MM-YYYY"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                onDateChange={(date) => {
                  setDob(date);
                }}
              />
            </Item> */}

            {/* <Item regular style={{borderRadius: 10, marginVertical: 2}}>
              <Textarea
                rowSpan={2}
                placeholder="Address 1*"
                value={addressOne}
                onChangeText={(addressOne) => setAddressOne(addressOne)}
              />
            </Item>
            <Item regular style={{borderRadius: 10, marginVertical: 2}}>
              <Textarea
                rowSpan={2}
                placeholder="Address 2"
                value={addressTwo}
                onChangeText={(addressTwo) => setAddressTwo(addressTwo)}
              />
            </Item> */}

            {/* <Grid>
              <Col>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginRight: 2,
                    marginVertical: 2,
                    height: 35,
                  }}>
                  <Input
                    style={{fontSize: 14}}
                    placeholder="Town/City"
                    value={city}
                    onChangeText={(city) => setCity(city)}
                  />
                </Item>
              </Col>
              <Col>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginLeft: 2,
                    marginVertical: 2,
                    height: 35,
                  }}>
                  <Input
                    style={{fontSize: 14}}
                    placeholder="Country"
                    value={country}
                    onChangeText={(country) => setCountry(country)}
                  />
                </Item>
              </Col>
            </Grid> */}

            {/* <Item
              regular
              style={{borderRadius: 10, marginVertical: 2, height: 35}}>
              <Input
                style={{fontSize: 14}}
                placeholder="Post Code*"
                value={postcode}
                onChangeText={(postcode) => setPostcode(postcode)}
              />
            </Item> */}

            <Grid>
              <Col>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginRight: 2,
                    marginVertical: 2,
                    
                  }}>
                  <Input
                  secureTextEntry={true}
                    style={{fontSize: 14}}
                    placeholder="Password*"
                    value={password}
                    onChangeText={(password) => setPassword(password)}
                  />
                </Item>
              </Col>
              <Col>
                <Item
                  regular
                  style={{
                    borderRadius: 10,
                    marginLeft: 2,
                    marginVertical: 2,
                    
                  }}>
                  <Input
                  secureTextEntry={true}
                    style={{fontSize: 14}}
                    placeholder="Retype Password*"
                    value={retypePassword}
                    onChangeText={(retypePassword) =>
                      setRetypePassword(retypePassword)
                    }
                  />
                </Item>
              </Col>
            </Grid>

            <Card style={{borderRadius: 10}}>
              <CardItem style={{borderRadius: 10}}>
                <Checkbox
                  color="red"
                  status={acceptTermsAndConditions ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setAcceptTermsAndConditions(!acceptTermsAndConditions);
                  }}
                />
                <Text style={{fontSize: 12}}>
                  I Agree to the{' '}
                  <Text
                    style={{color: 'red', fontSize: 12}}
                    onPress={() => {

                      navigation.navigate('Settings', {
                        screen: 'SettingsDetail',
                        params: {
                          settingsId: 3,
                          settingsName: 'Terms & Conditions',
                        },
                      });



                    }}>
                    Terms and conditions
                  </Text>
                  <Text>{' , '}</Text>
                  <Text
                    style={{color: 'red', fontSize: 12}}
                    onPress={() => {
                    
                      navigation.navigate('Settings', {
                        screen: 'SettingsDetail',
                        params: {
                          settingsId: 4,
                          settingsName: 'Privacy Policy',
                        },
                      });

                    }}>
                    Privacy Policy{' '}
                  </Text>
                  &{'\n'}
                  <Text
                    style={{color: 'red', fontSize: 12}}
                    onPress={() => {
                      navigation.navigate('Settings', {
                        screen: 'SettingsDetail',
                        params: {
                          settingsId: 2,
                          settingsName: 'Cookies Policy',
                        },
                      });
                    }}>
                    Cookies Policy
                  </Text>
                </Text>
              </CardItem>
            </Card>

            <Card style={{borderRadius: 10}}>
              <CardItem style={{borderRadius: 10}}>
                <Checkbox
                  color="red"
                  status={acceptEmailAndNewsLetter ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setAcceptEmailAndNewsLetter(!acceptEmailAndNewsLetter);
                  }}
                />
                <Text style={{fontSize: 12}}>
                  I wish to receive emails/newsletters on offers, discounts,
                  promotions and prize draw.
                </Text>
              </CardItem>
            </Card>
            <Card style={{borderRadius: 10}}>
              <CardItem style={{borderRadius: 10}}>
                <Checkbox
                  color="red"
                  status={acceptTextMessage ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setAcceptTextMessage(!acceptTextMessage);
                  }}
                />
                <Text style={{fontSize: 12}}>
                  I wish to receive text message on offers, discounts,
                  promotions and prize draw.
                </Text>
              </CardItem>
            </Card>

            {/* <Button
              mode="contained"
              color="#EC1A3A"
              disabled={
                firstName == '' ||
                lastName == '' ||
                email == '' ||
                mobileNo == '' ||
                password == '' ||
                retypePassword == ''
              }
              style={{marginTop: 5}}
              onPress={() => {
                onSubmitRegisterBtn();
              }}>
              REGISTER
            </Button> */}

            <AppButtonContained 
              text={'REGISTER'}
              disabled={
                firstName == '' ||
                lastName == '' ||
                email == '' ||
                mobileNo == '' ||
                password == '' ||
                retypePassword == ''
              }
              onClick={onSubmitRegisterBtn}
            />

         
          </Content>
        )}
      </Content>

      <Snackbar
              visible={visibleSuccessSnackBar}
              onDismiss={() => {}}
              action={{
                label: 'OK',
                onPress: () => {
                  setVisibleSuccessSnackBar(false);
                  setSnackBarSuccessMessage('');
                  // navigation.navigate('Profile');

                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Profile'}],
                  });
                },
              }}>
              {snackBarSuccessMessage}
            </Snackbar>

            <Snackbar
              visible={visibleSnackBar}
              onDismiss={() => {}}
              action={{
                label: 'OK',
                onPress: () => {
                  setVisibleSnackBar(false);
                  setSnackBarErrorMessage('');
                },
              }}>
              {snackBarErrorMessage}
            </Snackbar>
    </Container>
  );
}
