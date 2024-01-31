import {Text} from 'native-base';
import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import { Button } from 'react-native-paper';


export default function AppButtonContained(props) {
  return (
    <Button
      disabled={props.disabled}
      mode="contained"
      color="#ed1a3b"
      onPress={() => props.onClick()}>
      {props.text}
    </Button>
  );
}

const styles = StyleSheet.create({});
