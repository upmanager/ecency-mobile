import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import Config from 'react-native-config';

// Actions & Services
import {
  setUserDataWithPinCode,
  verifyPinCode,
  updatePinCode,
} from '../../../providers/steem/auth';
import { closePinCodeModal } from '../../../redux/actions/applicationActions';
import { getExistUser, setExistUser, getUserDataWithUsername } from '../../../realm/realm';
import {
  updateCurrentAccount,
  setPinCode as savePinCode,
} from '../../../redux/actions/accountAction';
import { getUser } from '../../../providers/steem/dsteem';

// Utils
import { encryptKey, decryptKey } from '../../../utils/crypto';

// Component
import PinCodeScreen from '../screen/pinCodeScreen';

class PinCodeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExistUser: null,
      informationText: '',
      pinCode: null,
      isOldPinVerified: false,
      oldPinCode: null,
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

  _resetPinCode = pin => new Promise((resolve, reject) => {
    const {
      currentAccount, dispatch, accessToken, navigateTo, navigation, intl,
    } = this.props;
    const { isOldPinVerified, oldPinCode } = this.state;

    const pinData = {
      pinCode: pin,
      password: currentAccount ? currentAccount.password : '',
      username: currentAccount ? currentAccount.name : '',
      accessToken,
      oldPinCode,
    };

    if (isOldPinVerified) {
      updatePinCode(pinData).then((response) => {
        const _currentAccount = currentAccount;
        _currentAccount.local = response;

        dispatch(updateCurrentAccount({ ..._currentAccount }));
        this._savePinCode(pin);

        dispatch(closePinCodeModal());
        if (navigateTo) {
          navigation.navigate(navigateTo);
        }
        resolve();
      });
    } else {
      verifyPinCode(pinData)
        .then(() => {
          this.setState({ isOldPinVerified: true });
          this.setState({
            informationText: intl.formatMessage({
              id: 'pincode.set_new',
            }),
            pinCode: null,
            oldPinCode: pin,
          });
          resolve();
        })
        .catch((err) => {
          Alert.alert(intl.formatMessage({
            id: 'alert.warning',
          }), err.message);
          reject(err);
        });
    }
  });

  _setFirstPinCode = pin => new Promise((resolve) => {
    const {
      currentAccount, dispatch, accessToken, navigateTo, navigation,
    } = this.props;

    const pinData = {
      pinCode: pin,
      password: currentAccount ? currentAccount.password : '',
      username: currentAccount ? currentAccount.name : '',
      accessToken,
    };
    setUserDataWithPinCode(pinData).then((response) => {
      getUser(currentAccount.name).then((user) => {
        const _currentAccount = user;
        _currentAccount.local = response;

        dispatch(updateCurrentAccount({ ..._currentAccount }));

        setExistUser(true).then(() => {
          this._savePinCode(pin);
          dispatch(closePinCodeModal());
          if (navigateTo) {
            navigation.navigate(navigateTo);
          }
          resolve();
        });
      });
    });
  });

  _verifyPinCode = pin => new Promise((resolve, reject) => {
    const {
      currentAccount,
      dispatch,
      accessToken,
      navigateTo,
      navigation,
      intl,
    } = this.props;

    // If the user is exist, we are just checking to pin and navigating to home screen
    const pinData = {
      pinCode: pin,
      password: currentAccount ? currentAccount.password : '',
      username: currentAccount ? currentAccount.name : '',
      accessToken,
    };
    verifyPinCode(pinData)
      .then(() => {
        this._savePinCode(pin);
        const realmData = getUserDataWithUsername(currentAccount.name);
        const _currentAccount = currentAccount;
        _currentAccount.username = _currentAccount.name;
        [_currentAccount.local] = realmData;
        dispatch(updateCurrentAccount({ ..._currentAccount }));
        dispatch(closePinCodeModal());
        if (navigateTo) {
          navigation.navigate(navigateTo);
        }
      })
      .catch((err) => {
        Alert.alert(intl.formatMessage({
          id: 'alert.warning',
        }), err.message);
        reject(err);
      });
  });

  _savePinCode = (pin) => {
    const { dispatch } = this.props;
    const encryptedPin = encryptKey(pin, Config.PIN_KEY);
    dispatch(savePinCode(encryptedPin));
  };

  _setPinCode = async (pin, isReset) => {
    const { intl, currentAccount, applicationPinCode } = this.props;
    const { isExistUser, pinCode } = this.state;

    const realmData = getUserDataWithUsername(currentAccount.name);
    const userData = realmData[0];

    // For exist users
    if (isReset) {
      await this._resetPinCode(pin);
      return true;
    }
    if (isExistUser) {
      if (!userData.accessToken && !userData.masterKey && applicationPinCode) {
        const verifiedPin = decryptKey(applicationPinCode, Config.PIN_KEY);
        if (verifiedPin === pin) {
          await this._setFirstPinCode(pin);
        } else {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.warning',
            }),
            intl.formatMessage({
              id: 'alert.invalid_pincode',
            }),
          );
        }
      } else {
        await this._verifyPinCode(pin);
      }
      return true;
    }

    // For new users
    if (pinCode === pin) {
      await this._setFirstPinCode(pin);
      return true;
    }

    if (!pinCode) {
      // If the user is logging in for the first time, the user should set to pin
      await this.setState({
        informationText: intl.formatMessage({
          id: 'pincode.write_again',
        }),
        pinCode: pin,
      });
      return Promise.resolve();
    }

    await this.setState({
      informationText: intl.formatMessage({
        id: 'pincode.write_again',
      }),
    });
    await setTimeout(() => {
      this.setState({
        informationText: intl.formatMessage({
          id: 'pincode.set_new',
        }),
        pinCode: null,
      });
      return Promise.resolve();
    }, 1000);
  };

  render() {
    const { currentAccount, intl, isReset } = this.props;
    const { informationText, isExistUser } = this.state;
    return (
      <PinCodeScreen
        informationText={informationText}
        setPinCode={pin => this._setPinCode(pin, isReset)}
        showForgotButton={isExistUser}
        username={currentAccount.name}
        intl={intl}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  applicationPinCode: state.account.pin,
});

export default injectIntl(connect(mapStateToProps)(PinCodeContainer));
