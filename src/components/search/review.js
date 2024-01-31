import {
  Card,
  CardItem,
  Container,
  Left,
  Right,
  Icon,
  Col,
  Label,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';

import Config from 'react-native-config';

import getData from '../api';
import {FlatList} from 'react-native-gesture-handler';
import AppButtonContained from '../common/app-button-contained';
import {Rating, AirbnbRating} from 'react-native-ratings';

export default function Review({navigation, route}) {
  const {restaurantId} = route.params;
  const [reviewList, setreviewList] = useState([]);
  const [isDataFound, setIsDataFound] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getReivewList();
  }, []);

  const getReivewList = async () => {
    setLoading(true);
    await getData(Config.API_URL + 'funId=102&rest_id=' + restaurantId)
      .then((response) => {
        if (response.data.status == 'Success') {
          setreviewList(response.data.data);
          setIsDataFound(true);
        } else {
          setIsDataFound(false);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setLoading(false);
        setIsDataFound(false);
      });
  };

  const renderReviews = ({item}) => {
    return (
      <>
        {item.status == '1' && (
          <Card style={styles.card}>
            <CardItem header bordered style={styles.cardItemHeader}>
              <Left>
                <Text>{item.name}</Text>
              </Left>
              <Right>
                <Text>{item.created_date}</Text>
              </Right>
            </CardItem>
            <CardItem style={styles.cardItem}>
              <Col>
                <Text style={{fontSize: 10,textAlign:'center'}}>QUALITY OF FOOD</Text>
                <Rating
                  type="custom"
                  ratingColor="#ed1a3b"       
                  ratingBackgroundColor='#fff'           
                  ratingCount={parseFloat(item.quality_of_food)}
                  style={{paddingVertical: 10}}
                  imageSize={15}
                  readonly={true}
                />
              </Col>
              <Col>
              <Text style={{fontSize: 10,textAlign:'center'}}>QUALITY OF SERVICE</Text>
                <Rating
                  type="custom"
                  ratingColor="#ed1a3b"
                  ratingBackgroundColor='#fff'
                  ratingCount={parseFloat(item.quality_of_service)}
                  style={{paddingVertical: 10}}
                  imageSize={15}
                  readonly={true}
                />
              </Col>
              <Col >
              <Text style={{fontSize: 10 ,textAlign:'center'}}>VALUE OF MONEY</Text>
              <Rating
                  type="custom"
                  ratingColor="#ed1a3b"
                  ratingBackgroundColor='#fff'
                  ratingCount={parseFloat(item.value_of_money)}
                  style={{paddingVertical: 10}}
                  imageSize={15}
                  readonly={true}
                />
              </Col>
            </CardItem>
            {item.review_comment !='' && (
            <CardItem style={styles.cardItem}>
              <Text>{item.review_comment}</Text>
            </CardItem>
            )}
          </Card>
        )}
      </>
    );
  };

  return (
    <Container style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#ed1a3b" />
      ) : (
        <>
          {!isDataFound ? (
            <View style={{paddingHorizontal: 5}}>
              <Icon
                type="MaterialIcons"
                name="error"
                style={{alignSelf: 'center', fontSize: 150, color: '#70757aad'}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: 20,
                  color: '#70757aad',
                  marginBottom: 5,
                }}>
                SORRY! NO REVIEW FOUND
              </Text>
              <AppButtonContained
                text={'GO BACK'}
                onClick={() => {
                  navigation.goBack();
                }}
              />
            </View>
          ) : (
            <SafeAreaView>
              <FlatList
                data={reviewList}
                renderItem={renderReviews}
                keyExtractor={(item) => item.id}
              />
            </SafeAreaView>
          )}
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  card: {
    borderRadius: 10,
    flex: 1,
  },
  cardItemHeader: {
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    paddingLeft: 8,
    paddingBottom: 8,
    paddingTop: 8,
  },
  cardItem: {
    borderRadius: 10,
    paddingLeft: 8,
  },
  text: {
    fontSize: 12,
  },
});
