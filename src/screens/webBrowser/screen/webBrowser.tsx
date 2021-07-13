import React, {useMemo } from 'react';
import {Alert, StatusBar, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

import { SafeAreaView } from 'react-native-safe-area-context';
import {get} from 'lodash';
import styles from './webBrowserStyles';
import { IconButton } from '../../../components';

export interface WebBrowserParams {
    url:string;
}

interface Props {
  navigation:{
    state:{
      params:WebBrowserParams
    }
    goBack:()=>void;
  }
}

const WebBrowser = ({navigation}:Props) => {

  const url = useMemo(() => get(navigation, 'state.params.url'), []);

  if(!url){
    Alert.alert("DEV: url parameter cannot be empty")
  }

  const _onBackPress = () => {
    navigation.goBack();
  }

  const _renderHeader = () => {
    return (
      <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>ECENCY</Text>
          </View>
          <IconButton
            iconStyle={styles.backIcon}
            iconType="MaterialIcons"
            name="arrow-back"
            onPress={_onBackPress}
          />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content'  />
      {_renderHeader()}
      <WebView
        source={{
          uri: url,
        }}
      />
    </SafeAreaView>
  )
}

export default WebBrowser
