import {
  Container,
  Input,
  Item,
  Text,
  Button,
  Spinner,
  Card,
  CardItem,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Snackbar} from 'react-native-paper';
import Config from 'react-native-config';
import axios from 'axios';
import AppButtonContained from '../common/app-button-contained';
import {RadioButton} from 'react-native-paper';
import {  CheckBox } from 'react-native-elements';


export default function ForgetPasswordSelectOption({navigation, route}) {
  const {response} = route.params;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [userEmail, setUserEmail] = useState(response.email);
  const [userMobileNo, setuserMobileNo] = useState(response.mobile_no);
  const [selectedOption, setselectedOption] = useState('');

  useEffect(() => {
    let numberOfDots = 0;
    let e1 = '';
    let e2 =
      response.email.charAt(response.email.indexOf('@') - 2) +
      response.email.charAt(response.email.indexOf('@') - 1) +
      '@' +
      response.email.split('@')[1];
    while (numberOfDots < response.email.indexOf('@') - 2) {
      numberOfDots++;
      e1 = e1 + '*';
    }
    setUserEmail(e1 + e2);
    numberOfDots = 2;
    let m2 = response.mobile_no.substr(response.mobile_no.length - 3);
    let m1 = '';
    while (numberOfDots < response.mobile_no.length - 3) {
      numberOfDots++;
      m1 = m1 + '*';
    }
    setuserMobileNo(m1 + m2);
  }, []);

  useEffect(() => {
    if (successMessage != '') {
      setVisibleSnackBar(true);
    }
  }, [successMessage]);

  const onPressSubmitBtn = async () => {
    let apiEmail = '';
    let apiMobile = '';
    if (selectedOption == 'email') {
      apiEmail = response.email;
    } else {
      apiMobile = response.mobile_no;
    }

    setLoading(true);
    await axios({
      method: 'GET',
      url:
        Config.API_URL +
        'funId=127&email=' +
        apiEmail +
        '&mobile=' +
        apiMobile +
        '&user_id=' +
        response.id,
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': 'smartrestaurantsolutions.com',
        'x-rapidapi-key': process.env.REACT_APP_API_KEY,
      },
      params: {
        language_code: 'en',
      },
    })
      .then((apiResponse) => {
        if (apiResponse.data.status == 'success') {
          navigation.navigate('ForgetPasswordOtp', {
            response: response,
            selectedOption: selectedOption,
            msg: apiResponse.data.msg,
          });
        } else {
          setErrorMessage(apiResponse.data.msg);
        }
        setError(false);
        setLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setErrorMessage(JSON.stringify(error));
        setLoading(true);
      });
    // navigation.navigate('ForgetPasswordOtp', {
    //     response: response,
    //     selectedOption: selectedOption,
    //   });
  };

  return (
    <Container style={{padding: 5}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <View style={{flex: 1}}>
          <Card transparent>
            <CardItem bordered style={{paddingLeft: 0, paddingBottom: 5}}>
              <Text>Select your option for receiving verification code</Text>
            </CardItem>
            <CardItem style={{paddingLeft: 0, paddingBottom: 2}}>
              {/* <RadioButton
                color="#ed1a3b"
                value="first"
                status={selectedOption == 'email' ? 'checked' : 'unchecked'}
                onPress={() => {
                  setselectedOption('email');
                }}
              /> */}
              <CheckBox
              center
              title={userEmail}
              containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
              checked={selectedOption == 'email' ? true : false}
              checkedColor="#ed1a3b"
              textStyle={{ color: '#000', fontWeight: 'normal' }}
              onPress={() => {
                setselectedOption('email');
              
              }}
            />
              {/* <Text>{userEmail}</Text> */}
            </CardItem>
            <CardItem style={{paddingLeft: 0, paddingTop: 2}}>
              {/* <RadioButton
                color="#ed1a3b"
                value="first"
                status={selectedOption == 'mobile' ? 'checked' : 'unchecked'}
                onPress={() => {
                  setselectedOption('mobile');
                }}
              /> */}
              {/* <Text>{userMobileNo}</Text> */}
              <CheckBox
              center
              title={userMobileNo}
              containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
              checked={selectedOption == 'mobile' ? true : false}
              checkedColor="#ed1a3b"
              textStyle={{ color: '#000', fontWeight: 'normal' }}
              onPress={() => {
                setselectedOption('mobile');
              
              }}
            />
            </CardItem>
          </Card>

          <AppButtonContained
            text={'SEND OTP'}
            disabled={selectedOption == ''}
            onClick={onPressSubmitBtn}
          />

          <Snackbar
            visible={visibleSnackBar}
            onDismiss={() => {}}
            action={{
              label: 'GO BACK',
              onPress: () => {
                setSuccessMessage(false);
                navigation.goBack();
              },
            }}>
            {successMessage}{' '}
          </Snackbar>
        </View>
      )}
    </Container>
  );
}
