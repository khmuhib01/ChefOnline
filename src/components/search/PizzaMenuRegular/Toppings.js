import {Col, Grid, Left, ListItem, Icon, Text} from 'native-base';
import React from 'react';
import {TouchableWithoutFeedback} from 'react-native';
import {FlatList} from 'react-native';
import {Snackbar, Button} from 'react-native-paper';

const Toppings = ({
  toppings,
  associativeToppingsObj,
  onSelectToppings,
  onPressRemoveToppings,
}) => {
  return (
    <>
      <ListItem itemDivider>
        <Text>EXTRAS</Text>
      </ListItem>
      <FlatList
        data={toppings}
        renderItem={({item}) => (
          <ListItem>
            <Left>
              <Text>{item.name}</Text>
            </Left>
            <Grid>
              <Col style={{justifyContent: 'center'}}>
                <Text style={{alignSelf: 'flex-end', paddingRight: 10}}>
                  &pound;{parseFloat(item.price).toFixed(2) }
                </Text>
              </Col>
              <Col>
                {!associativeToppingsObj ? (
                  <Button
                    mode="outlined"
                    color="#ed1a3b"
                    style={{borderColor: '#ed1a3b'}}
                    onPress={() => onSelectToppings(item)}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#ed1a3b',
                      }}>
                      ADD
                    </Text>
                  </Button>
                ) : (
                  <>
                    {associativeToppingsObj[item.id] == undefined ? (
                      <Button
                        mode="outlined"
                        color="#ed1a3b"
                        style={{borderColor: '#ed1a3b'}}
                        onPress={() => onSelectToppings(item)}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#ed1a3b',
                          }}>
                          ADD
                        </Text>
                      </Button>
                    ) : (
                      <Grid>
                        <Col>
                          <TouchableWithoutFeedback
                            onPress={() => {
                              onPressRemoveToppings(item);
                            }}>
                            <Icon
                              style={{
                                color: '#ed1a3b',
                                textAlign: 'center',
                                borderColor: '#ed1a3b',
                                borderRadius: 2,
                                borderWidth: 0.5,
                                fontSize: 20,
                              }}
                              type="AntDesign"
                              name="minus"
                            />
                          </TouchableWithoutFeedback>
                        </Col>
                        <Col style={{alignSelf: 'center'}}>
                          <Text style={{textAlign: 'center'}}>
                            {associativeToppingsObj[item.id]}
                          </Text>
                        </Col>
                        <Col>
                          <TouchableWithoutFeedback
                            onPress={() => {
                              onSelectToppings(item);
                            }}>
                            <Icon
                              style={{
                                color: '#ed1a3b',
                                textAlign: 'center',
                                borderColor: '#ed1a3b',
                                borderRadius: 2,
                                borderWidth: 0.5,
                                fontSize: 17,
                              }}
                              type="Ionicons"
                              name="add-sharp"
                            />
                          </TouchableWithoutFeedback>
                        </Col>
                      </Grid>
                    )}
                  </>
                )}
              </Col>
            </Grid>
          </ListItem>
        )}
        keyExtractor={(item) => {
          return 'toppings_' + item.id;
        }}
      />
    </>
  );
};

export default Toppings;
