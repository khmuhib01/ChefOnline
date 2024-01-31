import {Container, Input, Item, Text, Button, Spinner} from 'native-base';
import React, {useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import {Snackbar} from 'react-native-paper';
import Config from 'react-native-config';
import axios from 'axios';
import AppButtonContained from '../common/app-button-contained';

export default function ForgetPasswordConfirm({navigation, route}) {
  const {response, selectedOption} = route.params;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [newPassword, setnewPassword] = useState('');
  const [confirmPassoword, setconfirmPassoword] = useState('');

  useEffect(() => {
    if (successMessage != '') {
      setVisibleSnackBar(true);
    }
  }, [successMessage]);

  const changePassword = async () => {
    // console.warn(
    //   Config.API_URL +
    //     'funId=129&email=&password=' +
    //     newPassword +
    //     '&user_id=' +
    //     response.id,
    // );

    // http://smartrestaurantsolutions.com/mobileapi-v2/v2/Tigger.php?funId=129&password=123457&user_id=15164
    setLoading(true);
    await axios({
      method: 'GET',
      url:
        Config.API_URL +
        'funId=129&email=&password=' +
        newPassword +
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
      .then((response) => {
        if (response.data.status == 'success') {
          Alert.alert('Success', response.data.msg, [
            {
              text: 'Close',
              onPress: () => {
                navigation.popToTop();
              },
              style: 'cancel',
            },
          ]);
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
  };

  const onPressSubmitBtn = () => {
    if (newPassword === confirmPassoword) {
      if (newPassword.length < 6 || newPassword.length > 16) {
        setErrorMessage('Password must contain 6 to 16 characters');
      } else {
        changePassword();
      }
      //changePassword();
    } else {
      setErrorMessage('New password and confirm password does not match');
    }

    // setLoading(true);
    // await axios({
    //   method: 'GET',
    //   url: Config.API_URL + 'funId=126&email=' + email,
    //   headers: {
    //     'content-type': 'application/octet-stream',
    //     'x-rapidapi-host': 'smartrestaurantsolutions.com',
    //     'x-rapidapi-key': process.env.REACT_APP_API_KEY,
    //   },
    //   params: {
    //     language_code: 'en',
    //   },
    // })
    //   .then((response) => {
    //     if (response.data.status == 'success') {
    //       navigation.navigate('ForgetPasswordSelectOption', {
    //         response: response.data,
    //       });
    //       // setEmail('');
    //       // setErrorMessage('');
    //       // setSuccessMessage(response.data.app.msg);
    //     } else {

    //       setErrorMessage(response.data.msg);
    //     }
    //     setError(false);
    //     setLoading(false);
    //   })
    //   .catch((error) => {
    //     console.warn(error);
    //     setErrorMessage(JSON.stringify(error));
    //     setLoading(true);
    //   });
    // navigation.navigate('ForgetPasswordSelectOption')
  };

  return (
    <Container style={{padding: 5}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <View style={{flex: 1}}>
          <Item regular style={{borderRadius: 10, marginVertical: 5}}>
            <Input
              autoCapitalize="none"
              secureTextEntry={true}
              placeholder="New Password..."
              value={newPassword}
              onChangeText={(password) => {
                setnewPassword(password, setErrorMessage(''));
              }}
            />
          </Item>
          <Item regular style={{borderRadius: 10, marginVertical: 5}}>
            <Input
              autoCapitalize="none"
              secureTextEntry={true}
              placeholder="Confirm Password..."
              value={confirmPassoword}
              onChangeText={(password) => {
                setconfirmPassoword(password), setErrorMessage('');
              }}
            />
          </Item>
          {errorMessage != '' && (
            <Text style={{fontSize: 14, color: 'red', paddingVertical: 5}}>
              {errorMessage}
            </Text>
          )}

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
            disabled={newPassword == '' || confirmPassoword == ''}
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
