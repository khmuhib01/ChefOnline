import React, {useEffect, useState} from 'react';
import Config from 'react-native-config';
import Route from './src/components/route';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import allReducers from './src/reducers/allReducer';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import {firebase} from '@react-native-firebase/analytics';
import OneSignal from 'react-native-onesignal';

const store = createStore(allReducers);

//Config.API_URL = 'http://smartrestaurantsolutions.com/mobileapi-test/Tigger.php?';
Config.API_URL =
  'http://smartrestaurantsolutions.com/mobileapi-v2/v2/Tigger.php?';
Config.APP_VERSION = '6.67';

export default function App() {
  useEffect(() => {
    setUpPushNotification();
    getAppTrackingPermission();
  }, []);

  const setUpPushNotification = () => {
    OneSignal.setAppId('cae7e620-8aa7-464f-9e23-31a39b1b4f17');
    OneSignal.setLogLevel(6, 0);
    OneSignal.setRequiresUserPrivacyConsent(false);
    OneSignal.promptForPushNotificationsWithUserResponse(response => {});
    OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
      let notif = notifReceivedEvent.getNotification();
    });
    OneSignal.setNotificationOpenedHandler(notification => {});
    OneSignal.setInAppMessageClickHandler(event => {});
    OneSignal.addEmailSubscriptionObserver(event => {});
    OneSignal.addSubscriptionObserver(event => {});
    OneSignal.addPermissionObserver(event => {});
  };

  const getAppTrackingPermission = async () => {
    const trackingStatus = await requestTrackingPermission();
    if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
      // enable tracking features
      enableFirebase();
    }
  };

  const enableFirebase = async () => {
    await firebase.analytics().setAnalyticsCollectionEnabled(true);
  };

  return (
    <Provider store={store}>
      <Route />
    </Provider>
  );
}
