/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

// Actions and Services
import { getNotifications, markNotifications } from '../../../providers/ecency/ecency';
import { updateUnreadActivityCount } from '../../../redux/actions/accountAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import NotificationScreen from '../screen/notificationScreen';

class NotificationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      lastNotificationId: null,
      isNotificationRefreshing: false,
      selectedFilter: 'activities',
      endOfNotification: false,
      selectedIndex: 0,
    };
  }

  componentDidMount() {
    const { isConnected } = this.props;

    if (isConnected) {
      this._getActivities();
    }
  }

  _getActivities = (type = null, loadMore = false) => {
    const { lastNotificationId, notifications, endOfNotification } = this.state;
    const since = loadMore ? lastNotificationId : null;

    if (!endOfNotification || !loadMore) {
      this.setState({ isNotificationRefreshing: true });
      getNotifications({ filter:type, since:since })
        .then((res) => {
          console.log(res);
          const lastId = res.length > 0 ? [...res].pop().id : null;

          if (loadMore && (lastId === lastNotificationId || res.length === 0)) {
            this.setState({
              endOfNotification: true,
              isNotificationRefreshing: false,
            });
          } else {
            this.setState({
              notifications: loadMore ? [...notifications, ...res] : res,
              lastNotificationId: lastId,
              isNotificationRefreshing: false,
            });
          }
        })
        .catch(() => this.setState({ isNotificationRefreshing: false }));
    }
  };

  _navigateToNotificationRoute = (data) => {
    const { navigation, dispatch } = this.props;
    const type = get(data, 'type');
    const permlink = get(data, 'permlink');
    const author = get(data, 'author');
    let routeName;
    let params;
    let key;
    markNotifications(data.id).then((result) => {
      const {unread} = result;
      dispatch(updateUnreadActivityCount(unread));
    });

    if (permlink && author) {
      routeName = ROUTES.SCREENS.POST;
      key = permlink;
      params = {
        author,
        permlink,
      };
    } else if (type === 'follow') {
      routeName = ROUTES.SCREENS.PROFILE;
      key = get(data, 'follower');
      params = {
        username: get(data, 'follower'),
      };
    } else if (type === 'transfer') {
      routeName = ROUTES.TABBAR.WALLET;
    } else if (type === 'spin') {
      routeName = ROUTES.SCREENS.BOOST;
    } else if (type === 'inactive') {
      routeName = ROUTES.SCREENS.EDITOR;
    }

    if (routeName) {
      navigation.navigate({
        routeName,
        params,
        key,
      });
    }
  };

  _readAllNotification = () => {
    const { username, dispatch, intl, isConnected } = this.props;
    const { notifications } = this.state;

    if (!isConnected) {
      return;
    }

    this.setState({ isNotificationRefreshing: true });

    markNotifications(username)
      .then(() => {
        const updatedNotifications = notifications.map((item) => ({ ...item, read: 1 }));
        dispatch(updateUnreadActivityCount(0));
        this.setState({ notifications: updatedNotifications, isNotificationRefreshing: false });
      })
      .catch(() => {
        Alert.alert(
          intl.formatMessage({ id: 'alert.error' }),
          intl.formatMessage({ d: 'alert.unknow_error' }),
        );
        this.setState({ isNotificationRefreshing: false });
      });
  };

  _handleOnPressLogin = () => {
    const { navigation } = this.props;

    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  _changeSelectedFilter = async (value, ind) => {
    await this.setState({ selectedFilter: value, endOfNotification: false, selectedIndex: ind });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { selectedFilter } = this.state;
    const { username } = this.props;

    if (
      (nextProps.activeBottomTab === ROUTES.TABBAR.NOTIFICATION && nextProps.username) ||
      (nextProps.username !== username && nextProps.username)
    ) {
      this.setState({ endOfNotification: false }, () =>
        this._getActivities(selectedFilter),
      );
    }
  }

  render() {
    const { isLoggedIn } = this.props;
    const { notifications, isNotificationRefreshing } = this.state;

    return (
      <NotificationScreen
        getActivities={this._getActivities}
        notifications={notifications}
        navigateToNotificationRoute={this._navigateToNotificationRoute}
        readAllNotification={this._readAllNotification}
        handleLoginPress={this._handleOnPressLogin}
        isNotificationRefreshing={isNotificationRefreshing}
        isLoggedIn={isLoggedIn}
        changeSelectedFilter={this._changeSelectedFilter}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  isConnected: state.application.isConnected,

  username: state.account.currentAccount.name,
  activeBottomTab: state.ui.activeBottomTab,
});

export default injectIntl(connect(mapStateToProps)(NotificationContainer));
/* eslint-enable */
