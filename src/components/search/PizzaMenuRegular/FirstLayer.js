import { Body, CheckBox, ListItem, Text, Right } from 'native-base';
import React from 'react';

const FirstLayer = ({
    numberOfChooseObject,
    layerKeysArray,
    onSelectFirstLayer,
    ...props
}) => {
    let selectedMatIds = [];
    let isChecked = false;
    if (!numberOfChooseObject) return null;
    selectedMatIds =
        numberOfChooseObject[layerKeysArray[0]] == undefined
            ? []
            : numberOfChooseObject[layerKeysArray[0]].selected_items_material_id;
    for (var a = 0; a < selectedMatIds.length; a++) {
        if (selectedMatIds[a] == props.item.material_id) {
            isChecked = true;
            continue;
        } else {
            isChecked = false;
        }
    }

    return (
        <ListItem
            onPress={() => {
                onSelectFirstLayer(props.item, props.layer_id);
            }}>
            <CheckBox
                checked={isChecked}
                color="red"
                onPress={() => {
                    onSelectFirstLayer(props.item, props.layer_id);
                }}
            />
            <Body>
                <Text>{props.item.material_name}</Text>
            </Body>
            <Right>
                <Text>&pound;{props.item.material_price}</Text>
            </Right>
        </ListItem>
    );
}

export default FirstLayer;