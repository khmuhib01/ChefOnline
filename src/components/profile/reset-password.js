import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import Config from 'react-native-config';
import axios from 'axios';
import {
  Button,
  CardItem,
  Container,
  Input,
  Item,
  Spinner,
  Text,
} from 'native-base';
import {Snackbar} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppButtonContained from '../common/app-button-contained';

export default function ResetPassword({navigation}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrnetPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(false);
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (confirmPassword != '' && newPassword != '')
      if (newPassword != confirmPassword) {
        setErrorMessage("New Password and confirm passoword doesn't match");
        setError(true);
      } else {
        setErrorMessage('');
        setError(false);
      }
  }, [confirmPassword]);

  useEffect(() => {
    if (newPassword != '') {
      if (newPassword.length < 6) {
        setErrorMessage('New Password must be 6 to 16 characters');
        setError(true);
      } else if (newPassword != confirmPassword) {
        setErrorMessage("New Password and confirm passoword doesn't match");
        setError(true);
      } else {
        setErrorMessage('');
        setError(false);
      }
    }
  }, [newPassword]);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@UserDetails');
      if (jsonValue !== null) {
        let temp = JSON.parse(jsonValue);
        setEmail(temp.email);
      } else {
        console.warn('not logged In');
      }
    } catch (e) {
      // error reading value
    }
  };

  const onSubmitChangePassword = async () => {

    if(newPassword.length >= 6 && newPassword.length <= 16){
      setLoading(true);
      await axios
        .get(
          Config.API_URL +
            'funId=10&email=' +
            email +
            '&previouspassword=' +
            currentPassword +
            '&newpassword=' +
            newPassword,
        )
        .then((response) => {
          if (response.data.status == 'Success') {
            setSuccessMessage(response.data.msg);
            setVisibleSnackBar(true);
            setCurrnetPassword('');
            setNewPassword('');
            setConfirmPassword('');
          } else {
            setErrorMessage(response.data.msg);
          }
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.warn(error);
        });

    }else{
      setErrorMessage('Password must contain 6 to 16 characters');

    }
   


  };

  return (
    <Container style={{padding: 5}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <>
          <Item regular>
            <Input
              secureTextEntry={true}
              placeholder="Current password"
              value={currentPassword}
              onChangeText={(currentPassword) =>
                setCurrnetPassword(currentPassword)
              }
            />
          </Item>

          <Item regular>
            <Input
              secureTextEntry={true}
              placeholder="New password"
              value={newPassword}
              onChangeText={(newPassword) => setNewPassword(newPassword)}
            />
          </Item>

          <Item regular style={{marginBottom: 5}}>
            <Input
              secureTextEntry={true}
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={(confirmPassword) =>
                setConfirmPassword(confirmPassword)
              }
            />
          </Item>

          {currentPassword != '' &&
            newPassword != '' &&
            confirmPassword != '' && (
              <Text style={{fontSize: 12, color: 'red'}}>{errorMessage}</Text>
            )}
          <AppButtonContained
            disabled={
              currentPassword == '' ||
              newPassword == '' ||
              confirmPassword == '' ||
              error
            }
            text={'CHANGE PASSWORD'}
            onClick={onSubmitChangePassword}
          />

          {/* <Button
            danger
            rounded
            block
            style={{marginTop: 10}}
            onPress={() => {
              onSubmitChangePassword();
            }}
            disabled={
              currentPassword == '' ||
              newPassword == '' ||
              confirmPassword == '' ||
              error
            }>
            <Text>CHANGE PASSWORD</Text>
          </Button> */}
        </>
      )}

      <Snackbar
        visible={visibleSnackBar}
        onDismiss={() => {}}
        action={{
          label: 'GO BACK',
          onPress: () => {
            navigation.goBack();
          },
        }}>
        {successMessage}{' '}
      </Snackbar>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
  },
  cardItem: {
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  text: {
    fontSize: 12,
  },
  icon: {
    fontSize: 18,
    color: '#EC1A3A',
  },
});
