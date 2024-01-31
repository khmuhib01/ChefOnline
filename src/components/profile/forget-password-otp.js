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
import {StyleSheet, View, Clipboard} from 'react-native';
import {Paragraph, Snackbar} from 'react-native-paper';
import Config from 'react-native-config';
import axios from 'axios';
import AppButtonContained from '../common/app-button-contained';
import OTPInputView from '@twotalltotems/react-native-otp-input';

export default function ForgetPasswordOtp({navigation, route}) {
  const {response, selectedOption, msg} = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [canResendCode, setcanResendCode] = useState(false);
  const [timer, settimer] = useState(30);
  let localTimer = 0;
  useEffect(() => {
    startTimer();
  }, []);

  const startTimer = () => {
    localTimer = 30;
    let interval = setInterval(function () {
      localTimer--;
      settimer(localTimer);
      if (localTimer <= 0) {
        clearInterval(interval);
        setcanResendCode(true);
      }
    }, 1000);
  };

  const submitOtp = async(otp) => {
    setLoading(true);
    await axios({
      method: 'GET',
      url: Config.API_URL + 'funId=128&otp=' + otp + '&user_id=' + response.id,
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
          localTimer = 0;
          navigation.navigate('ForgetPasswordConfirm', {
            response: response,
            selectedOption: selectedOption,            
          });
        } else {
          // console.warn(apiResponse12)
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
  };

  const onPressResendBtn = async() => {
    setErrorMessage('');
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
          setSuccessMessage(apiResponse.data.msg);
          setVisibleSnackBar(true);
        } else {
          setErrorMessage(apiResponse.data.msg);
        }       
        setLoading(false);
        startTimer();
      })
      .catch((error) => {
        console.warn(error);
        setErrorMessage(JSON.stringify(error));
        setLoading(true);
      });


  };

  return (
    <Container style={{padding: 5}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Please Enter Verification Code Below</Text>

          <OTPInputView
            style={{width: '80%', height: 100}}
            pinCount={4}
            onCodeChanged={(code) => {
              setErrorMessage('');
            }}
            autoFocusOnLoad
            codeInputFieldStyle={styles.underlineStyleBase}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeFilled={(code) => {
              submitOtp(code);
            }}
          />

          <Text style={{fontSize: 14, color: 'red'}}>{errorMessage}</Text>

          <AppButtonContained
            text={`RESEND CODE ${timer > 0 ? `(${timer})` : ``}`}
            disabled={!canResendCode || timer > 0}
            onClick={onPressResendBtn}
          />

          <Snackbar
            visible={visibleSnackBar}
            duration={2000}
            onDismiss={() => {
              setSuccessMessage('');
              setVisibleSnackBar(false);
            }}>
            {successMessage}{' '}
          </Snackbar>
        </View>
      )}
    </Container>
  );
}
const styles = StyleSheet.create({
  borderStyleBase: {
    width: 30,
    height: 45,
  },

  borderStyleHighLighted: {
    color: '#ed1a3b',
    borderColor: 'red',
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'red',
    color: '#ed1a3b',
  },

  underlineStyleHighLighted: {
    borderColor: 'red',
    color: '#ed1a3b',
  },
});
