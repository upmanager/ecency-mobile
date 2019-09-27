import { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';

// Services and Actions
import { getUser, getUserPoints, claim } from '../providers/esteem/ePoint';
import { openPinCodeModal } from '../redux/actions/applicationActions';
import { getAccount, boost } from '../providers/steem/dsteem';
import { getUserDataWithUsername } from '../realm/realm';
import { toastNotification } from '../redux/actions/uiAction';

// Constant
import POINTS from '../constants/options/points';

// Constants
import ROUTES from '../constants/routeNames';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PointsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPoints: {},
      userActivities: null,
      refreshing: false,
      isClaiming: false,
      isLoading: true,
      navigationParams: {},
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { username, isConnected, navigation } = this.props;

    if (isConnected) {
      this._fetchuserPointActivities(username);
      this.fetchInterval = setInterval(this._fetchuserPointActivities, 6 * 60 * 1000);
    }

    if (get(navigation, 'state.params', null)) {
      const navigationParams = get(navigation, 'state.params');

      this.setState({ navigationParams });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { username } = this.props;
    const _username = get(nextProps, 'username');

    if (
      nextProps.isConnected &&
      ((nextProps.activeBottomTab === ROUTES.TABBAR.POINTS && _username) ||
        (_username !== username && _username))
    ) {
      this._fetchuserPointActivities(_username);
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  // Component Functions

  _handleOnDropdownSelected = index => {
    const { dispatch, isPinCodeOpen, navigation } = this.props;
    const { balance } = this.state;
    let navigateTo;
    let navigateParams;

    switch (Number(index)) {
      case 0:
        navigateTo = ROUTES.SCREENS.TRANSFER;
        navigateParams = {
          transferType: 'points',
          fundType: 'ESTM',
          balance,
        };
        break;

      case 1:
        navigateTo = ROUTES.SCREENS.REDEEM;
        navigateParams = {
          balance,
          redeemType: 'promote',
        };
        break;

      case 2:
        navigateTo = ROUTES.SCREENS.REDEEM;
        navigateParams = {
          balance,
          redeemType: 'boost',
        };
        break;

      default:
        break;
    }

    if (isPinCodeOpen) {
      dispatch(
        openPinCodeModal({
          navigateTo,
          navigateParams,
        }),
      );
    } else {
      navigation.navigate({
        routeName: navigateTo,
        params: navigateParams,
      });
    }
  };

  _groomUserActivities = userActivities =>
    userActivities.map(item => ({
      ...item,
      icon: get(POINTS[get(item, 'type')], 'icon'),
      iconType: get(POINTS[get(item, 'type')], 'iconType'),
      textKey: get(POINTS[get(item, 'type')], 'textKey'),
    }));

  _fetchuserPointActivities = async username => {
    if (!username) return;
    this.setState({ refreshing: true });

    await getUser(username)
      .then(userPoints => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        this.setState({ userPoints, balance });
      })
      .catch(err => {
        Alert.alert(get(err, 'message', 'Error'));
      });

    await getUserPoints(username)
      .then(userActivities => {
        if (Object.entries(userActivities).length !== 0) {
          this.setState({
            userActivities: this._groomUserActivities(userActivities),
          });
        }
      })
      .catch(err => {
        if (err) Alert.alert(get(err, 'message') || err.toString());
      });

    this.setState({
      refreshing: false,
      isLoading: false,
    });
  };

  _getUserBalance = async username => {
    await getUser(username)
      .then(userPoints => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        return balance;
      })
      .catch(err => {
        if (err) Alert.alert(get(err, 'message') || err.toString());
      });
  };

  _claimPoints = async () => {
    const { username } = this.props;

    this.setState({ isClaiming: true });

    await claim(username)
      .then(() => {
        this._fetchuserPointActivities(username);
      })
      .catch(error => {
        if (error) {
          Alert.alert(
            `Fetching data from server failed, please try again or notify us at info@esteem.app \n${error.message.substr(
              0,
              20,
            )}`,
          );
        }
      });

    this.setState({ isClaiming: false });
  };

  _boost = async (point, permlink, author, user) => {
    const { currentAccount, pinCode, dispatch, intl, navigation } = this.props;
    this.setState({ isLoading: true });

    await boost(user || currentAccount, pinCode, point, permlink, author)
      .then(() => {
        this.setState({ isLoading: false });
        navigation.goBack();
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
      })
      .catch(error => {
        if (error) {
          this.setState({ isLoading: false });
          dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        }
      });
  };

  _getESTMPrice = points => {
    const { globalProps } = this.props;
    const { base, quote } = globalProps;

    return points * 0.01 * (base / quote);
  };

  render() {
    const {
      balance,
      isClaiming,
      isDarkTheme,
      isLoading,
      navigationParams,
      refreshing,
      userActivities,
      userPoints,
    } = this.state;
    const { children, accounts, currentAccount } = this.props;

    return (
      children &&
      children({
        accounts,
        balance,
        boost: this._boost,
        claimPoints: this._claimPoints,
        currentAccount,
        currentAccountName: currentAccount.name,
        fetchUserActivity: this._fetchuserPointActivities,
        getAccount,
        getESTMPrice: this._getESTMPrice,
        getUserBalance: this._getUserBalance,
        getUserDataWithUsername,
        handleOnDropdownSelected: this._handleOnDropdownSelected,
        handleOnPressTransfer: this._handleOnPressTransfer,
        isClaiming,
        isDarkTheme,
        isLoading,
        navigationParams,
        refreshing,
        userActivities,
        userPoints,
        redeemType: get(navigationParams, 'redeemType'),
      })
    );
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
  isDarkTheme: state.application.isDarkTheme,
  activeBottomTab: state.ui.activeBottomTab,
  isConnected: state.application.isConnected,
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isPinCodeOpen: state.application.isPinCodeOpen,
  globalProps: state.account.globalProps,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(PointsContainer)));
