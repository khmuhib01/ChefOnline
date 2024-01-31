import {
  CardItem,
  Container,
  Card,
  H1,
  Text,
  ListItem,
  Item,
  List,
  Col,
  Left,
  Spinner,
  Icon,
  Textarea,
  Input,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Dimensions, TextInput, ScrollView} from 'react-native';
import Config from 'react-native-config';
import {FlatList} from 'react-native-gesture-handler';
import getData from '../api';
import {Snackbar} from 'react-native-paper';
import {Rating, AirbnbRating} from 'react-native-ratings';
import AppButtonContained from '../common/app-button-contained';
import {useTheme} from 'react-native-paper';

export default function RatingAndReview({navigation, route}) {
  const {orderId} = route.params;
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState({});
  const [ratingFound, setRatingFound] = useState(false);
  const [replyFound, setreplyFound] = useState(false);
  const [replyList, setreplyList] = useState([]);
  const [reviewComment, setreviewComment] = useState('');
  const [qualityOfFood, setqualityOfFood] = useState('');
  const [qualityOfService, setqualityOfService] = useState('');
  const [valueOfMoney, setvalueOfMoney] = useState('');
  const [comment, setcomment] = useState('');
  const [visibleSnackbar, setVisibleSnackbar] = React.useState(false);
  const [snackbarMsg, setsnackbarMsg] = useState('');
  const [restaurantId, setrestaurantId] = useState('');

  useEffect(() => {
  
    getOrderDetail();
  }, []);

  const getOrderDetail = async () => {
    setLoading(true);
   
    await getData(Config.API_URL + 'funId=14&order_id=' + orderId)
      .then((response) => {
     
        setrestaurantId(response.data.order[0].rest_id);
        let review = response.data.order[0].Order_review[0];
        if (review.quality_of_food != undefined) {
          console.log(review)
          setApiResponse(review);
          setRatingFound(true);
          setreviewComment(review.review_comment);
          if (review.reply != '') {
            setreplyFound(true);
            setreplyList(review.reply);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.warn(error);
      });
  };

  const onPressSubmit = async () => {
    if (ratingFound) {
      console.log(
        Config.API_URL +
          'funId=104&&review_id=' +
          apiResponse.review_id +
          '&reply_by=2&reply_msg=' +
          comment,
      );
      setLoading(true);
      await getData(
        Config.API_URL +
          'funId=104&&review_id=' +
          apiResponse.review_id +
          '&reply_by=2&reply_msg=' +
          comment,
      )
        .then((response) => {
          if (response.data.status == 'Success') {
            setRatingFound(true);
            setsnackbarMsg(response.data.msg);
            setVisibleSnackbar(true);
            getOrderDetail();
          } else {
            setsnackbarMsg(response.data.msg);
            setVisibleSnackbar(true);
          }
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.warn(error);
        });
    } else {
      //console.warn('Call 105')

      console.log(
        Config.API_URL +
          'funId=105&restaurant_id=' +
          restaurantId +
          '&order_id=' +
          orderId +
          '&quality_of_food=' +
          qualityOfFood +
          '&quality_of_service=' +
          qualityOfService +
          '&value_of_money=' +
          valueOfMoney +
          '&review_comment=' +
          comment,
      );

      setLoading(true);
      await getData(
        Config.API_URL +
          'funId=105&restaurant_id=' +
          restaurantId +
          '&order_id=' +
          orderId +
          '&quality_of_food=' +
          qualityOfFood +
          '&quality_of_service=' +
          qualityOfService +
          '&value_of_money=' +
          valueOfMoney +
          '&review_comment=' +
          comment,
      )
        .then((response) => {
          if (response.data.status == 'Success') {
            setsnackbarMsg(response.data.msg);
            setVisibleSnackbar(true);
            getOrderDetail();
          } else {
            setsnackbarMsg(response.data.msg);
            setVisibleSnackbar(true);
          }
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.warn(error);
        });
    }
  };

  const renderReply = ({item}) => {
    return (
      <ListItem>
        <Text
          style={{
            fontSize: 12,
            textAlign: 'left',
            justifyContent: 'flex-start',
          }}>
          <Icon
            style={{
              color: '#ed1a3b',
              fontSize: 20,
              flex: 1,
            }}
            type="FontAwesome"
            name={item.reply_by == '2' ? 'user' : 'reply'}
          />
          {'  '}
          {item.reply_msg}
        </Text>
      </ListItem>
    );
  };

  const RenderReviewCommentAndReply = (props) => {
    if (reviewComment != '' || replyFound) {
      return (
        <Card style={{borderRadius: 5}}>
          {reviewComment != '' && (
            <CardItem style={{borderRadius: 5}} bordered>
              <Text>{reviewComment}</Text>
            </CardItem>
          )}

          {apiResponse.reply != '' && (
            <CardItem style={{borderRadius: 5, maxHeight: 280, paddingLeft: 0}}>
              <FlatList
                data={replyList}
                renderItem={renderReply}
                keyExtractor={(item) => item.id}
              />
            </CardItem>
          )}
        </Card>
      );
    } else {
      return null;
    }
  };

  return (
    <Container style={{paddingHorizontal: 5}}>
      {loading ? (
        <Spinner color="red" />
      ) : (
        <View>
          {ratingFound ? (
            <Card style={{borderRadius: 5}}>
              <CardItem style={{borderRadius: 5}}>
                <Col>
                  <Text style={{fontSize: 10, textAlign: 'center'}}>
                    QUALITY OF FOOD
                  </Text>
                  <Rating
                    type="custom"
                    ratingColor="#ed1a3b"
                    ratingBackgroundColor="#fff"
                    ratingCount={parseFloat(apiResponse.quality_of_food)}
                    startingValue={parseFloat(apiResponse.quality_of_food)}
                    style={{paddingVertical: 10}}
                    imageSize={15}
                    readonly={true}
                  />
                </Col>
                <Col>
                  <Text style={{fontSize: 10, textAlign: 'center'}}>
                    QUALITY OF SERVICE
                  </Text>
                  <Rating
                    type="custom"
                    ratingColor="#ed1a3b"
                    ratingBackgroundColor="#fff"
                    ratingCount={parseFloat(apiResponse.quality_of_service)}
                    startingValue={parseFloat(apiResponse.quality_of_service)}
                    style={{paddingVertical: 10}}
                    imageSize={15}
                    readonly={true}
                  />
                </Col>
                <Col>
                  <Text style={{fontSize: 10, textAlign: 'center'}}>
                    VALUE OF MONEY
                  </Text>
                  <Rating
                    type="custom"
                    ratingColor="#ed1a3b"
                    ratingBackgroundColor="#fff"
                    ratingCount={parseFloat(apiResponse.value_of_money)}
                    startingValue={parseFloat(apiResponse.value_of_money)}
                    style={{paddingVertical: 10}}
                    imageSize={15}
                    readonly={true}
                  />
                </Col>
              </CardItem>
            </Card>
          ) : (
            <Card style={{borderRadius: 5}}>
              <CardItem bordered style={{borderRadius: 5}}>
                <Text>Rate your order</Text>
              </CardItem>

              <CardItem style={{borderRadius: 5,paddingBottom: 2}}>
                <Col>
                  <Text style={{fontSize: 14, textAlign: 'center'}}>
                    QUALITY OF FOOD
                  </Text>
                  <Rating
                    type="custom"
                    ratingColor="#ed1a3b"
                    ratingBackgroundColor="#fff"
                    ratingCount={6}
                    startingValue={0}
                    style={{paddingVertical: 10}}
                    imageSize={20}
                    onFinishRating={(rating) => {
                      setqualityOfFood(rating);
                    }}
                  />
                </Col>

                <Col>
                  <Text style={{fontSize: 14, textAlign: 'center'}}>
                  QUALITY OF SERVICE
                  </Text>
                  <Rating
                    type="custom"
                    ratingColor="#ed1a3b"
                    ratingBackgroundColor="#fff"
                    ratingCount={6}
                    startingValue={0}
                    style={{paddingVertical: 10}}
                    imageSize={20}
                    onFinishRating={(rating) => {
                      setqualityOfService(rating);
                    }}
                  />
                </Col>
               
              </CardItem>

              <CardItem style={{borderRadius: 5,paddingTop:2}}>
                <Col>
                  <Text style={{fontSize: 14, textAlign: 'center'}}>
                  VALUE OF MONEY
                  </Text>
                  <Rating
                    type="custom"
                    ratingColor="#ed1a3b"
                    ratingBackgroundColor="#fff"
                    ratingCount={6}
                    startingValue={0}
                    style={{paddingVertical: 10}}
                    imageSize={20}
                    onFinishRating={(rating) => {
                      setvalueOfMoney(rating);
                    }}
                  />
                </Col>              
               
              </CardItem>



              {/* <CardItem style={{borderRadius: 5, paddingBottom: 2}}>
                <Col>
                  <Text style={{fontSize: 14, textAlign: 'center'}}>
                    QUALITY OF FOOD
                  </Text>
                  <AirbnbRating
                    reviews={0}
                    reviewSize={0}                    
                    count={6}
                    defaultRating={0}
                    size={16}
                    onFinishRating={(rating) => {
                      setqualityOfFood(rating);
                    }}
                  />
                </Col>
                <Col>
                  <Text style={{fontSize: 14, textAlign: 'center'}}>
                    QUALITY OF SERVICE
                  </Text>
                  <AirbnbRating
                    reviews={0}
                    reviewSize={0}   
                    count={6}
                    defaultRating={0}
                    size={16}
                    onFinishRating={(rating) => {
                      setqualityOfService(rating);
                    }}
                  />
                </Col>
              </CardItem>

              <CardItem style={{borderRadius: 5, paddingBottom: 5}}>
                <Col>
                  <Text style={{fontSize: 14, textAlign: 'center'}}>
                    VALUE OF MONEY
                  </Text>
                  <AirbnbRating
                    reviews={0}
                    reviewSize={0}   
                    
                    count={6}
                    defaultRating={0}
                    size={16}
                    
                    onFinishRating={(rating) => {
                      setvalueOfMoney(rating);
                    }}
                  />
                </Col>
              </CardItem>
           
            */}
            </Card>
          )}
         

          <Card style={{borderRadius: 5}}>
            <CardItem style={{borderRadius: 5}} bordered>
              <Text>Write Your Comment</Text>
            </CardItem>

            <CardItem style={{borderRadius: 5}}>
              <Input
                multiline={true}
                numberOfLines={4}                
                onChangeText={(text) => {
                  setcomment(text);
                }}
                style={{paddingHorizontal: 5,flex: 1, borderRadius: 5,height: 60,borderWidth: .25}}
                placeholder="Write From Here..."
              />
            </CardItem>

            <CardItem style={{borderRadius: 5, paddingTop: 0}}>
              <View style={{flex: 1}}>
                <AppButtonContained
                  text={'SUBMIT'}
                  onClick={onPressSubmit}
                  disabled={
                    ratingFound
                      ? comment == ''
                        ? true
                        : false
                      : qualityOfFood == '' ||
                        qualityOfService == '' ||
                        valueOfMoney == ''
                      ? true
                      : false
                  }
                />
              </View>
            </CardItem>
          </Card>
         

          <RenderReviewCommentAndReply />
        </View>
      )}
      <Snackbar
        visible={visibleSnackbar}
        duration={10000}
        onDismiss={() => {
          setVisibleSnackbar(false);
        }}
        action={{
          label: 'Okay',
          onPress: () => {
            setVisibleSnackbar(false);
          },
        }}>
        {snackbarMsg}
      </Snackbar>
    </Container>
  );
}
