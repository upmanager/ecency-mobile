import React, { PureComponent, Fragment } from 'react';
import { View, ScrollView, SafeAreaView, Text } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Components
import { CollapsibleCard } from '../collapsibleCard';
import { Comments } from '../comments';
import { Header } from '../header';
import { NoPost, ProfileSummaryPlaceHolder, WalletDetailsPlaceHolder } from '../basicUIElements';
import { Posts } from '../posts';
import { ProfileSummary } from '../profileSummary';
import { TabBar } from '../tabBar';
import { Wallet } from '../wallet';

// Constants
import { PROFILE_FILTERS, PROFILE_FILTERS_VALUE } from '../../constants/options/filters';

// Utils
import { getFormatedCreatedDate } from '../../utils/time';

// Styles
import styles from './profileStyles';
import globalStyles from '../../globalStyles';

class ProfileView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isSummaryOpen: true,
      collapsibleMoreHeight: 0,
      estimatedWalletValue: 0,
      oldEstimatedWalletValue: 0,
    };
  }

  _handleOnScroll = () => {
    const { isSummaryOpen } = this.state;

    if (isSummaryOpen) {
      this.setState({ isSummaryOpen: false });
    }
  };

  _loadMoreComments = () => {
    const { getReplies, comments } = this.props;

    if (comments && comments.length > 0) {
      getReplies({
        author: comments[comments.length - 1].author,
        permlink: comments[comments.length - 1].permlink,
      });
    }
  };

  _handleOnSummaryExpanded = () => {
    const { isSummaryOpen } = this.state;

    if (!isSummaryOpen) {
      this.setState({ isSummaryOpen: true });
    }
  };

  _handleUIChange = (height) => {
    this.setState({ collapsibleMoreHeight: height });
  };

  _getTabLabel = (value) => {
    if (value.length > 10) {
      return `${value.substring(0, 10)}...`;
    }
    return value;
  };

  _isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  }

  render() {
    const {
      about,
      activePage,
      changeForceLoadPostState,
      comments,
      currencyRate,
      currencySymbol,
      follows,
      forceLoadPost,
      getReplies,
      handleFollowUnfollowUser,
      handleMuteUnmuteUser,
      handleOnBackPress,
      handleOnFavoritePress,
      handleOnFollowsPress,
      handleOnPressProfileEdit,
      intl,
      isDarkTheme,
      isFavorite,
      isFollowing,
      isLoggedIn,
      isMuted,
      isOwnProfile,
      isProfileLoading,
      isReady,
      quickProfile,
      resourceCredits,
      selectedUser,
      username,
      votingPower,
      isHideImage,
    } = this.props;

    const {
      isSummaryOpen,
      collapsibleMoreHeight,
      estimatedWalletValue,
      oldEstimatedWalletValue,
    } = this.state;

    return (
      <View style={styles.container}>
        <Header
          key={quickProfile && quickProfile.name}
          selectedUser={quickProfile}
          isReverse={!isOwnProfile}
          handleOnBackPress={handleOnBackPress}
        />
        <View style={styles.container}>
          {!isReady ? (
            <ProfileSummaryPlaceHolder />
          ) : (
            <CollapsibleCard
              title={get(about, 'about')}
              isTitleCenter
              defaultTitle={intl.formatMessage({
                id: 'profile.details',
              })}
              expanded={!isOwnProfile}
              isExpanded={isSummaryOpen}
              handleOnExpanded={this._handleOnSummaryExpanded}
              moreHeight={collapsibleMoreHeight}
              // expanded={isLoggedIn}
              // locked={!isLoggedIn}
            >
              <ProfileSummary
                date={getFormatedCreatedDate(get(selectedUser, 'created'))}
                about={about}
                followerCount={follows.follower_count}
                followingCount={follows.following_count}
                handleFollowUnfollowUser={handleFollowUnfollowUser}
                handleMuteUnmuteUser={handleMuteUnmuteUser}
                handleOnFavoritePress={handleOnFavoritePress}
                handleOnFollowsPress={handleOnFollowsPress}
                handleUIChange={this._handleUIChange}
                hoursRC={Math.ceil((100 - resourceCredits) * 0.833333) || null}
                hoursVP={Math.ceil((100 - votingPower) * 0.833333) || null}
                intl={intl}
                isDarkTheme={isDarkTheme}
                isFavorite={isFavorite}
                isFollowing={isFollowing}
                isLoggedIn={isLoggedIn}
                isMuted={isMuted}
                isOwnProfile={isOwnProfile}
                isProfileLoading={isProfileLoading}
                percentRC={resourceCredits}
                percentVP={votingPower}
                handleOnPressProfileEdit={handleOnPressProfileEdit}
              />
            </CollapsibleCard>
          )}

          <ScrollableTabView
            style={[globalStyles.tabView, styles.tabView]}
            initialPage={activePage}
            renderTabBar={() => (
              <TabBar style={styles.tabbar} tabUnderlineDefaultWidth={80} tabUnderlineScaleX={2} />
            )}
            onChangeTab={({ i }) => {
              if (i !== 2) {
                this.setState({
                  estimatedWalletValue: 0,
                  oldEstimatedWalletValue: estimatedWalletValue,
                });
              } else {
                this.setState({ estimatedWalletValue: oldEstimatedWalletValue });
              }
            }}
          >
            <View
              tabLabel={this._getTabLabel(intl.formatMessage({ id: 'profile.post' }))}
              style={styles.postTabBar}
            >
              <Posts
                filterOptions={PROFILE_FILTERS}
                filterOptionsValue={PROFILE_FILTERS_VALUE}
                selectedOptionIndex={0}
                pageType="profiles"
                getFor="blog"
                feedUsername={username}
                key={username}
                handleOnScroll={isSummaryOpen ? this._handleOnScroll : null}
                forceLoadPost={forceLoadPost}
                changeForceLoadPostState={changeForceLoadPostState}
              />
            </View>

            <View
              tabLabel={
                !isOwnProfile
                  ? this._getTabLabel(intl.formatMessage({ id: 'profile.comments' }))
                  : this._getTabLabel(intl.formatMessage({ id: 'profile.replies' }))
              }
              style={styles.commentsTabBar}
            >
              {comments && comments.length > 0 ? (
                <ScrollView
                  onScroll={({ nativeEvent }) => {
                    this._handleOnScroll();
                    if (this._isCloseToBottom(nativeEvent)) {
                      this._loadMoreComments();
                    }
                  }}
                  contentContainerStyle={styles.scrollContentContainer}
                  //scrollEventThrottle={16}
                >
                  <Comments
                    isProfilePreview
                    comments={comments}
                    fetchPost={getReplies}
                    isOwnProfile={isOwnProfile}
                    isHideImage={isHideImage}
                  />
                </ScrollView>
              ) : (
                <NoPost
                  name={username}
                  text={intl.formatMessage({
                    id: 'profile.havent_commented',
                  })}
                  defaultText={intl.formatMessage({
                    id: 'profile.login_to_see',
                  })}
                />
              )}
            </View>
            {!isOwnProfile && (
              <View
                tabLabel={
                  estimatedWalletValue
                    ? `${currencySymbol} ${(estimatedWalletValue * currencyRate).toFixed()}`
                    : intl.formatMessage({
                        id: 'profile.wallet',
                      })
                }
              >
                {selectedUser ? (
                  <Wallet
                    setEstimatedWalletValue={(value) =>
                      this.setState({ estimatedWalletValue: value })
                    }
                    selectedUser={selectedUser}
                    handleOnScroll={isSummaryOpen ? this._handleOnScroll : null}
                  />
                ) : (
                  <WalletDetailsPlaceHolder />
                )}
              </View>
            )}
          </ScrollableTabView>
        </View>
      </View>
    );
  }
}

export default injectIntl(ProfileView);
