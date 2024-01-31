import {Container, Input, Item, Text, Button, Spinner} from 'native-base';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Snackbar} from 'react-native-paper';
import Config from 'react-native-config';
import axios from 'axios';
import AppButtonContained from '../common/app-button-contained';

export default function ForgetPassword({navigation}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);

  useEffect(() => {
    if (successMessage != '') {
      setVisibleSnackBar(true);
    }
  }, [successMessage]);

  const validate = (text) => {
    setErrorMessage('');
    setError(true);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    setEmail(text);

    if (text.trim() != '') {
      if (reg.test(text) === false) {
        setErrorMessage('Please enter valid email');
      } else {
        setErrorMessage('');
        setError(false);
      }
    } else {
      setErrorMessage('');
      setError(false);
    }
  };

  const onPressSubmitBtn = async () => {
    setLoading(true);
    await axios({
      method: 'GET',
      url: Config.API_URL + 'funId=126&email=' + email,
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': 'smartrestaurantsolutions.com',
        'x-rapidapi-key': process.env.REACT_APP_API_KEY,
      },
      params: {
        language_code: 'en',
      },
    })
      .then((response) => {
        if (response.data.status == 'success') {
          navigation.navigate('ForgetPasswordSelectOption', {
            response: response.data,
          });
          // setEmail('');
          // setErrorMessage('');
          // setSuccessMessage(response.data.app.msg);
        } else {
         
          setErrorMessage(response.data.msg);
        }
        setError(false);
        setLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setErrorMessage(JSON.stringify(error));
        setLoading(true);
      });
    // navigation.navigate('ForgetPasswordSelectOption')
  };

  return (
    <Container style={{padding: 5}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <View style={{flex: 1}}>
          <Text>
            Enter your e-mail address associated with your account to reset your
            password.
          </Text>
          <Item regular style={{borderRadius: 10, marginVertical: 5}}>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Your Email..."
              value={email}
              onChangeText={(email) => validate(email)}
            />
          </Item>
          <Text style={{fontSize: 12, color: 'red'}}>{errorMessage}</Text>

          {/* <Button
            danger
            rounded
            block
            style={{marginTop: 5}}
            onPress={() => {
              onPressSubmitBtn();
            }}
            disabled={email == '' || error}>
            <Text>SUBMIT</Text>
          </Button> */}

          <AppButtonContained
            text={'SUBMIT'}
            disabled={email == '' || error}
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

// "react-native": "0.63.4",
