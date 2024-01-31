import {Container, Card, Icon, Content, Spinner} from 'native-base';
import React, {useEffect, useState, useContext} from 'react';
import {StyleSheet,View} from 'react-native';
import {Text, Title} from 'react-native-paper';
import getData from '../api';
import Config from 'react-native-config';
import AutoHeightWebView from 'react-native-autoheight-webview';
import {Dimensions} from 'react-native';
import AppButtonContained from '../common/app-button-contained';

export default function SettingsDetail({navigation, route}) {
  const {settingsId, settingsName} = route.params;
  const [apiResponse, setapiResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDataFound, setIsDataFound] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: settingsName.toUpperCase(),
    });

    getSettingsDetail();
  }, []);

  const getSettingsDetail = async () => {
    setLoading(true);

    console.log('http://smartrestaurantsolutions.com/mobile-react-api/live/Trigger.php?funId=5&id=' +
    settingsId);

    // await getData(
    //   'http://smartrestaurantsolutions.com/mobile-react-api/test/Trigger.php?funId=5&id=' +
    //     settingsId,
    // )

    await getData(
      'http://smartrestaurantsolutions.com/mobile-react-api/live/Trigger.php?funId=5&id=' +
        settingsId,
    )

    
      .then((response) => {
        if (response.data.status == 'Success') {
          setapiResponse(response.data.result.content);
          setIsDataFound(true)
        }else{
          setIsDataFound(false);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.warn(error.message);
        setIsDataFound(false);
        setLoading(false);
      });
  };

  return (
    <Container style={{padding: 5}}>
      <Content>
        {loading ? (
          <Spinner color="red" />
        ) : (
          <>
            {!isDataFound ? (
              <View style={{paddingHorizontal: 5}}>
                <Icon
                  type="MaterialIcons"
                  name="error"
                  style={{
                    alignSelf: 'center',
                    fontSize: 150,
                    color: '#70757aad',
                  }}
                />
                <Text
                  style={{
                    alignSelf: 'center',
                    fontSize: 20,
                    color: '#70757aad',
                    marginBottom: 5,
                  }}>
                  SORRY! NO DATA FOUND
                </Text>
                <AppButtonContained
                  text={'GO BACK'}
                  onClick={() => {
                    navigation.popToTop();
                  }}
                />
              </View>
            ) : (
              <Content>
              <AutoHeightWebView
                style={{
                  width: Dimensions.get('window').width - 15,
                  height: Dimensions.get('window').height - 160,
                }}
                customStyle={` p {font-size: 14px;}`}
                onSizeUpdated={(size) => console.log(size.height)}
                files={[
                  {
                    href: 'cssfileaddress',
                    type: 'text/css',
                    rel: 'stylesheet',
                  },
                ]}
                source={{html: apiResponse != '' ? apiResponse : `<p></p>`}}
                scalesPageToFit={true}
                viewportContent={'width=device-width, user-scalable=no'}
              />
             </Content>
            )}
          </>
        )}
      </Content>
    </Container>
  );
}
