import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ImageBackground,
  Platform,

  ActivityIndicator,
} from 'react-native';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import getData from './api';
import GetLocation from 'react-native-get-location';


export default function Splash({navigation}) {
  //for redux
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState(true);

  useEffect(() => {
    getLocalData();

    // setTimeout(() => {
    //   navigation.reset({
    //     index: 0,
    //     routes: [{name: 'TabContainer'}],
    //   });
    // }, 3000);
  }, []);

  useEffect(() => {
    if (platform != '') {
      checkForceUpdate();
    }
  }, [platform]);

  const checkForceUpdate = async () => {
    setLoading(true);
    let platform = Platform.OS == 'ios' ? 'iOS' : 'Android';

    let url =
      Config.API_URL +
      'funId=99&platform=ChefOnline&app_version=' +
      Config.APP_VERSION +
      '&app_platform=' +
      platform;

    console.log(url);

    await getData(url)
      .then((response) => {
        if (response.data[0].force_update == 1) {
          if (
            parseFloat(response.data[0].app_version) >
            parseFloat(Config.APP_VERSION)
          ) {
            // console.warn('force update');
            // let storeName = Platform.OS == 'ios' ? 'APPSTORE' : 'PLAYSTORE';
            // let msg =
            //   'A NEW VERSION IS AVAILALBE ON ' +
            //   storeName +
            //   '. PLEASE UPDATE YOUR APP TO ENJOY ALL THE FEATURES.';
            // setSnackbarMessage(msg);
            // setSnackBarVisible(true);
            // dispatch({type: 'SET_APP_UPDATE_STATUS', payload: false});
            // setLoading(false);

            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{name: 'ForceUpdate'}],
              });
            }, 3000);
          } else {
            //  console.warn('app is updated');
            // dispatch({type: 'SET_APP_UPDATE_STATUS', payload: true});
            // setSnackBarVisible(false);

            // setTimeout(() => {
            //   navigation.reset({
            //     index: 0,
            //     routes: [{name: 'TabContainer'}],
            //   });
            // }, 3000);

            getCurrentLocation();

          }
        }

        setLoading(true);
      })
      .catch((error) => {
        setLoading(true);
        console.warn(error.message);
        //setSnackBarVisible(false);
        //setSnackbarMessage(error.message);
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'TabContainer'}],
          });
        }, 3000);
      });
  };

  useEffect(() => {}, []);

  const getCurrentLocation = () => {
    // setLoading(false)
    setLoading(true);
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then((location) => {
        navigation.reset({
          index: 0,
          routes: [{name: 'TabContainer'}],
        });        
      })
      .catch((error) => {
        
        navigation.reset({
          index: 0,
          routes: [{name: 'TabContainer'}],
        });
       
      });
  };

  const getLocalData = async () => {
    try {
      setPlatform(Platform.OS == 'ios' ? 'iOS' : 'Android');
      const jsonValue = await AsyncStorage.getItem('@UserDetails');
      if (jsonValue !== null) {
        dispatch({
          type: 'SET_LOGGED_IN_USER_INFO',
          payload: JSON.parse(jsonValue),
        });
      }
    } catch (e) {
      console.warn(e.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/splash.png')}
      style={styles.image}>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{justifyContent: 'center', marginTop: 80}}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});
