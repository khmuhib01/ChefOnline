/*This is an Example to Align a View at the Bottom of Screen in React Native */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  View,
  FlatList,
} from 'react-native';
import {
  Container,
  Header,
  Content,
  Card,
  CardItem,
  Body,
  Text,
  Title,
  Icon,
  Left,
  Right,
  H3,
  Item,
  Grid,
  Col,
  Row,
  Thumbnail,
  H2,
  Spinner,
} from 'native-base';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import moment from 'moment';
import getData from '../api';
import Config from 'react-native-config';

export default function Settings({navigation}) {
  const [apiResponse, setapiResponse] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSettingsData();
  }, []);

  const getSettingsData = async () => {
    setLoading(true);
    // await getData(
    //   'http://smartrestaurantsolutions.com/mobile-react-api/test/Trigger.php?funId=4',
    // )

    await getData(
      'http://smartrestaurantsolutions.com/mobile-react-api/live/Trigger.php?funId=4',
    )


   
      .then((response) => {
        if (response.data.status == 'Success') {
          setapiResponse(response.data.result);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.warn(error.message);
        setLoading(false);
      });
  };

  const renderSettings = ({item}) => {
    return (
      <TouchableWithoutFeedback
      style={{  paddingHorizontal:2}}
        onPress={() => navigation.navigate('SettingsDetail',{settingsId: item.id,settingsName:item.title})}>
        <Card style={styles.card}>
          <CardItem bordered style={styles.cardItemHeader}>
            <Thumbnail
              style={styles.thumbnail}
              square
              source={{uri: item.icon}}
            />
          </CardItem>
          <CardItem style={styles.cardItem}>
            <H2 style={styles.h2}>{item.title.toUpperCase()}</H2>
          </CardItem>
        </Card>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <Container style={{justifyContent: 'center', flex: 1,padding: 5}}>
      {loading?<Spinner color='red'/> : (
        <FlatList
          data={apiResponse}
          numColumns={2}
          renderItem={renderSettings}
          keyExtractor={(item) => item.id}
        />
        )}

      <View style={styles.bottomView}>
      <Text style={styles.buttonText}>
          <Icon style={styles.buttonText} type="AntDesign" name="copyright" />
          &nbsp; ChefOnline {moment().year()}. All rights reserved.
        </Text> 
        <Text style={styles.buttonText}>Version {Config.APP_VERSION}</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {},
  bottomView: {
    width: '100%',
    height: 50,
    // backgroundColor: '#EE5407',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
  },
  textStyle: {
    color: '#fff',
    fontSize: 18,
  },

  header: {
    backgroundColor: '#da092a',
  },
  content: {
    padding: 5,
  },
  card: {
    borderRadius: 10,
    width: Dimensions.get('window').width *.47,
  
    // flex: 1,
  },
  cardItemHeader: {
    borderRadius: 10,
    justifyContent: 'center',
  },
  cardItem: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  icon: {
    fontSize: 50,
    color: '#da092a',
  },
  icon: {
    fontSize: 250,
  },
  text: {
    fontSize: 14,
  },
  grid: {
    paddingVertical: 5,
  },
  button: {
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 12,
  },
  h2: {
    fontSize: 13,
    paddingTop: 10,
  },
});
