import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { injectIntl } from 'react-intl';

// Components
import { Tag } from '../../../basicUIElements';
import { Icon } from '../../../icon';
import { UserAvatar } from '../../../userAvatar';
// Styles
import styles from './postHeaderDescriptionStyles';

import { default as ROUTES } from '../../../../constants/routeNames';

// Constants
const DEFAULT_IMAGE = require('../../../../assets/ecency.png');

class PostHeaderDescription extends PureComponent {
  // Component Life Cycles

  // Component Functions
  _handleOnUserPress = (username) => {
    const { navigation, profileOnPress, reputation, currentAccountUsername } = this.props;

    if (profileOnPress) {
      profileOnPress(username);
    } else {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username,
          reputation,
        },
        key: username,
      });
    }
  };

  render() {
    const {
      date,
      isHideImage,
      name,
      reputation,
      size,
      tag,
      content,
      tagOnPress,
      isShowOwnerIndicator,
      isPromoted,
      intl,
    } = this.props;
    const _reputationText = `(${reputation})`;

    return (
      <View>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.avatarNameWrapper}
            onPress={() => this._handleOnUserPress(name)}
          >
            {!isHideImage && (
              <UserAvatar
                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
                disableSize
                username={name}
                defaultSource={DEFAULT_IMAGE}
                noAction
              />
            )}
          </TouchableOpacity>
          <View style={styles.leftContainer}>
            <View style={styles.primaryDetails}>
              <TouchableOpacity
                style={styles.avatarNameWrapper}
                onPress={() => this._handleOnUserPress(name)}
              >
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.reputation}>{_reputationText}</Text>
              </TouchableOpacity>
              {isShowOwnerIndicator && (
                <Icon style={styles.ownerIndicator} name="stars" iconType="MaterialIcons" />
              )}
            </View>
            <View style={styles.secondaryDetails}>
              <Text style={styles.date}>
                {isPromoted ? intl.formatMessage({ id: 'post.sponsored' }) : date}
              </Text>
            </View>
          </View>
          <View style={styles.rightContainer}>
            {content && (
              <TouchableOpacity>
                <Tag
                  isPostCardTag={!isPromoted}
                  isPin
                  value={content.category}
                  communityTitle={content.community_title}
                />
              </TouchableOpacity>
            )}
            {!!tag && (
              <TouchableOpacity onPress={() => tagOnPress && tagOnPress()}>
                <Tag isPostCardTag={!isPromoted} isPin value={tag} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }
}

export default withNavigation(injectIntl(PostHeaderDescription));
