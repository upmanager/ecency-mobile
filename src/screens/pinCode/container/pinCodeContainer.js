import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import { setUserDataWithPinCode, verifyPinCode } from '../../../providers/steem/auth';

// Actions & Services
import { closePinCodeModal } from '../../../redux/actions/applicationActions';
import { getExistUser, setExistUser } from '../../../realm/realm';

import { PinCodeScreen } from '..';

class PinCodeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExistUser: null,
      informationText: '',
      pinCode: null,
    };
  }

  // TODO: if check for decide to set to pin or verify to pin page
  // TODO: these text should move to view!
  componentDidMount() {
    this._getDataFromStorage().then(() => {
      const { intl } = this.props;
      const { isExistUser } = this.state;
      if (isExistUser) {
        this.setState({
          informationText: intl.formatMessage({
            id: 'pincode.enter_text',
          }),
        });
      } else {
        this.setState({
          informationText: intl.formatMessage({
            id: 'pincode.set_new',
          }),
        });
      }
    });
  }

  _getDataFromStorage = () => new Promise((resolve) => {
    getExistUser().then((isExistUser) => {
      this.setState(
        {
          isExistUser,
        },
        resolve,
      );
    });
  });

  _setPinCode = pin => new Promise((resolve, reject) => {
    const {
      currentAccount,
      dispatch,
      accessToken,
      setWrappedComponentState,
      navigateTo,
      navigation,
      intl,
    } = this.props;
    const { isExistUser, pinCode } = this.state;
    if (isExistUser) {
      // If the user is exist, we are just checking to pin and navigating to home screen
      const pinData = {
        pinCode: pin,
        password: currentAccount ? currentAccount.password : '',
        username: currentAccount ? currentAccount.name : '',
        accessToken,
      };
      verifyPinCode(pinData)
        .then((res) => {
          setWrappedComponentState(res);
          dispatch(closePinCodeModal());
          if (navigateTo) {
            navigation.navigate(navigateTo);
          }
        })
        .catch((err) => {
          alert(err);
          reject(err);
        });
    } else if (!pinCode) {
      // If the user is logging in for the first time, the user should set to pin
      this.setState({
        informationText: intl.formatMessage({
          id: 'pincode.write_again',
        }),
        pinCode: pin,
      });
      resolve();
    } else if (pinCode === pin) {
      const pinData = {
        pinCode: pin,
        password: currentAccount.password,
        username: currentAccount.name,
        accessToken,
      };
      setUserDataWithPinCode(pinData).then(() => {
        setExistUser(true).then(() => {
          dispatch(closePinCodeModal());
          if (navigateTo) {
            navigation.navigate(navigateTo);
          }
          resolve();
        });
      });
    } else {
      this.setState({
        informationText: 'wrongggg!!!',
      });
      setTimeout(() => {
        this.setState({
          informationText: 'setup screen',
          pinCode: null,
        });
        resolve();
      }, 1000);
    }
  });

  render() {
    const { currentAccount, intl } = this.props;
    const { informationText, isExistUser } = this.state;
    return (
      <PinCodeScreen
        informationText={informationText}
        setPinCode={this._setPinCode}
        showForgotButton={isExistUser}
        username={currentAccount ? currentAccount.name : 'unknow'}
        avatar={currentAccount.avatar}
        intl={intl}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(PinCodeContainer));
