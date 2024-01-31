/*import {
  CardItem,
  Container,
  Card,
  Icon,
  H3,
  ListItem,
  Item,
  List,
  Row,
  Grid,
  Col,
} from 'native-base';
import React, {useState, useEffect } from 'react';
import {StyleSheet, View, ActivityIndicator, Modal, TextInput} from 'react-native';
import { Text, Title} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import AppButtonContained from '../common/app-button-contained';

import getData from '../api'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from 'react-native-elements';
import Config from 'react-native-config';

export default function Profile({navigation}) {
    const dispatch = useDispatch();
    const profile = useSelector((state) => state.profile);

    const [showOverlay, setShowOverlay] = useState(false);
    const [showDeleteSuccessful, setShowDeleteSuccessful] = useState(false);
    const [errorOverlay, setErrorOverlay] = useState(false);
    const [ipAddress, setIpAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userStatus, setUserStatus] = useState(false); // true = delete request found, false = no delete request yet
    const [status, setStatus] = useState('0'); // 0 = delete request pending, 1 = user deleted from DB
    const [ConfirmDelete, setConfirmDelete] = useState(''); 

    useEffect(() => {     
        setIpAddress('64.233. 161.147');        
    }, []);

    useEffect(() => {
        checkDeleteRequest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userStatus, status]);

    const checkDeleteRequest = async () => {        

        //console.log('check Status' + Config.API_URL + 'funId=147&user_id=' + profile.userDetails.userid);

        await getData(Config.API_URL + 'funId=147&user_id=' + profile.userDetails.userid)
        .then((response) => {            
            console.log(response.data); 
            setUserStatus(response.data.user_status);
            setStatus(response.data.status);  
            if(response.data.status === '1'){
                dispatch({
                    type: 'SIGN_OUT',
                });
            }           
        })
        .catch((error) => {            
            console.log(error);
        }); 
    };

    const onPressDeleteProfile = () => {  
        setShowOverlay(true);
    } 

    const closeOverlay = () => {
        setShowOverlay(false);
        setConfirmDelete('');
    };

    const onPressDeleteProfileOverlay = async() => {
        console.log('Delete Profile Req...');

        setLoading(true);

        console.log(Config.API_URL + 'funId=146&user_id=' + profile.userDetails.userid + '&ip_address='+ipAddress);

        await getData(Config.API_URL + 'funId=146&user_id=' + profile.userDetails.userid + '&ip_address='+ipAddress)
        .then((response) => {
            console.log(response.data); 
            // setUserStatus(response.data.user_status);
            // setStatus(response.data.status);   
            alert(response.data.msg); 
            setLoading(false);
            setUserStatus(true);
            setStatus('0');
            closeOverlay();
            //setShowDeleteSuccessful(response.data.msg);
        })
        .catch((error) => {            
            console.log(error);
            setLoading(false);
        });
    }

    return (
        <Container style={{padding: 10}}>
            <Icon
                type="Ionicons"
                name="person-outline"
                style={{fontSize: 140, textAlign: 'center'}}
            />

            <Title style={{textAlign: 'center', fontSize: 17}}>
                {profile.userDetails.title
                ? profile.userDetails.title.toUpperCase().trim()
                : ''}{' '}
                {profile.userDetails.first_name
                ? profile.userDetails.first_name.toUpperCase().trim()
                : ''}{' '}
                {profile.userDetails.last_name
                ? profile.userDetails.last_name.toUpperCase().trim()
                : ''}                
            </Title>

            {profile.userDetails.email != undefined && (
                <Text style={{textAlign: 'center'}}>
                {profile.userDetails.email ? profile.userDetails.email.trim() : ''}
                </Text>
            )}

            {profile.userDetails.mobile_no != undefined && (
                <Text style={{textAlign: 'center'}}>
                {profile.userDetails.mobile_no
                    ? profile.userDetails.mobile_no.trim()
                    : ''}
                </Text>
            )}

            {profile.userDetails.postcode != undefined && (
                <Text style={{textAlign: 'center'}}>
                {profile.userDetails.postcode
                    ? profile.userDetails.postcode.trim()
                    : ''}
                </Text>
            )}

            <Card transparent>
                <CardItem style={{paddingLeft: 0, paddingRight: 0}}>
                    <Col style={{marginRight: 15}}>
                        <AppButtonContained
                        text={'EDIT PROFILE'}
                        onClick={() => {
                            navigation.navigate('EditProfile');
                        }}
                        />
                    </Col>
                    <Col>
                        <AppButtonContained
                        text={'RESET PASSWORD'}
                        onClick={() => {
                            navigation.navigate('ResetPassword');
                        }}
                        />
                    </Col>
                </CardItem>
                <CardItem style={{paddingLeft: 0, paddingRight: 0, marginBottom: 10}}>
                    <Col style={{marginRight: 15}}>
                        <AppButtonContained
                        text={'ORDER HISTORY'}
                        onClick={() => {
                            navigation.navigate('OrderHistory');
                        }}
                        />
                    </Col>
                    <Col>
                        <AppButtonContained
                            text={'SIGN OUT'}
                            onClick={() => {
                                dispatch({
                                    type: 'SIGN_OUT',
                                });
                            }}
                        />
                    </Col>
                </CardItem>

                <Button
                    disabled={userStatus && status === '0'}
                    title="Delete Profile"
                    buttonStyle={{ backgroundColor: '#ccc', borderRadius: 5, }}                                    
                    titleStyle={{ color: '#000', fontSize: 15, textTransform: "uppercase"}}
                    onPress={()=>onPressDeleteProfile()}
                />

                {userStatus && status === '0' && (
                    <View style={styles.profileDeletionContainer}> 
                        <Text style={styles.profileDeletionText}>
                            Your profile deletion is under review!
                        </Text> 
                    </View>
                )} 
                 
            </Card> 

            <Modal
                animationType="slide"
                transparent={true}
                visible={showOverlay}
                onRequestClose={() => {
                    //Alert.alert("Modal has been closed.");
                    setShowOverlay(!showOverlay);
                }}
            >
                <View style = {styles.modal}>  
                   
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <View style={styles.header}>
                            <Ionicons name="warning" size={25} color="#f0a901" />
                        </View>                         
                        <Text style={styles.confirmationTitle}>
                            Delete My Account
                        </Text>
                    </View>

                    <Text style={styles.confirmationText}>
                        Enter DELETE to confirm the deletion of your account.
                    </Text>

                    <TextInput 
                        placeholder="DELETE"
                        value={ConfirmDelete}
                        onChangeText={(ConfirmDelete) => {
                            setConfirmDelete(ConfirmDelete)
                        }}
                        style={{
                            height: 45, 
                            borderColor: '#ccc', 
                            color: "#000",
                            paddingHorizontal: 15,
                            borderWidth: 1,
                            borderRadius: 8,
                            marginBottom: 10,
                            width: '100%'
                        }}
                    /> 

                    {loading && (
                        <ActivityIndicator
                            size="large"
                            color="#ed1a3b"
                            style={styles.loadingIndicator}
                        />
                    )}
                    
                    {showDeleteSuccessful && (
                        <Text style={{color: "green", fontSize: 16, marginBottom: 10}}>{showDeleteSuccessful}</Text>)
                    }

                    {!loading && (
                        <CardItem style={{paddingLeft: 0, paddingRight: 0, marginBottom: 10}}>
                            <Col style={{marginRight: 15}}>                                
                                <Button
                                    title="Cancel"
                                    buttonStyle={{ backgroundColor: '#f0f3f4', borderRadius: 5, }}                                    
                                    titleStyle={{ color: '#171717', fontSize: 15, textTransform: "uppercase"}}
                                    onPress={closeOverlay}
                                />
                            </Col>
                            <Col>                                
                                <Button
                                    disabled={ConfirmDelete !== 'DELETE'}
                                    title="DELETE"
                                    buttonStyle={{ 
                                        backgroundColor: '#ed1a3b', 
                                        borderRadius: 5, 
                                    }}                                    
                                    titleStyle={{ 
                                        color: '#fff', 
                                        fontSize: 15, 
                                        textTransform: "uppercase"
                                    }}
                                    disabledStyle={{ 
                                        backgroundColor: '#e0e0e0', 
                                        borderRadius: 5, 
                                    }}                                    
                                    disabledTitleStyle={{ 
                                        color: '#b5b5b5'
                                    }}
                                    onPress={ () => onPressDeleteProfileOverlay() }
                                />
                            </Col>
                        </CardItem>
                    )}
                </View>
            </Modal>
        </Container>
    );
}

const styles = StyleSheet.create({
    modal: {  
        flex: 1,
        justifyContent: 'center',           
        backgroundColor : "#fff",    
        borderRadius:10,  
        borderWidth: 1,  
        borderColor: '#fff',  
        paddingHorizontal: 35
    },
    header:{
        marginRight: 5
    },
    confirmationTitle:{
        color: '#3f2949',  
        fontSize: 22,
        textAlign: "left", 
    },
    confirmationText: {  
        color: '#3f2949',  
        fontSize: 16,
        lineHeight: 26,
        textAlign: "left",
        marginVertical: 15  
    }, 
    profileDeletionContainer: {
        flexDirection: 'row',      
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: '#f8d7da', 
        borderRadius: 3,
        paddingVertical: 15,
        marginTop: 15
    }, 
    profileDeletionText: {
        color: '#721c24', 
        fontSize: 15,         
        fontWeight: 'bold'
    },
})*/

