import React, { useImperativeHandle, useRef, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './styles';
import { extractImageUrls } from '../../../utils/editor';
import FastImage from 'react-native-fast-image';
import { forwardRef } from 'react';
import { View, Text, Alert } from 'react-native';
import { useIntl } from 'react-intl';


export interface ThumbSelectionModalProps {
  thumbIndex:number;
  onThumbSelection:(index:number)=>void;
}


const ThumbSelectionModal = ({ onThumbSelection, thumbIndex }:ThumbSelectionModalProps, ref) => {
  const intl = useIntl();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const sheetModalRef = useRef<ActionSheet>();

  //CALLBACK_METHODS
  useImperativeHandle(ref, () => ({
      show: (postBody:string) => {
          console.log("Showing action modal")

          const urls = extractImageUrls({body:postBody});

          if(urls.length < 2){
              console.log("Skipping modal show as post images are less than 2");
              Alert.alert(
                intl.formatMessage({id:'editor.two_thumbs_required'})
              )
              onThumbSelection(0);
              return;
          }

          setImageUrls(urls);
          sheetModalRef.current?.setModalVisible(true);
      }
  }));


  const _onSelection = (index:number) => {
    onThumbSelection(index);
    sheetModalRef.current?.setModalVisible(false);
  }



  //VIEW_RENDERERS
  const _renderImageItem = ({item, index}:{item:string, index:number}) => {
      const _onPress = () => {
          _onSelection(index);
      }

      const selectedStyle = index === thumbIndex ? styles.selectedStyle : null

    return (
        <TouchableOpacity onPress={_onPress} >
            <FastImage 
                source={{uri:item}}
                style={{...styles.thumbStyle, ...selectedStyle}}
                resizeMode='cover'
            />
        </TouchableOpacity>
    )
  }


  const _renderContent = () => {
      return (
        <View style={{alignItems:'center'}} >
            <Text style={styles.title}>{intl.formatMessage({id:'editor.select_thumb'})}</Text>
            <FlatList
              data={imageUrls}
              renderItem={_renderImageItem}
              keyExtractor={(item, index)=>`${item}-${index}`}
              horizontal={true}
              contentContainerStyle={styles.listContainer}
              showsHorizontalScrollIndicator={false}
          />
        </View>
        
      )
  }


  return (
    <ActionSheet 
     ref={sheetModalRef}
     gestureEnabled={false}
     hideUnderlay
     containerStyle={styles.sheetContent}
     indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
     > 
     {_renderContent()}
 </ActionSheet> 
  );
};

export default forwardRef(ThumbSelectionModal);