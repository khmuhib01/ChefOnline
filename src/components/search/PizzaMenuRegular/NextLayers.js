import { ListItem, Text } from 'native-base';
import React from 'react';
import LayerItem from './LayerItem';

const NextLayers = ({
    key,
    layerKeysArray,
    layers,
    numberOfChooseObject,
    onSelectLayer,
}) => {
    if (!numberOfChooseObject) return null;

    let items = [];

    for (var a = 1; a < layerKeysArray.length; a++) {
        if (layers[layerKeysArray[a]].items.length == undefined) {
            //this is an object
            Object.keys(layers[layerKeysArray[a]].items).map(function (key, index) {
                let pizzaItemArray = layers[layerKeysArray[a]].items[key];
                let previousLayerId = layerKeysArray[a - 1];
                let previousLayerSelectedItems =
                    numberOfChooseObject[previousLayerId].selected_items_material_id;

                let showListHeader = true;
                for (var b = 0; b < pizzaItemArray.length; b++) {
                    let pizzaItem = pizzaItemArray[b];
                    for (var c = 0; c < previousLayerSelectedItems.length; c++) {
                        if (previousLayerSelectedItems[c] == key) {
                            if (showListHeader) {
                                showListHeader = false;
                                items.push(
                                    <ListItem itemDivider>
                                        <Text>{layers[layerKeysArray[a]].layer_title}</Text>
                                    </ListItem>,
                                );
                            }

                            items.push(
                                <LayerItem
                                    onSelectLayer={onSelectLayer}
                                    numberOfChooseObject={numberOfChooseObject}
                                    item={pizzaItem}
                                    layer_id={layerKeysArray[a]}
                                />
                            );
                        }
                    }
                }

            });
        } else {
            //this is an array
            items.push(
                <ListItem itemDivider>
                    <Text>{layers[layerKeysArray[a]].layer_title}</Text>
                </ListItem>
            );

            for (var b = 0; b < layers[layerKeysArray[a]].items.length; b++) {
                let pizzaItem = layers[layerKeysArray[a]].items[b];
                let previousLayerId = layerKeysArray[a - 1];
                let previousLayerSelectedItems =
                    numberOfChooseObject[previousLayerId].selected_items_material_id;



                if (pizzaItem.material_parent_id == '0') {
                    items.push(
                        <LayerItem
                            onSelectLayer={onSelectLayer}
                            numberOfChooseObject={numberOfChooseObject}
                            item={pizzaItem}
                            layer_id={layerKeysArray[a]}
                        />

                    );
                } else {
                    for (var c = 0; c < previousLayerSelectedItems.length; c++) {
                        if (previousLayerSelectedItems[c] == pizzaItem.material_parent_id) {
                            items.push(
                                <LayerItem
                                    onSelectLayer={onSelectLayer}
                                    numberOfChooseObject={numberOfChooseObject}
                                    item={pizzaItem}
                                    layer_id={layerKeysArray[a]}
                                />

                            );

                        }
                    }
                }
            }
        }
    }

    return <>{items}</>;
}

export default NextLayers;