import {
    CardItem,
    Container,
    Card,
    Icon,
    H3,
    ListItem,
    Item,
    List,
    Row,
    Grid,
    Col,
  } from 'native-base';
  import React, {useState, useEffect} from 'react';
  import {
    StyleSheet,
    View,
    ActivityIndicator,
    Modal,
    RefreshControl,
    TextInput,
    ScrollView,
  } from 'react-native';
  import {Text, Title} from 'react-native-paper';
  import {useSelector, useDispatch} from 'react-redux';
  import AppButtonContained from '../common/app-button-contained';
  
  import getData from '../api';
  import Ionicons from 'react-native-vector-icons/Ionicons';
  import {Button} from 'react-native-elements';
  import Config from 'react-native-config';
  
  export default function Profile({navigation}) {
    const dispatch = useDispatch();
    const profile = useSelector(state => state.profile);
  
    const [refreshing, setRefreshing] = React.useState(false);
  
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      console.log('Refresh ... call function');
      checkDeleteRequest();
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }, []);
  
    const [showOverlay, setShowOverlay] = useState(false);
    const [showDeleteSuccessful, setShowDeleteSuccessful] = useState(false);
    const [errorOverlay, setErrorOverlay] = useState(false);
    const [ipAddress, setIpAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userStatus, setUserStatus] = useState(false); // true = delete request found, false = no delete request yet
    const [status, setStatus] = useState('0'); // 0 = delete request pending, 1 = user deleted from DB
    const [Mess, setMess] = useState(''); 
    const [ConfirmDelete, setConfirmDelete] = useState('');
  
    useEffect(() => {
      setIpAddress('64.233.161.147');
    }, []);
  
    useEffect(() => {
      checkDeleteRequest();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userStatus, status]);
  
    const checkDeleteRequest = async () => {
      //console.log('check Status' + Config.API_URL + 'funId=147&user_id=' + profile.userDetails.userid);
  
      await getData(
        Config.API_URL + 'funId=147&user_id=' + profile.userDetails.userid,
      )
        .then(response => {
          console.log(response.data);
          setUserStatus(response.data.user_status);
          setStatus(response.data.status);
          setMess(response.data.mess);
          if (response.data.status === '1') {
            dispatch({
              type: 'SIGN_OUT',
            });
          }
        })
        .catch(error => {
          console.log(error);
        });
    };
  
    const onPressDeleteProfile = () => {
      setShowOverlay(true);
    };
  
    const closeOverlay = () => {
      setShowOverlay(false);
      setConfirmDelete('');
    };
  
    const onPressDeleteProfileOverlay = async () => {
      console.log('Delete Profile Req...');
  
      setLoading(true);
  
      console.log(
        Config.API_URL +
          'funId=146&user_id=' +
          profile.userDetails.userid +
          '&ip_address=' +
          ipAddress,
      );
  
      await getData(
        Config.API_URL +
          'funId=146&user_id=' +
          profile.userDetails.userid +
          '&ip_address=' +
          ipAddress,
      )
        .then(response => {
          console.log(response.data);
          // setUserStatus(response.data.user_status);
          // setStatus(response.data.status);
          alert(response.data.msg);
          setLoading(false);
          setUserStatus(true);
          setStatus('0');
          setMess(response.data.msg);
          closeOverlay();
          //setShowDeleteSuccessful(response.data.msg);
        })
        .catch(error => {
          console.log(error);
          setLoading(false);
        });
    };
  
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Container style={{padding: 10}}>
          <Icon
            type="Ionicons"
            name="person-outline"
            style={{fontSize: 140, textAlign: 'center'}}
          />
  
          <Title style={{textAlign: 'center', fontSize: 17}}>
            {profile.userDetails.title
              ? profile.userDetails.title.toUpperCase().trim()
              : ''}{' '}
            {profile.userDetails.first_name
              ? profile.userDetails.first_name.toUpperCase().trim()
              : ''}{' '}
            {profile.userDetails.last_name
              ? profile.userDetails.last_name.toUpperCase().trim()
              : ''}
          </Title>
  
          {profile.userDetails.email != undefined && (
            <Text style={{textAlign: 'center'}}>
              {profile.userDetails.email ? profile.userDetails.email.trim() : ''}
            </Text>
          )}
  
          {profile.userDetails.mobile_no != undefined && (
            <Text style={{textAlign: 'center'}}>
              {profile.userDetails.mobile_no
                ? profile.userDetails.mobile_no.trim()
                : ''}
            </Text>
          )}
  
          {profile.userDetails.postcode != undefined && (
            <Text style={{textAlign: 'center'}}>
              {profile.userDetails.postcode
                ? profile.userDetails.postcode.trim()
                : ''}
            </Text>
          )}
  
          <Card transparent>
            <CardItem style={{paddingLeft: 0, paddingRight: 0}}>
              <Col style={{marginRight: 15}}>
                <AppButtonContained
                  text={'EDIT PROFILE'}
                  onClick={() => {
                    navigation.navigate('EditProfile');
                  }}
                />
              </Col>
              <Col>
                <AppButtonContained
                  text={'RESET PASSWORD'}
                  onClick={() => {
                    navigation.navigate('ResetPassword');
                  }}
                />
              </Col>
            </CardItem>
            <CardItem style={{paddingLeft: 0, paddingRight: 0, marginBottom: 10}}>
              <Col style={{marginRight: 15}}>
                <AppButtonContained
                  text={'ORDER HISTORY'}
                  onClick={() => {
                    navigation.navigate('OrderHistory');
                  }}
                />
              </Col>
              <Col>
                <AppButtonContained
                  text={'SIGN OUT'}
                  onClick={() => {
                    dispatch({
                      type: 'SIGN_OUT',
                    });
                  }}
                />
              </Col>
            </CardItem>
  
            <Button
              disabled={userStatus && status === '0'}
              title="Delete Profile"
              buttonStyle={{backgroundColor: '#ccc', borderRadius: 5}}
              titleStyle={{
                color: '#000',
                fontSize: 15,
                textTransform: 'uppercase',
              }}
              onPress={() => onPressDeleteProfile()}
            />
  
            {userStatus && status === '0' && (
              <View style={styles.profileDeletionContainer}>
                <Text style={styles.profileDeletionText}>
                  {Mess}
                </Text>
              </View>
            )}
          </Card>
  
          {/* Profile delete confirmation box */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showOverlay}
            onRequestClose={() => {
              //Alert.alert("Modal has been closed.");
              setShowOverlay(!showOverlay);
            }}>
            <View style={styles.modal}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.header}>
                  <Ionicons name="warning" size={25} color="#f0a901" />
                </View>
                <Text style={styles.confirmationTitle}>Delete My Account</Text>
              </View>
  
              <Text style={styles.confirmationText}>
                Enter DELETE to confirm the deletion of your account.
              </Text>
  
              <TextInput
                placeholder="DELETE"
                value={ConfirmDelete}
                onChangeText={ConfirmDelete => {
                  setConfirmDelete(ConfirmDelete);
                }}
                style={{
                  height: 45,
                  borderColor: '#ccc',
                  color: "#000",
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginBottom: 10,
                  width: '100%',
                }}
              />
  
              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#ed1a3b"
                  style={styles.loadingIndicator}
                />
              )}
  
              {showDeleteSuccessful && (
                <Text style={{color: 'green', fontSize: 16, marginBottom: 10}}>
                  {showDeleteSuccessful}
                </Text>
              )}
  
              {!loading && (
                <CardItem
                  style={{paddingLeft: 0, paddingRight: 0, marginBottom: 10}}>
                  <Col style={{marginRight: 15}}>
                    <Button
                      title="Cancel"
                      buttonStyle={{backgroundColor: '#f0f3f4', borderRadius: 5}}
                      titleStyle={{
                        color: '#171717',
                        fontSize: 15,
                        textTransform: 'uppercase',
                      }}
                      onPress={closeOverlay}
                    />
                  </Col>
                  <Col>
                    <Button
                      disabled={ConfirmDelete !== 'DELETE'}
                      title="DELETE"
                      buttonStyle={{
                        backgroundColor: '#ed1a3b',
                        borderRadius: 5,
                      }}
                      titleStyle={{
                        color: '#fff',
                        fontSize: 15,
                        textTransform: 'uppercase',
                      }}
                      disabledStyle={{
                        backgroundColor: '#e0e0e0',
                        borderRadius: 5,
                      }}
                      disabledTitleStyle={{
                        color: '#b5b5b5',
                      }}
                      onPress={() => onPressDeleteProfileOverlay()}
                    />
                  </Col>
                </CardItem>
              )}
            </View>
          </Modal>
        </Container>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#fff',
      paddingHorizontal: 35,
    },
    header: {
      marginRight: 5,
    },
    confirmationTitle: {
      color: '#3f2949',
      fontSize: 22,
      textAlign: 'left',
    },
    confirmationText: {
      color: '#3f2949',
      fontSize: 16,
      lineHeight: 26,
      textAlign: 'left',
      marginVertical: 15,
    },
    profileDeletionContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      backgroundColor: '#f8d7da',
      borderRadius: 3,
      paddingVertical: 15,
      marginTop: 15,
    },
    profileDeletionText: {
      color: '#721c24',
      fontSize: 15,
      paddingHorizontal: 2,
      lineHeight: 25,
      fontWeight: 'bold',
    },
  });
  