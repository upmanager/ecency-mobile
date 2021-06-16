import React, { Component } from 'react';
import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { connect } from 'react-redux';

import FastImage from 'react-native-fast-image';
import styles from './userAvatarStyles';
import { navigate } from '../../../navigation/service';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utils
import { getResizedAvatar } from '../../../utils/image';
import { useAppSelector } from '../../../hooks';
import EStyleSheet from 'react-native-extended-stylesheet';

const DEFAULT_IMAGE = require('../../../assets/avatar_default.png');

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

interface UserAvatarProps {
  username:string;
  avatarUrl?:string;
  size?:'xl';
  style?:ViewStyle;
  disableSize?:boolean;
  noAction?:boolean;
  isLoading?:boolean;
}

const UserAvatarView = ({
  username,
  avatarUrl,
  size,
  style,
  disableSize,
  noAction,
  isLoading
}:UserAvatarProps) => {

    const curUsername = useAppSelector(state=>state.account.currentAccount.name);
    const avatarCacheStamp = useAppSelector(state=>state.ui.avatarCacheStamp);

    // Component Functions
    const _handleOnAvatarPress = (username:string) => {
      const routeName = curUsername === username ? ROUTES.TABBAR.PROFILE : ROUTES.SCREENS.PROFILE;
      navigate({
        routeName,
        params: {
          username,
        },
        key: username,
      });
    };


    const uri = avatarUrl ? avatarUrl : getResizedAvatar(username, 'large');

    const _avatar = username
      ? { uri : `${uri}?stamp=${avatarCacheStamp}` }
      : DEFAULT_IMAGE;

    let _size:number;
    if (!disableSize) {
      _size = 32;
      if (size === 'xl') {
        _size = 64;
      }
    }


    return (
      <TouchableOpacity disabled={noAction} onPress={() => _handleOnAvatarPress(username)}>
        <FastImage
          style={[
            styles.avatar,
            style,
            !disableSize && { width: _size, height: _size, borderRadius: _size / 2 },
          ]}
          source={_avatar}
        />
        {
          isLoading && (
            <ActivityIndicator 
              style={styles.activityIndicator} 
              size='large' 
              color={EStyleSheet.value('$white')} 
            />
          )
        }
      </TouchableOpacity>
    );
}

export default UserAvatarView;
