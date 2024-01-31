import {
  CardItem,
  Container,
  Card,
  H3,
  Text,
  ListItem,
  Item,
  List,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

export default function Info({navigation, route}) {
  const {restaurantData} = route.params;
  const [initialRegion, setInitialRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [region, setRegion] = useState({});

  const [marker, setMarker] = useState({
    longitude: parseFloat(restaurantData.longitude),
    latitude: parseFloat(restaurantData.latitude),
  });

  const [openningHours, setOpenningHours] = useState([]);

  useEffect(() => {
    setRegion({
      latitude: parseFloat(restaurantData.latitude),
      longitude: parseFloat(restaurantData.longitude),
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    setOpenningHours(restaurantData.restuarent_schedule.schedule);
  }, []);

  return (
    <Container>
      <View style={{flex: 3, padding: 5}}>
        <Card style={{borderRadius: 10}}>
          <CardItem style={{borderRadius: 10}} bordered>
            <H3 style={{fontSize:16}}>ADDRESS</H3>
          </CardItem>
          <CardItem style={{borderRadius: 10}}>
            <Text style={{fontSize:12}}>
              {restaurantData.address != undefined
                ? restaurantData.address
                : ''}
            </Text>
          </CardItem>
        </Card>

        <Card style={{borderRadius: 10}}>
          <CardItem style={{borderRadius: 10}} bordered>
            <H3 style={{fontSize:16}}>OPENING HOURS</H3>
          </CardItem>
          <CardItem
            style={{borderRadius: 10, paddingBottom: 5, maxHeight: 360}}>
            <FlatList
              data={openningHours}
              renderItem={({item}) => (
                <>
                  <ListItem style={{paddingLeft: 0, marginLeft: 0,borderBottomWidth: .5,borderBottomColor:'#ededed'}}>
                    <Text style={{fontSize:14}}>{item.day_name}</Text>
                  </ListItem>

                  {item.list.length > 0 ? (
                    <FlatList
                      data={item.list}
                      renderItem={({item}) => (
                        <>
                          {item.type == '3' && (
                            <ListItem
                              style={{flex: 1, paddingLeft: 0, marginLeft: 0}}>
                              <Text style={{fontSize:12}}>
                                {item.opening_time} - {item.closing_time}
                              </Text>
                            </ListItem>
                          )}
                        </>
                      )}
                      keyExtractor={(item, index) => {
                        return 'shift:' + item.shift + ' ' + index;
                      }}
                    />
                  ) : (
                    <ListItem style={{flex: 1, paddingLeft: 0, marginLeft: 0}}>
                      <Text>CLOSED</Text>
                    </ListItem>
                  )}
                </>
              )}
              keyExtractor={(item) => item.weekday_id.toString()}
            />
          </CardItem>
        </Card>
      </View>
    </Container>
  );
}
