import React, { Component, Fragment } from 'react';
import { StatusBar, Platform, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import { createAppContainer } from 'react-navigation';

import AppNavitation from '../../../navigation/routes';
import { setTopLevelNavigator, navigate } from '../../../navigation/service';

// Services
import { toastNotification as toastNotificationAction } from '../../../redux/actions/uiAction';

// Components
import { ToastNotification, NoInternetConnection } from '../../../components';

// Themes (Styles)
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';

const Navigation = createAppContainer(AppNavitation);

class ApplicationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowToastNotification: false,
    };
  }

  _handleOnHideToastNotification = () => {
    const { dispatch } = this.props;
    dispatch(toastNotificationAction(''));
    this.setState({ isShowToastNotification: false });
  };

  UNSAFE_componentWillMount() {
    const { isDarkTheme } = this.props;
    EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { toastNotification } = this.props;
    if (nextProps.toastNotification && nextProps.toastNotification !== toastNotification) {
      this.setState({ isShowToastNotification: true });
    }
  }

  render() {
    const { isConnected, isDarkTheme, toastNotification, isReady } = this.props;
    const { isShowToastNotification } = this.state;
    const barStyle = isDarkTheme ? 'light-content' : 'dark-content';
    const barColor = isDarkTheme ? '#1e2835' : '#fff';

    return (
      <View pointerEvents={isReady ? 'auto' : 'none'} style={{ flex: 1 }}>
        {Platform.os === 'ios' ? (
          <StatusBar barStyle={barStyle} />
        ) : (
          <StatusBar barStyle={barStyle} backgroundColor={barColor} />
        )}
        <Fragment>
          {!isConnected && <NoInternetConnection />}
          <Navigation
            ref={navigatorRef => {
              setTopLevelNavigator(navigatorRef);
            }}
          />
        </Fragment>

        {isShowToastNotification && (
          <ToastNotification
            text={toastNotification}
            duration={3000}
            onHide={this._handleOnHideToastNotification}
          />
        )}
      </View>
    );
  }
}

export default connect()(ApplicationScreen);
