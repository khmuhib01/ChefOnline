import React from 'react';
import {
    Text,
    ListItem,
    Right,
    Body,
    CheckBox,
} from 'native-base';

const LayerItem = ({ layer_id, item, onSelectLayer, numberOfChooseObject }) => {
    let selectedMatIds = [];
    let isChecked = false;
    selectedMatIds = numberOfChooseObject[layer_id].selected_items_material_id;

    for (var a = 0; a < selectedMatIds.length; a++) {
        if (selectedMatIds[a] == item.material_id) {
            isChecked = true;
            continue;
        } else {
            isChecked = false;
        }
    }

    return (
        <ListItem
            key={item.material_id}
            onPress={() => {
                onSelectLayer(item, layer_id);
            }}>
            <CheckBox checked={isChecked} color="red" onPress={() => {
                onSelectLayer(item, layer_id);
            }} />
            <Body>
                <Text>{item.material_name}</Text>
            </Body>
            <Right>
                <Text>&pound;{item.material_price}</Text>
            </Right>
        </ListItem>
    );
}

export default LayerItem;