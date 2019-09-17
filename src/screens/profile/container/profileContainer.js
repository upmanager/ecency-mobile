import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { get, has } from 'lodash';
import { Alert } from 'react-native';

// Providers
import {
  followUser,
  unfollowUser,
  ignoreUser,
  getFollows,
  getRepliesByLastUpdate,
  getUserComments,
  getUser,
  getIsFollowing,
  getIsMuted,
} from '../../../providers/steem/dsteem';

// Esteem providers
import { getIsFavorite, addFavorite, removeFavorite } from '../../../providers/esteem/esteem';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Components
import ProfileScreen from '../screen/profileScreen';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: [],
      follows: {},
      forceLoadPost: false,
      isFavorite: false,
      isFollowing: false,
      isMuted: false,
      isProfileLoading: false,
      isReady: false,
      isReverseHeader: has(props, 'navigation.state.params.username'),
      user: null,
      quickProfile: {
        reputation: get(props, 'navigation.state.params.reputation', ''),
        name: get(props, 'navigation.state.params.username', ''),
      },
    };
  }

  componentDidMount() {
    const {
      navigation,
      isConnected,
      isLoggedIn,
      currentAccount: { name: currentAccountUsername },
    } = this.props;
    const username = get(navigation, 'state.params.username');
    let targetUsername = currentAccountUsername;

    if (!isConnected) return;

    if (!isLoggedIn && !username) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (username && username !== currentAccountUsername) {
      targetUsername = username;
    }

    this._loadProfile(targetUsername);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isConnected) return;

    const { activeBottomTab, currentAccount, isLoggedIn, navigation } = this.props;
    const currentUsername =
      get(currentAccount, 'name') !== get(nextProps, 'currentAccount.name') &&
      get(nextProps, 'currentAccount.name');
    if (isLoggedIn && !nextProps.isLoggedIn) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (
      (activeBottomTab !== get(nextProps, 'activeBottomTab') &&
        get(nextProps, 'activeBottomTab') === ROUTES.TABBAR.PROFILE) ||
      currentUsername
    ) {
      this._loadProfile(currentUsername);
    }
  }

  _getReplies = async user => {
    const { isReverseHeader } = this.state;
    if (isReverseHeader) {
      await getUserComments({ start_author: user, limit: 10 }).then(result => {
        this.setState({
          comments: result,
        });
      });
    } else {
      await getRepliesByLastUpdate({ start_author: user, limit: 10 }).then(result => {
        this.setState({
          comments: result,
        });
      });
    }
  };

  _handleFollowUnfollowUser = async isFollowAction => {
    const { isFollowing } = this.state;

    this.setState({
      isProfileLoading: true,
    });

    if (isFollowAction && !isFollowing) {
      this._followUser();
    } else {
      this._unfollowUser();
    }
  };

  _handleMuteUnmuteUser = isMuteAction => {
    this.setState({
      isProfileLoading: true,
    });

    if (isMuteAction) {
      this._muteUser();
    } else {
      this._unfollowUser();
    }
  };

  _unfollowUser = () => {
    const { username } = this.state;
    const { currentAccount, pinCode } = this.props;
    const follower = currentAccount.name;
    const following = username;

    unfollowUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        this._profileActionDone();
      })
      .catch(err => {
        this._profileActionDone(err);
      });
  };

  _followUser = () => {
    const { username } = this.state;
    const { currentAccount, pinCode } = this.props;
    const follower = currentAccount.name;
    const following = username;

    followUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        this._profileActionDone();
      })
      .catch(err => {
        this._profileActionDone(err);
      });
  };

  _muteUser = () => {
    const { username } = this.state;
    const { currentAccount, pinCode } = this.props;
    const follower = currentAccount.name;
    const following = username;

    ignoreUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        this._profileActionDone();
      })
      .catch(err => {
        this._profileActionDone(err);
      });
  };

  _profileActionDone = (error = null) => {
    const { username } = this.state;

    if (error) {
      this.setState(
        {
          error,
        },
        () => Alert.alert(get(error, 'message') || error.toString()),
      );
    } else {
      this._fetchProfile(username, true);
    }
  };

  _fetchProfile = async (username = null, isProfileAction = false) => {
    const { username: _username, isFollowing, isMuted } = this.state;

    if (username) {
      const { isLoggedIn, currentAccount } = this.props;
      let _isFollowing;
      let _isMuted;
      let isFavorite;
      let follows;

      if (isLoggedIn && currentAccount.name !== username) {
        _isFollowing = await getIsFollowing(username, currentAccount.name);

        _isMuted = _isFollowing ? false : await getIsMuted(username, currentAccount.name);

        getIsFavorite(username, currentAccount.name).then(isFav => {
          isFavorite = isFav;
        });
      }

      try {
        follows = await getFollows(username);
      } catch (err) {
        follows = null;
      }

      if (isProfileAction && (isFollowing === _isFollowing && isMuted === _isMuted)) {
        this._fetchProfile(_username, true);
      } else {
        this.setState({
          follows,
          isFollowing: _isFollowing,
          isMuted: _isMuted,
          isFavorite,
          isReady: true,
          isProfileLoading: false,
        });
      }
    }
  };

  _loadProfile = async (username = null) => {
    let user;

    try {
      user = await getUser(username);
      this._fetchProfile(username);
    } catch (error) {
      this._profileActionDone(error);
    }

    this.setState(prevState => ({
      quickProfile: {
        ...prevState.quickProfile,
        display_name: get(user, 'display_name'),
        reputation: get(user, 'reputation'),
      },
      user,
      username,
    }));

    this._getReplies(username);
  };

  _handleFollowsPress = async isFollowingPress => {
    const { navigation } = this.props;
    const { username, follows } = this.state;
    let count;

    if (!isFollowingPress) {
      count = follows.follower_count;
    } else {
      count = follows.following_count;
    }

    navigation.navigate({
      routeName: ROUTES.SCREENS.FOLLOWS,
      params: {
        isFollowingPress,
        count,
        username,
      },
      key: `${username}${count}`,
    });
  };

  _addFavorite = () => {
    const { currentAccount } = this.props;
    const { username } = this.state;

    addFavorite(currentAccount.name, username).then(() => {
      this.setState({ isFavorite: true });
    });
  };

  _removeFavorite = () => {
    const { currentAccount } = this.props;
    const { username } = this.state;

    removeFavorite(currentAccount.name, username).then(() => {
      this.setState({ isFavorite: false });
    });
  };

  _handleOnFavoritePress = isFavorite => {
    if (isFavorite) {
      this._removeFavorite();
    } else {
      this._addFavorite();
    }
  };

  _handleOnBackPress = () => {
    const { navigation } = this.props;
    const navigationParams = get(navigation.state, 'params');

    if (get(navigationParams, 'fetchData')) {
      navigationParams.fetchData();
    }
  };

  _changeForceLoadPostState = value => {
    this.setState({ forceLoadPost: value });
  };

  _handleOnPressProfileEdit = () => {
    const { navigation, currentAccount } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE_EDIT,
      params: {
        fetchUser: () => this.setState({ user: currentAccount }),
      },
    });
  };

  render() {
    const {
      avatar,
      comments,
      error,
      follows,
      isFavorite,
      isFollowing,
      isMuted,
      isProfileLoading,
      isReady,
      isReverseHeader,
      quickProfile,
      user,
      username,
      forceLoadPost,
    } = this.state;
    const { isDarkTheme, isLoggedIn, currency, navigation } = this.props;
    const activePage = get(navigation.state.params, 'state', 0);

    return (
      <ProfileScreen
        about={get(user, 'about.profile')}
        activePage={activePage}
        avatar={avatar}
        changeForceLoadPostState={this._changeForceLoadPostState}
        comments={comments}
        currency={currency}
        error={error}
        follows={follows}
        forceLoadPost={forceLoadPost}
        getReplies={() => this._getReplies(username)}
        handleFollowUnfollowUser={this._handleFollowUnfollowUser}
        handleMuteUnmuteUser={this._handleMuteUnmuteUser}
        handleOnBackPress={this._handleOnBackPress}
        handleOnFavoritePress={this._handleOnFavoritePress}
        handleOnFollowsPress={this._handleFollowsPress}
        handleOnPressProfileEdit={this._handleOnPressProfileEdit}
        isDarkTheme={isDarkTheme}
        isFavorite={isFavorite}
        isFollowing={isFollowing}
        isLoggedIn={isLoggedIn}
        isMuted={isMuted}
        isProfileLoading={isProfileLoading}
        isReady={isReady}
        isReverseHeader={isReverseHeader}
        quickProfile={quickProfile}
        selectedUser={user}
        username={username}
      />
    );
  }
}

const mapStateToProps = state => ({
  // Applicaiton
  isLoggedIn: state.application.isLoggedIn,
  isDarkTheme: state.application.isDarkTheme,
  currency: state.application.currency,
  isConnected: state.application.isConnected,

  // Ui
  activeBottomTab: state.ui.activeBottomTab,

  // Account
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
});

export default connect(mapStateToProps)(withNavigation(ProfileContainer));
