import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { navigate } from '../../../navigation/service';

import { removeOtherAccount, updateCurrentAccount } from '../../../redux/actions/accountAction';
import { isPinCodeOpen, isRenderRequired, login, logout, logoutDone } from '../../../redux/actions/applicationActions';

import { getUserDataWithUsername, removeAllUserData, removePinCode, setAuthStatus, setExistUser, setPinCodeOpen } from '../../../realm/realm';
import {
  migrateToMasterKeyWithAccessToken,
  refreshSCToken,
  switchAccount,
} from '../../../providers/hive/auth';

import AccountsBottomSheet from '../view/accountsBottomSheetView';
import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

//Constants
import AUTH_TYPE from '../../../constants/authType';
import { getDigitPinCode } from '../../../providers/hive/dhive';
import { setFeedPosts, setInitPosts } from '../../../redux/actions/postsAction';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useAppSelector } from '../../../hooks';

const AccountsBottomSheetContainer = ({ navigation }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const accountsBottomSheetViewRef = useRef();

  const isVisibleAccountsBottomSheet = useAppSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const accounts = useAppSelector((state) => state.account.otherAccounts);
  const pinHash = useAppSelector((state) => state.application.pin);

  useEffect(() => {
    if (isVisibleAccountsBottomSheet) {
      accountsBottomSheetViewRef.current?.showAccountsBottomSheet();
    }
  }, [isVisibleAccountsBottomSheet]);

  const _navigateToRoute = (routeName = null) => {
    dispatch(toggleAccountsBottomSheet(false));
    accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    if (routeName) {
      navigate({ routeName });
    }
  };

  const _onClose = () => {
    dispatch(toggleAccountsBottomSheet(false));
  };

  const _switchAccount = async (account = {}) => {
    dispatch(toggleAccountsBottomSheet(false));
    accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    if (currentAccount && account && account.username !== currentAccount.name) {
      _handleSwitch(account);
    }
  };

  const _logout = async () => {
    dispatch(logout());
  };


  const _handleSwitch = async (switchingAccount = {}) => {
    try {
      const accountData = accounts.filter(
        (account) => account.username === switchingAccount.username,
      )[0];

      // if account data has persistet content use that first
      //to avoid lag
      if (accountData.name) {
        accountData.username = accountData.name;
        dispatch(updateCurrentAccount(accountData));
      }

      //fetch upto data account data nd update current account;
      let _currentAccount = await switchAccount(accountData.username);
      const realmData = await getUserDataWithUsername(accountData.username);

      _currentAccount.username = _currentAccount.name;
      _currentAccount.local = realmData[0];

      //migreate account to use access token for master key auth type
      if (realmData[0].authType === AUTH_TYPE.MASTER_KEY && realmData[0].accessToken === '') {
        _currentAccount = await migrateToMasterKeyWithAccessToken(_currentAccount, pinHash);
      }

      //refresh access token
      const encryptedAccessToken = await refreshSCToken(
        _currentAccount.local,
        getDigitPinCode(pinHash),
      );
      _currentAccount.local.accessToken = encryptedAccessToken;

      dispatch(updateCurrentAccount(_currentAccount));
    }

    catch(error){
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.message,
        [
          { text: intl.formatMessage({ id: 'side_menu.logout' }), onPress: () => _logout() },
          { text: intl.formatMessage({ id: 'alert.cancel' }), style: 'destructive' },
        ],
      );
    }
  };

  return (
    <AccountsBottomSheet
      ref={accountsBottomSheetViewRef}
      accounts={accounts}
      currentAccount={currentAccount}
      navigateToRoute={_navigateToRoute}
      switchAccount={_switchAccount}
      onClose={_onClose}
    />
  );
};

export default AccountsBottomSheetContainer;
