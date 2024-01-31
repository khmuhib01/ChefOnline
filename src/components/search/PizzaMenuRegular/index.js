import {
    Header,
    Container,
    Icon,
    Subtitle,
    Text,
    ListItem,
    Title,
    List,
    Left,
    Right,
    Grid,
    Col,
    Body,
    CheckBox,
    Fab,
    Separator,
    Content,
} from 'native-base';
import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import CartContext from '../../../context/cart-context';

// import AppButtonContained from '../common/app-button-contained';
import LayerItem from './LayerItem';
import NextLayers from './NextLayers';
import FirstLayer from './FirstLayer';
import Toppings from './Toppings';

export default function PizzaMenuRegular({ navigation, route }) {
    const { param } = route.params;
    //for context
    const { cart, setCart } = useContext(CartContext);

    const [layerKeysArray, setlayerKeysArray] = useState(
        Object.keys(param.pizza_layer_items.layers),
    );
    const [layers, setlayers] = useState(param.pizza_layer_items.layers);
    const [toppings, settoppings] = useState(param.pizza_layer_items.topings);

    const [pizzaTotal, setpizzaTotal] = useState(0);
    const [myPizza, setmyPizza] = useState({});
    const [myToppings, setmyToppings] = useState([])
    const [numberOfChooseObject, setnumberOfChooseObject] = useState({});
    const [numberOfLayers, setnumberOfLayers] = useState({})
    const [isFirstLayerSelected, setisFirstLayerSelected] = useState(false);

    const [showAddPizzaSnackbar, setshowAddPizzaSnackbar] = useState(false);
    const [associativeToppingsObj, setassociativeToppingsObj] = useState({})


    useEffect(() => {
        console.log(cart);
        let obj = {};
        let obj2 = {};
        let obj3 = {}
        for (var a = 0; a < layerKeysArray.length; a++) {
            obj[layerKeysArray[a]] = [];
            obj2[layerKeysArray[a]] = {
                number_of_choose: layers[layerKeysArray[a]].number_of_choose,
                number_of_selected: 0,
                selected_items_material_id: [],
            };
        }
        setmyPizza(obj);
        setnumberOfChooseObject(obj2);


        let topLayerItems = layers[layerKeysArray[0]].items;

        Object.keys(topLayerItems).map(function (topKey) {
            obj3[topKey] = [];

            let array = [];
            for (var a = 1; a < layerKeysArray.length; a++) {

                if (layers[layerKeysArray[a]].items.length == undefined) {
                    //this is an object       
                    Object.keys(layers[layerKeysArray[a]].items).map(function (key) {
                        if (topKey == key) {
                            array.push(layerKeysArray[a]);
                        }
                    })

                } else {
                    //this is an array        

                    for (var b = 0; b < layers[layerKeysArray[a]].items.length; b++) {
                        if (layers[layerKeysArray[a]].items[b].material_parent_id == "0") {
                            array.push(layers[layerKeysArray[a]].layer_id);
                            break;
                        }
                    }
                }
            }

            obj3[topKey] = array;
        })

        setnumberOfLayers(obj3)

    }, []);

    useEffect(() => {
        checkAllLayersRequirments();
    }, [numberOfChooseObject]);

    const onSelectFirstLayer = (item, layer_id) => {

        setisFirstLayerSelected(true);
        setnumberOfChooseObject({})
        setshowAddPizzaSnackbar(false);


        let obj = {};
        let obj2 = {};
        for (var a = 0; a < layerKeysArray.length; a++) {
            let skipThisLayer = false;
            if (a != 0) {
                skipThisLayer = !numberOfLayers[item.material_id].includes(layerKeysArray[a]);
            }
            obj[layerKeysArray[a]] = [];
            if (layerKeysArray[a] == layer_id) {
                obj[layerKeysArray[a]].push(item);
                let array = [];
                array.push(item.material_id);

                if (skipThisLayer) {
                    obj2[layerKeysArray[a]] = {
                        number_of_choose: 'NA',
                        number_of_selected: 'NA',
                        selected_items_material_id: [],
                    };

                } else {
                    obj2[layerKeysArray[a]] = {
                        "number_of_choose": layers[layerKeysArray[a]].number_of_choose,
                        "number_of_selected": 1,
                        "selected_items_material_id": array,
                    };

                }
            } else {
                if (skipThisLayer) {
                    obj2[layerKeysArray[a]] = {
                        number_of_choose: 'NA',
                        number_of_selected: 'NA',
                        selected_items_material_id: [],
                    };

                } else {
                    obj2[layerKeysArray[a]] = {
                        "number_of_choose": layers[layerKeysArray[a]].number_of_choose,
                        "number_of_selected": 0,
                        "selected_items_material_id": [],
                    };
                }

            }



        }
        setpizzaTotal(parseFloat( item.material_price))
        setmyPizza(obj);
        setnumberOfChooseObject(obj2);
        setmyToppings([]);
        setassociativeToppingsObj({});
    };

    const onSelectLayer = (item, layer_id) => {
        let isAlreadyAdded = false;
        let tempTotal = pizzaTotal;
        let obj = myPizza;
        let obj2 = numberOfChooseObject;

        for (var a = 0; a < obj2[layer_id].selected_items_material_id.length; a++) {
            if (item.material_id == obj2[layer_id]["selected_items_material_id"][a]) {
                obj2[layer_id]["number_of_selected"] = obj2[layer_id]["number_of_selected"] - 1;
                obj2[layer_id]["selected_items_material_id"].splice(a, 1);
                obj[layer_id].splice(a, 1);
                setmyPizza(obj);
                setnumberOfChooseObject({ ...obj2 });
                isAlreadyAdded = true;
                break

            }
        }

        if (!isAlreadyAdded) {
            let array = obj2[layer_id].selected_items_material_id;
            let number_of_choose = parseInt(layers[layer_id].number_of_choose);
            if (number_of_choose > obj[layer_id].length) {
                //can add more
                obj[layer_id].push(item);
                array.push(item.material_id);

            } else if (number_of_choose == obj[layer_id].length) {
                obj[layer_id].pop();
                obj[layer_id].push(item);
                array.pop();
                array.push(item.material_id);
            }

            obj2[layer_id].number_of_selected = obj[layer_id].length;
            obj2[layer_id]['selected_items_material_id'] = array;
            setmyPizza(obj);
            setnumberOfChooseObject({ ...obj2 });
        }
        calculateTotal(layer_id);
    };

    const onSelectToppings = (item) => {
        let obj = associativeToppingsObj;
        let array = [];
        array = myToppings;
        let tempTotal = pizzaTotal;
        tempTotal+=parseFloat(item.price);

        if (obj[item.id] == undefined) {
            obj[item.id] = 1;

        } else {
            let temp = parseInt(obj[item.id]);
            obj[item.id] = temp + 1;
        }
        setassociativeToppingsObj({ ...obj });

        let topping = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        };
        if (array.length > 0) {
            let index = -1;
            index = array.findIndex(
                (array_item) => array_item.id === item.id,
            );
            if (index >= 0) {
                array[index].quantity++;
            } else {
                array.push(topping);
                setmyToppings(array);

            }
        } else {
            array.push(topping);
            setmyToppings(array);
        }

        setmyToppings(array);
        setpizzaTotal(tempTotal);

    }

    const onPressRemoveToppings = (item) => {
        let obj = associativeToppingsObj;
        let array = [];
        array = myToppings;
        let tempTotal = pizzaTotal;
        tempTotal-=parseFloat(item.price);

        if (obj[item.id] <= 1) {
            delete obj[item.id];

           let index = array.findIndex(
                (array_item) => array_item.id === item.id,
            );
            array.splice(index,1);         

        } else {
            let temp = parseInt(obj[item.id]);
            obj[item.id] = temp - 1;

            let index = array.findIndex(
                (array_item) => array_item.id === item.id,
            );

            array[index].quantity--;

        }

        setassociativeToppingsObj({ ...obj });
        setmyToppings(array);
        setpizzaTotal(tempTotal);

    }


    const calculateTotal = (layer_id) => {
        let tempArray = [];
        let tempTotal = 0;

        let array = [];

        array = myToppings; 

        Object.keys(array).map(function (key){
            let Toppings = array[key]; 
            let ToppingsTotal = Toppings.price * Toppings.quantity; 
            tempTotal += parseFloat(ToppingsTotal); 
        })

        Object.keys(myPizza).map(function (key) {
            tempArray = myPizza[key];
            for (var a = 0; a < tempArray.length; a++) {
                tempTotal += parseFloat(tempArray[a].material_price);
            }
        })
        setpizzaTotal(tempTotal);
        checkAllLayersRequirments();
    }

    const checkAllLayersRequirments = () => {

        let enableAddTocCart = true;
        {
            Object.keys(numberOfChooseObject).map(function (key) {

                if ((parseInt(numberOfChooseObject[key].number_of_choose) != numberOfChooseObject[key].number_of_selected) && (numberOfChooseObject[key].number_of_choose != "NA")) {
                    enableAddTocCart = false;
                }

            })
        }
        setshowAddPizzaSnackbar(enableAddTocCart);
    }


    const addPizzaToCart = () => {
      
        let layers = [];

        Object.keys(myPizza).map(function (key) {
            //layers.push(myPizza[key])

            for (var a = 0; a < myPizza[key].length; a++) {
                let layer = {};          

                layer.layer_id= key,
                layer.material_id=  myPizza[key][a].material_id,
                layer.material_name= myPizza[key][a].material_name,
                layer.material_price=myPizza[key][a].material_price,
                layer.additional_layer_price= myPizza[key][a].additional_layer_price,
                layer.additional_toppings_price= myPizza[key][a].additional_toppings_price;
            
                layers.push(layer);
            }
        })

        let obj = {};
        let obj2 = {};
        obj2[param.dish_id] = myPizza

        obj.dish_id = param.dish_id;
        obj.dish_name = param.dish_name;
        obj.dish_price = pizzaTotal;
        obj.quantity = 1;
        obj.pizza = {
            "order_items": {
                "layers": layers,
                "toppings": myToppings,            
                
            },
            "dish_name": param.dish_name,
            "dish_price": pizzaTotal,
            "quantity": 1,
           
        };      

        let tempDish = cart.dish;
        tempDish.push(obj);

        let tempTotal = parseFloat(cart.subTotal);
        tempTotal += parseFloat(pizzaTotal);

        let tempAssociativeMenuObj = cart.associativeMenuObj;
        tempAssociativeMenuObj[param.dish_id] = 1;

        let tempBadgeCount = cart.badgeCount;
        tempBadgeCount++;

        let payload = {};
        payload.dish = tempDish;
        payload.subTotal = tempTotal;
        payload.associativeMenuObj = tempAssociativeMenuObj;
        payload.badgeCount = tempBadgeCount;
        payload.availedDiscountAmount = cart.availedDiscountAmount;
        payload.selectedOrderPolicy = cart.selectedOrderPolicy;
        payload.availedDiscount = cart.availedDiscount;
        payload.availedOffer = cart.availedOffer;
        payload.availedVoucher = cart.availedVoucher;
        payload.selectedPaymentMethod = cart.selectedPaymentMethod;
        payload.scheduleList = cart.scheduleList;
    


        setCart(payload);

        navigation.goBack();
  


    }


    return (
        <Container>
            <Header style={{ backgroundColor: 'white' }}>
                <Left>
                    <Button transparent onPress={() => {
                        navigation.goBack()
                    }}>
                        <Icon name="arrow-back" />
                    </Button>
                </Left>
                <Body>
                    <Title style={{ color: '#000' }}>{param.dish_name}</Title>
                    <Subtitle style={{ color: '#000' }}>{param.dish_description}</Subtitle>
                </Body>
                <Right>
                    <Text style={{ fontSize: 13 }}>
                        Pizza Total: &pound;{pizzaTotal.toFixed(2)}
                    </Text>
                </Right>
            </Header>
            <Content>
                <View style={{ flex: 1 }}>
                    <List>
                        <ListItem itemDivider>
                            <Text>{layers[layerKeysArray[0]].layer_title}</Text>
                        </ListItem>

                        {Object.keys(layers[layerKeysArray[0]].items).map(function (key) {
                            return (
                                <FirstLayer
                                    layerKeysArray={layerKeysArray}
                                    numberOfChooseObject={numberOfChooseObject}
                                    onSelectFirstLayer={onSelectFirstLayer}
                                    key={key}
                                    item={layers[layerKeysArray[0]].items[key]}
                                    layer_id={layerKeysArray[0]}
                                />
                            );
                        })}

                        {isFirstLayerSelected && (
                            <>
                                {/* <Text>{JSON.stringify( )} </Text> */}
                                <NextLayers
                                    numberOfChooseObject={numberOfChooseObject}
                                    layers={layers}
                                    layerKeysArray={layerKeysArray}
                                    onSelectLayer={onSelectLayer}
                                />

                                <Toppings
                                    toppings={myPizza[layerKeysArray[0]][0] == undefined ? [] : toppings[myPizza[layerKeysArray[0]][0].material_id]}
                                    associativeToppingsObj={associativeToppingsObj}
                                    onSelectToppings={onSelectToppings}
                                    onPressRemoveToppings={onPressRemoveToppings}

                                />



                                {/* myPizza[layerKeysArray[0]][0].material_id */}


                            </>
                        )}
                    </List>
                </View>

            </Content>
            <Snackbar
                style={{ backgroundColor: '#ed1a3b', color: '#fff' }}
                visible={showAddPizzaSnackbar}
                theme={{ colors: { accent: 'white' } }}
                onDismiss={() => { }}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
                action={{
                    label: 'Add TO CART',
                    action: '#fff',
                    onPress: () => {
                        //  navigation.navigate('Cart');

                        addPizzaToCart();

                    },
                }}>
                <Text
                    style={{
                        flex: 1,
                        color: '#fff',
                        borderRightWidth: 1,
                    }}>
                    Total: &pound; {pizzaTotal.toFixed(2)}
                </Text>


            </Snackbar>
        </Container>
    );
}
