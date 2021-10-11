import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';

// Components
import { SearchModal } from '../../searchModal';
import { IconButton } from '../../iconButton';
import { UserAvatar } from '../../userAvatar';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './headerStyles';

const HeaderView = ({
  displayName,
  handleOnPressBackButton,
  handleOnViewModePress,
  handleOpenDrawer,
  isDarkTheme,
  isLoggedIn,
  isLoginDone,
  isReverse,
  reputation,
  username,
  navigation,
  hideUser,
  enableViewModeToggle,
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const intl = useIntl();
  let gradientColor;

  if (isReverse) {
    gradientColor = isDarkTheme ? ['#43638e', '#081c36'] : ['#357ce6', '#2d5aa0'];
  } else {
    gradientColor = isDarkTheme ? ['#081c36', '#43638e'] : ['#2d5aa0', '#357ce6'];
  }

  const _onPressSearchButton = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.SEARCH_RESULT,
    });
  };


  const _renderAvatar = () => (
    <TouchableOpacity
      style={styles.avatarWrapper}
      onPress={handleOpenDrawer}
      disabled={isReverse}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={gradientColor}
        style={[
          styles.avatarButtonWrapper,
          isReverse ? styles.avatarButtonWrapperReverse : styles.avatarDefault,
        ]}
      >
        <UserAvatar
          noAction
          style={isReverse ? styles.reverseAvatar : styles.avatar}
          username={username}
        />
      </LinearGradient>
    </TouchableOpacity>
  )


  const _renderTitle = () => (
    <>
      {displayName || username ? (
        <View style={[styles.titleWrapper, isReverse && styles.titleWrapperReverse]}>
          {displayName && <Text numberOfLines={1} style={styles.title}>{displayName}</Text>}
          <Text style={styles.subTitle}>
            {`@${username}`}
            {reputation && ` (${reputation})`}
          </Text>
        </View>
      ) : (
        <View style={styles.titleWrapper}>
          {isLoginDone && !isLoggedIn && (
            <Text numberOfLines={2} style={styles.noAuthTitle}>
              {intl.formatMessage({
                id: 'header.title',
              })}
            </Text>
          )}
        </View>
      )}
    </>
  )


  const _renderActionButtons = () => (
    <>
      {isReverse ? (
        <View style={styles.reverseBackButtonWrapper}>
          <IconButton
            style={styles.backButton}
            iconStyle={styles.backIcon}
            name="md-arrow-back"
            onPress={handleOnPressBackButton}
          />
        </View>
      ) : (
        <View style={styles.backButtonWrapper}>
          {enableViewModeToggle && (
            <IconButton
              style={styles.viewIconContainer}
              iconStyle={styles.viewIcon}
              name="view-module"
              iconType="MaterialIcons"
              onPress={handleOnViewModePress}
            />
          )}
          <IconButton iconStyle={styles.backIcon} name="md-search" onPress={_onPressSearchButton} />
        </View>
      )}
    </>
  )

  return (
    <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
      
      {!hideUser && (
        <>
          <SearchModal
            placeholder={intl.formatMessage({
              id: 'header.search',
            })}
            isOpen={isSearchModalOpen}
            handleOnClose={() => setIsSearchModalOpen(false)}
          />

          {_renderAvatar()}
          {_renderTitle()}
        </>
      )}
      {_renderActionButtons()}
    </SafeAreaView>
  );
};

export default withNavigation(HeaderView);
