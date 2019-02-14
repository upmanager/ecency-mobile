import React, { Component, Fragment } from 'react';
import {
  AppState, Platform, Linking, Alert,
} from 'react-native';
import { connect } from 'react-redux';
import Push from 'appcenter-push';
import { injectIntl } from 'react-intl';

// Actions & Services
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import { getExistUser } from '../../../realm/realm';
import { getPost, getUser } from '../../../providers/steem/dsteem';

// Components
import { Modal } from '../../../components';
import { PinCode } from '../../pinCode';
import PostButtonForAndroid from '../../../components/postButton/view/postButtonsForAndroid';
import { ToastNotificaiton } from '../../../components/toastNotification';

// Constants
import ROUTES from '../../../constants/routeNames';

const RootContainer = () => (WrappedComponent) => {
  class RootComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        pinCodeStates: null,
        wrappedComponentStates: null,
        appState: AppState.currentState,
      };
    }

    componentDidMount() {
      AppState.addEventListener('change', this._handleAppStateChange);
      this._createPushListener();
      console.log('test ===11222211==== :');

      if (Platform.OS === 'android') {
        Linking.getInitialURL().then((url) => {
          this._handleDeepLink(url);
        });
      } else {
        Linking.addEventListener('url', this._handleOpenURL);
      }
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
      Linking.removeEventListener('url', this._handleOpenURL);
    }

    _handleOpenURL = (event) => {
      console.log('event :', event);
      this._handleDeepLink(event.url);
    }

    _handleDeepLink = async (url) => {
      console.log('url :', url);
      if (!url) return;

      let author;
      let permlink;
      let routeName;
      let params;
      let content;
      let profile;
      const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
      const { navigation, currentAccountUsername, intl } = this.props;

      console.log('url.indexOf() :', url.indexOf('steemit'));
      if (url.indexOf('esteem') > -1) {
        console.log('test ===3 === :');
        const route = url.replace(/.*?:\/\//g, '');
        const routeParams = route.indexOf('/') > -1 ? route.split('/') : [route];

        if (routeParams && routeParams.length > 1) {
          permlink = routeParams[2];
          author = routeParams[1].indexOf('@') > -1 ? routeParams[1].replace('@', '') : routeParams[1];
        } else if ((routeParams && routeParams.length === 1) || route.indexOf('@') > -1) {
          author = route.length >= 3 && route;
        }
      } else if (url.indexOf('steemit') > -1) {
        console.log('test ===2 === :');
        const urlMatch = url.match(postRegex);
        const sss = urlMatch;
      }
      console.log('author :', author);
      console.log('permlink :', permlink);

      if (author && permlink) {
        await getPost(author, permlink, currentAccountUsername)
          .then((result) => {
            if (result && result.title) {
              content = result;
            } else {
              this._handleAlert(
                intl.formatMessage({
                  id: 'deep_link.no_existing_post',
                }),
              );
            }
          })
          .catch(() => {
            this._handleAlert(
              intl.formatMessage({
                id: 'deep_link.no_existing_post',
              }),
            );
          });

        routeName = ROUTES.SCREENS.POST;
        params = { content };
      } else if (author) {
        profile = await getUser(author);

        if (!profile) {
          this._handleAlert(
            intl.formatMessage({
              id: 'deep_link.no_existing_user',
            }),
          );
          return;
        }

        routeName = ROUTES.SCREENS.PROFILE;
        params = { username: profile.name, reputation: profile.reputation };
      }

      if (profile || content) {
        navigation.navigate({
          routeName,
          params,
          key: permlink || author,
        });
      }
    };

    _handleAlert = (title = null, text = null) => {
      Alert.alert(title, text);
    };

    _handleAppStateChange = (nextAppState) => {
      const { appState } = this.state;

      getExistUser().then((isExistUser) => {
        if (isExistUser) {
          if (appState.match(/active|forground/) && nextAppState === 'inactive') {
            this._startPinCodeTimer();
          }

          if (appState.match(/inactive|background/) && nextAppState === 'active') {
            clearTimeout(this._pinCodeTimer);
          }
        }
      });

      this.setState({ appState: nextAppState });
    };

    _startPinCodeTimer = () => {
      const { dispatch } = this.props;

      this._pinCodeTimer = setTimeout(() => {
        dispatch(openPinCodeModal());
      }, 1 * 60 * 1000);
    };

    _setPinCodeState = (data) => {
      this.setState({ pinCodeStates: { ...data } });
    };

    _setWrappedComponentState = (data) => {
      this.setState({ wrappedComponentStates: { ...data } });
    };

    _createPushListener = () => {
      const { navigation } = this.props;
      let params = null;
      let key = null;
      let routeName = null;

      Push.setListener({
        onPushNotificationReceived(pushNotification) {
          const extra = JSON.parse(pushNotification.customProperties.extra);

          if (extra.parent_permlink || extra.permlink) {
            params = {
              author:
                extra.parent_permlink
                  ? extra.parent_author
                  : pushNotification.customProperties.target,
              permlink: extra.parent_permlink ? extra.parent_permlink : extra.permlink,
            };
            key = extra.parent_permlink ? extra.parent_permlink : extra.permlink;
            routeName = ROUTES.SCREENS.POST;
          } else {
            params = {
              username: pushNotification.customProperties.source,
            };
            key = pushNotification.customProperties.source;
            routeName = ROUTES.SCREENS.PROFILE;
          }

          setTimeout(() => {
            navigation.navigate({ routeName, params, key });
          }, 4000);
        },
      });
    };

    render() {
      const { isPinCodeReqiure, navigation } = this.props;
      const { pinCodeStates, wrappedComponentStates } = this.state;

      return (
        <Fragment>
          <Modal
            isOpen={isPinCodeReqiure}
            isFullScreen
            swipeToClose={false}
            backButtonClose={false}
          >
            <PinCode
              {...pinCodeStates}
              setWrappedComponentState={this._setWrappedComponentState}
              navigation={navigation}
            />
          </Modal>
          <WrappedComponent
            {...this.props}
            {...wrappedComponentStates}
            setPinCodeState={this._setPinCodeState}
          />
          {Platform.OS === 'android' && <PostButtonForAndroid />}
        </Fragment>
      );
    }
  }
  const mapStateToProps = state => ({
    currentAccountUsername: state.account.currentAccount.name,
    isPinCodeReqiure: state.application.isPinCodeReqiure,
    isActiveApp: state.application.isActive,
  });

  return connect(mapStateToProps)(injectIntl(RootComponent));
};

export default RootContainer;
