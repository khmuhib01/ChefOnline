import {
  CardItem,
  Container,
  Content,
  Card,
  Item,
  Input,
  Col,
  Grid,
  Textarea,
  Label,
  Icon,
  Spinner,
  Picker,
  ActionSheet,
} from 'native-base';
import DatePicker from 'react-native-datepicker';

import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { Snackbar,  Title, Text, Button } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Config from 'react-native-config';
import getData from '../api';
import AppButtonContained from '../common/app-button-contained';
import AppButtonClear from '../common/app-button-clear';

import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { Overlay } from 'react-native-elements';

export default function Reservation({ navigation, route }) {
    const { restaurantData } = route.params;
    let dispatch = useDispatch();

    const profile = useSelector((state) => state.profile);
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState(profile.userDetails.title);
    const [firstName, setFirstName] = useState(profile.userDetails.first_name);
    const [lastName, setLastName] = useState(profile.userDetails.last_name);
    const [email, setEmail] = useState(profile.userDetails.email);
    const [mobileNo, setMobileNo] = useState(profile.userDetails.mobile_no);
    const [telephone, setTelephone] = useState(profile.userDetails.telephone_no);
    const [dob, setDob] = useState(profile.userDetails.date_of_birth);
    const [addressOne, setAddressOne] = useState(profile.userDetails.address1);
    const [addressTwo, setAddressTwo] = useState(profile.userDetails.address2);
    const [city, setCity] = useState(profile.userDetails.town);
    const [country, setCountry] = useState(profile.userDetails.country);
    const [postcode, setPostcode] = useState(profile.userDetails.postcode);
    const [numberOfGuest, setnumberOfGuest] = useState(0);
    const [specialInstruction, setspecialInstruction] = useState('');
    const [selectedTime, setselectedTime] = useState();
    const [restaurantScheduleList, setRestaurantScheduleList] = useState([]);
    const [insideUk, setInsideUk] = useState(2);
    const [userIp, setUserIp] = useState('');

    //for snackbar
    const [visibleSnackBar, setVisibleSnackBar] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');

    //for reservation
    const [visibleDatePicker, setVisibleDatePicker] = useState(false);
    const [disabledDateList, setDisabledDateList] = useState({});
    const [selectedDate, setselectedDate] = useState('');
    const [selectedDay, setselectedDay] = useState('');
    const [newOpening, setnewOpening] = useState('');
    const [reservationDate, setreservationDate] = useState('');    

    useEffect(() => {
        let disabled = { disabled: true, disableTouchEvent: true };
        let obj = {};
        console.log('RestaurantData: ', restaurantData.reservation_disabled_dates);

        for (var a = 0; a < restaurantData.reservation_disabled_dates.length; a++) {
        obj[restaurantData.reservation_disabled_dates[a]] = disabled;
        }
        setDisabledDateList(obj);

        getUserIp();
    }, []);

    useEffect(() => {
        if (selectedDay != '') {
        getCurrentTime();
        }
    }, [selectedDay]);

    const getUserIp = async () => {
        await getData(Config.API_URL + 'funId=44')
        .then((response) => {
            if (response.data.status == '1') {
            if (response.data.details.country == 'UK') {
                setInsideUk(1);
                setUserIp(response.data.details.ip);
            } else {
                setInsideUk(2);
                setUserIp(response.data.details.ip);
            }
            }
        })
        .catch((error) => {
            console.warn(error.message);
        });
    };

    const getCurrentTime = async () => {
        await getData(Config.API_URL + 'funId=79')
        .then((response) => {
            let currentTime = response.data.data;
            getScheduleList(currentTime);
        })
        .catch((error) => {
            console.warn(error.message);
        });
    };

    const getScheduleList = (apiTime) => {
        let lists = [];
        let list = [];
        let availableShifts = [];
        let startTime = null;
        let endTime = null;
        let scheduleList = [];

        for (
        var a = 0;
        a < restaurantData.restuarent_schedule.schedule.length;
        a++
        ) {
        if (
            restaurantData.restuarent_schedule.schedule[a].day_name == selectedDay
        ) {
            lists = restaurantData.restuarent_schedule.schedule[a].list;
            break;
        }
        }
        console.log(lists);

        for (var a = 0; a < lists.length; a++) {
        if (lists[a].type == '4') {
            list = lists[a];

            //break;
            availableShifts.push(lists[a]);
        }
        }
        
        console.log(availableShifts);

        for (let list of availableShifts) {

        let opening_time = moment(list.opening_time, ['hh:mm a']);

        if (newOpening != '') {
            opening_time = moment(newOpening, ['hh:mm a']);
        }

        let closing_time = moment(list.closing_time, ['hh:mm a']);
        let currentTime = moment(apiTime.time, ['hh:mm a']);

        var todayDate = moment();
        var futureDate = moment(selectedDate, 'DD-MM-YYYY');

        if (!todayDate.isAfter(futureDate)) {
            // console.warn('Date is future');
            startTime = moment(opening_time);
            endTime = moment(closing_time);
            scheduleList.push(moment(startTime).format('hh:mm a'));
            while (startTime <= endTime) {
            startTime = moment(startTime).add(15, 'minutes');
            if (startTime <= endTime) {
                scheduleList.push(moment(startTime).format('hh:mm a'));
            }
            }
        } else {
            //console.warn('Date is not future');
            if (currentTime >= opening_time) {
            startTime = currentTime;
            } else {
            startTime = opening_time;
            }

            endTime = moment(closing_time);
            startTime = moment(startTime);

            scheduleList.push(moment(startTime).format('hh:mm a'));

            while (startTime <= endTime) {
            startTime = moment(startTime).add(15, 'minutes');
            if (startTime <= endTime) {
                scheduleList.push(moment(startTime).format('hh:mm a'));
            }
            }
        }

        }

        //console.log(scheduleList);
        setRestaurantScheduleList(scheduleList);
    };

    const setDataToLocalStorage = async (payload) => {
        const jsonValue = JSON.stringify(payload);
        dispatch({
        type: 'SET_LOGGED_IN_USER_INFO',
        payload: JSON.parse(jsonValue),
        });

        await AsyncStorage.setItem('@UserDetails', jsonValue);
    };

    const onPressBookATable = async () => {
        if (validateEmail()) {
        if (validateMobileNo()) {
            setLoading(true);
            await getData(
            Config.API_URL +
            'funId=75&rest_id=' +
            restaurantData.restaurant_id +
            '&title=' +
            title +
            '&first_name=' +
            firstName +
            '&last_name=' +
            lastName +
            '&email=' +
            email +
            '&mobile_no=' +
            mobileNo +
            '&telephone=' +
            telephone +
            '&reservation_date=' +
            reservationDate +
            '&reservation_time=' +
            selectedTime +
            '&guest=' +
            numberOfGuest +
            '&special_request=' +
            specialInstruction +
            '&platform=' +
            pltfrm +
            '&ip_address=' +
            userIp,
            )
            .then((response) => {
                setSnackBarMessage(response.data.msg);
                setVisibleSnackBar(true);
                setLoading(false);
                setselectedDate('');
                setselectedDay('');
                setselectedTime();
                setnumberOfGuest(0);
                setspecialInstruction('');
            })
            .catch((error) => {
                //console.warn(error.message);
                setLoading(false);
            });
        } else {
            setSnackBarMessage('Please Enter Valid Mobile No');
            setVisibleSnackBar(true);
        }
        } else {
        setSnackBarMessage('Please Enter Valid Email');
        setVisibleSnackBar(true);
        }

        let pltfrm = Platform.OS == 'ios' ? 1 : 2;

        // console.log(Config.API_URL + 'funId=75&rest_id='+restaurantData.restaurant_id+'&title='+title+'&first_name='+firstName+'&last_name='+lastName+'&email='+email+'&mobile_no='+mobileNo+'&telephone='+telephone+'&reservation_date='+reservationDate+'&reservation_time='+selectedTime+'&guest='+numberOfGuest+'&special_request='+specialInstruction+'&platform='+pltfrm+'&ip_address='+userIp);
    };

    const onSelectReservationDate = async (date) => {
        //  console.log(restaurantData.restaurant_id)
        setLoading(true);

        let localDate = moment(date.dateString).format('YYYY-MM-DD');
        await getData(
        Config.API_URL +
        'funId=123&rest_id=' +
        restaurantData.restaurant_id +
        '&date=' +
        localDate,
        )
        .then((response) => {
            console.log(response);
            if (response.data.status == 1) {
            setnewOpening(response.data.result.opening_time);
            setDateForReservation(date);
            } else {
            setnewOpening('');
            setDateForReservation(date);
            }

            setLoading(false);
            // let currentTime = response.data.data;
            // getScheduleList(currentTime);
        })
        .catch((error) => {
            setLoading(false);
            console.warn(error.message);
        });
    };

    const validateEmail = () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(email) === false) {
        return false;
        } else {
        return true;
        }
    };

    const validateMobileNo = () => {
        let reg = /^(07[\d]{8,12}|447[\d]{7,11})$/;
        if (reg.test(mobileNo) === false) {
        return false;
        } else {
        return true;
        }
    };

    const setDateForReservation = (date) => {
        setselectedDay(moment(date.dateString).format('dddd'));
        setselectedDate(moment(date.dateString).format('DD-MM-YYYY'));
        setreservationDate(moment(date.dateString).format('YYYY-MM-DD'));
    };

    let scheduleListItem = restaurantScheduleList.map((s, i) => {
        return <Picker.Item key={i} value={s} label={s} />;
    });

    return (
        <Container style={{ padding: 5 }}>
        {loading ? (
            <Spinner color="red" />
        ) : (
            <Content>
                <Overlay
                isVisible={visibleDatePicker}
                onBackdropPress={() => {
                    setVisibleDatePicker(false);
                }}>
                <Calendar
                    testID={'first_calendar'}
                    minDate={Date()}
                    current={Date()}
                    onDayPress={(date) => {
                    onSelectReservationDate(date);
                    setVisibleDatePicker(false);
                    // setselectedDay(moment(date.dateString).format('dddd'));
                    // setselectedDate(moment(date.dateString).format('DD-MM-YYYY'));
                    // setVisibleDatePicker(false);
                    }}
                    markedDates={disabledDateList}
                />
                </Overlay>

                <Grid>
                    <Col style={{ flex: 0.9 }}>
                        {/* <Item
                            regular
                            style={{
                                marginHorizontal: 2,
                                marginVertical: 2,
                            }}>
                        <Picker
                            placeholder="Title"
                            selectedValue={title}
                            mode="dropdown"
                            style={{ height: 30, width: 120 }} 
                            itemStyle={{height: 30}}
                            onValueChange={(itemValue, itemIndex) => {
                                setTitle(itemValue);
                            }}>
                            <Picker.Item label="Title" value="" />
                            <Picker.Item label="Mr" value="Mr" />
                            <Picker.Item label="Miss" value="Miss" />
                            <Picker.Item label="Mrs" value="Mrs" />
                            <Picker.Item label="Ms" value="Ms" />
                            <Picker.Item label="Dr" value="Dr" />
                        </Picker>
                        </Item> */}
                        <View style={{borderWidth: 1, borderColor: "#ccc", marginTop: 4, borderRadius: 10, height: 50}}>
                            <Picker
                                placeholder="Title"
                                selectedValue={title} 
                                style={{ height: 20, width: 120, padding: 0, margin: 0, lineHeight: 10, top: -2, position: "absolute" }}
                                onValueChange={(itemValue, itemIndex) => { setTitle(itemValue);}}>
                                <Picker.Item label="Title" value="" />
                                <Picker.Item label="Mr" value="Mr" />
                                <Picker.Item label="Miss" value="Miss" />
                                <Picker.Item label="Mrs" value="Mrs" />
                                <Picker.Item label="Ms" value="Ms" />
                                <Picker.Item label="Dr" value="Dr" />
                            </Picker>
                        </View>
                    </Col>
                    <Col style={{ flex: 1 }}>
                        <Item regular style={[ styles.InputItemWrap, {marginHorizontal: 2} ]}>
                        <TextInput
                            style={[styles.InputItem , {flex:1} ] }
                            placeholder="First Name*"
                            value={firstName}
                            onChangeText={(firstName) => setFirstName(firstName)}
                        />
                        </Item>
                    </Col>
                    <Col style={{ flex: 1 }}>
                        <Item regular style={[ styles.InputItemWrap, {marginHorizontal: 2} ]}>
                            <TextInput
                                style={[styles.InputItem , {flex:1} ] }
                                placeholder="Last Name*"
                                value={lastName}
                                onChangeText={(lastName) => setLastName(lastName)}
                            />
                        </Item>
                    </Col>
                </Grid>

                <Item regular style={[ styles.InputItemWrap]}>
                    <Icon
                        type="Entypo"
                        name="mail"
                        style={{ color: '#EC1A3A', fontSize: 18 }}
                    />
                    <TextInput
                        autoCapitalize="none"
                        style={[styles.InputItem , {flex:1} ] }
                        placeholder="Email*"
                        value={email}
                        onChangeText={(email) => setEmail(email)}
                    />
                </Item>

                <Item regular style={[ styles.InputItemWrap, {marginRight: 2}]}>
                <Icon
                    type="Entypo"
                    name="mobile"
                    style={{ color: '#EC1A3A', fontSize: 18 }}
                />
                <TextInput
                    style={[styles.InputItem , {flex:1} ] }
                    placeholder="Mobile No*"
                    value={mobileNo}
                    keyboardType="phone-pad"
                    onChangeText={(mobileNo) => setMobileNo(mobileNo)}
                />
                </Item>

                <Item regular style={[ styles.InputItemWrap, {marginRight: 2}]}>
                <Icon
                    type="Entypo"
                    name="phone"
                    style={{ color: '#EC1A3A', fontSize: 18 }}
                />
                <TextInput
                    style={[styles.InputItem , {flex:1} ] }
                    placeholder="Telephone No"
                    value={telephone}
                    keyboardType="phone-pad"
                    onChangeText={(telephone) => setTelephone(telephone)}
                />
                </Item>

                <Grid style={{marginVertical: 4}}>
                    <Col style={{ flex: 1,paddingHorizontal: 2 }}>
                        <Button contentStyle={{justifyContent:'flex-start', height: 50}}  color="#ed1a3b" icon="calendar" mode="outlined" onPress={() => {
                        setVisibleDatePicker(true);
                        }}>
                        {selectedDate == ''?"Select Date*": selectedDate}
                        </Button>

                    </Col>
                    <Col style={{ flex: 1 ,paddingHorizontal: 2 }}>

                        <Button contentStyle={{justifyContent:'flex-start', height: 50}} disabled={selectedDate == ''} color="#ed1a3b" icon="watch" mode="outlined" onPress={() => {
                            ActionSheet.show(
                            {
                                options: restaurantScheduleList,
                            },
                            (buttonIndex) => {
                                setselectedTime(restaurantScheduleList[buttonIndex]);
                            },
                            );
                        }}>
                        {selectedTime == undefined?"Select Time*": selectedTime}
                        </Button>

                    </Col>
                </Grid>

                <Item regular style={{ marginVertical: 4, borderRadius: 10 }}>
                <Icon
                    type="FontAwesome"
                    name="users"
                    style={{ color: '#EC1A3A', fontSize: 18 }}
                />
                <TextInput
                    style={[styles.InputItem , {flex:1} ] }
                    placeholder="Number of Guests*"
                    keyboardType="numeric"
                    value={numberOfGuest}
                    onChangeText={(numberOfGuest) => setnumberOfGuest(numberOfGuest)}
                />
                </Item>
                <Item regular style={{ marginVertical: 2, borderRadius: 10 }}>
                <TextInput
                    multiline={true}
                    
                    placeholder="Special Instruction..."
                    value={specialInstruction}
                    style={{ fontSize: 14, height: 60, color: "#222", paddingLeft: 10,flex:1}}
                    onChangeText={(specialInstruction) =>
                    setspecialInstruction(specialInstruction)
                    }
                />
                </Item>

                <AppButtonContained
                text={'BOOK A TABLE'}
                onClick={onPressBookATable}
                disabled={
                    firstName == '' ||
                    lastName == '' ||
                    email == '' ||
                    mobileNo == '' ||
                    selectedDate == '' ||
                    numberOfGuest == 0
                }
                />
            </Content>
            )}

            <Snackbar
                visible={visibleSnackBar}
                onDismiss={() => {
                setSnackBarMessage('');
                setVisibleSnackBar(false);
                }}
                duration={8000}
                action={{
                label: 'OK',
                onPress: () => {
                    setSnackBarMessage('');
                    setVisibleSnackBar(false);
                },
                }}>
                {snackBarMessage}
            </Snackbar>
        </Container>
    );
}

const styles = StyleSheet.create({
    InputItemWrap:{        
        marginVertical: 4,
        borderRadius: 10,
    },
    InputItem:{
        fontSize: 14, 
        color: "#222", 
        paddingHorizontal: 10
    }
});
