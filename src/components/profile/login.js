import {
  Container,
  Text,
  Form,
  Item,
  Input,
  Icon,
  Grid,
  Col,
  Spinner,
  View,
} from 'native-base';
import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';

import { Button } from 'react-native-paper';
import Config from 'react-native-config';
import getData from '../api';
import { useDispatch } from 'react-redux';
import AppButtonContained from '../common/app-button-contained';
import AppButtonClear from '../common/app-button-clear';

export default function Login({ navigation, route }) {
  //for redux
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  // const [error, setError] = useState('');
  const [emailValidionErrorMsg, setEmailValidionErrorMsg] = useState('');

  const validate = (text) => {
    setErrorMsg('');
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // setEmail(text);

    // if (text.trim() != '') {
    //   if (reg.test(text) === false) {
    //     setEmailValidionErrorMsg('Please enter valid email');
    //   } else {
    //     setEmailValidionErrorMsg('');
    //   }
    // } else {
    //   setEmailValidionErrorMsg('');
    // }

    if (reg.test(text) === false) {
      return false;
    } else {
      return true;
    }
  };

  const onPressLoginBtn = async () => {
    setLoading(true);

    if (validate(email)) {
      setEmailValidionErrorMsg('');

      console.log(Config.API_URL + 'funId=3&username=' + email + '&password=' + password); 

      await getData(
        Config.API_URL + 'funId=3&username=' + email + '&password=' + password,
      )
        .then((response) => {

          console.log(response.data);

          if (response.data.status == 'Success') {
            dispatch({ type: 'SIGN_IN', payload: response.data.UserDetails });
            setErrorMsg('');
          } else {
            setErrorMsg(response.data.UserDetails.Message);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.warn(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
      setEmailValidionErrorMsg('Please enter valid email');
    }
  };

  return (
    <Container style={{ paddingHorizontal: 10 }}>
      {loading ? (
        <Spinner color="red" />
      ) : (
          <>
            <Item style={{ marginLeft: 0 }}>
              <Icon
                type="Ionicons"
                name="mail"
                style={{ color: '#EC1A3A', fontSize: 18 }}
              />
              <Input
                autoCapitalize='none'
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email}
                style={{ fontSize: 14 }}
                onChangeText={(email) => {
                  setEmail(email);
                  setEmailValidionErrorMsg('');
                }}
              />
            </Item>

            {emailValidionErrorMsg != '' && (
              <Text
                style={{
                  color: 'red',
                  fontSize: 12,
                  paddingVertical: 5,
                }}>
                {emailValidionErrorMsg}
              </Text>
            )}
            <Item style={{ marginLeft: 0 }}>
              <Icon
                type="Ionicons"
                name="lock-closed"
                style={{ color: '#EC1A3A', fontSize: 18 }}
              />
              <Input
                placeholder="Enter your password"
                value={password}
                style={{ fontSize: 14 }}
                secureTextEntry={true}
                onChangeText={(password) => {
                  setErrorMsg('');
                  setPassword(password);
                }}
              />
            </Item>

            {errorMsg != '' && (
              <Text
                style={{
                  textAlign: 'center',
                  color: 'red',
                  fontSize: 14,
                  paddingVertical: 5,
                }}>
                {errorMsg}
              </Text>
            )}

            <View style={{ marginVertical: 5 }}>
              <AppButtonContained
                text={'LOGIN'}
                disabled={
                  email == '' || password == '' || emailValidionErrorMsg != ''
                }
                onClick={onPressLoginBtn}
              />
            </View>

            <AppButtonClear
              text={'FORGET YOUR PASSWORD?'}
              onClick={() => {
                navigation.navigate('ForgetPassword');
              }}
            />
            <AppButtonClear
              text={'REGISTER NOW'}
              onClick={() => {
                navigation.navigate('Registration');
              }}
            />
          </>
        )}
    </Container>
  );
}
