import {Container, Text, Card, CardItem, H3} from 'native-base';
import React, {useState, useEffect} from 'react';
import {StyleSheet, Linking, Platform} from 'react-native';
import AppButtonContained from './common/app-button-contained';

export default function ForceUpdate() {
  const [platform, setPlatform] = useState(true);
  useEffect(() => {}, []);

  return (
    <Container style={{justifyContent: 'center', padding: 5}}>
      <Card style={{borderRadius: 10}}>
        <CardItem  bordered style={{borderRadius: 10,alignSelf:'center'}}>
          <H3 style={{color:'#ed1a3b'}}>UPDATE YOUR APP</H3>
        </CardItem>
        <CardItem style={{borderRadius: 10}}>
          <Text>
            {' '}
            A NEW VERSION IS AVAILABLE IN{' '}
            {Platform.OS == 'ios' ? 'APP STORE' : 'PLAYSTORE'}.
          </Text>
        </CardItem>
        <CardItem style={{borderRadius: 10}}>
          <Text>
            PLEASE UPDATE YOUR APP IN ORDER TO ENJOY THE LATEST FEATURES
          </Text>
        </CardItem>
        <CardItem footer style={{borderRadius: 10, alignSelf: 'center'}}>
          <AppButtonContained
            text={'CLICK HERE TO UPDATE'}
            onClick={() => {
              let url =
                Platform.OS == 'ios'
                  ? 'itms-apps://itunes.apple.com/us/app/chefonline/id1007229418?ls=1&mt=8'
                  : 'market://details?id=com.chefonline.chefonline';
               Linking.openURL(url);

              
            }}
          />
        </CardItem>
      </Card>
    </Container>
  );
}

const styles = StyleSheet.create({});
