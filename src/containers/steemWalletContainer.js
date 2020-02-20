import React, { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import get from 'lodash/get';
import { toastNotification } from '../redux/actions/uiAction';

// Dsteem
import { getAccount, claimRewardBalance, getBtcAddress } from '../providers/steem/dsteem';

// Actions
import { openPinCodeModal } from '../redux/actions/applicationActions';

// Utils
import { groomingWalletData, groomingTransactionData } from '../utils/wallet';
import parseToken from '../utils/parseToken';
import { vestsToSp } from '../utils/conversions';
import { navigate } from '../navigation/service';
import { getEstimatedAmount } from '../utils/vote';

// Constants
import ROUTES from '../constants/routeNames';

const STEEM_DROPDOWN = ['purchase_estm', 'transfer_token', 'transfer_to_saving', 'powerUp'];
const BTC_DROPDOWN = ['transfer_token'];
const SBD_DROPDOWN = ['purchase_estm', 'transfer_token', 'transfer_to_saving', 'convert'];
const SAVING_STEEM_DROPDOWN = ['withdraw_steem'];
const SAVING_SBD_DROPDOWN = ['withdraw_sbd'];
const STEEM_POWER_DROPDOWN = ['delegate', 'power_down'];

const WalletContainer = ({
  children,
  currentAccount,
  globalProps,
  handleOnScroll,
  pinCode,
  selectedUser,
  setEstimatedWalletValue,
  steemPerMVests,
  isPinCodeOpen,
  currency,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [sbdBalance, setSbdBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenAddress, setTokenAddress] = useState('');
  const [steemBalance, setSteemBalance] = useState(0);
  const [spBalance, setSpBalance] = useState(0);
  const [steemSavingBalance, setSteemSavingBalance] = useState(0);
  const [sbdSavingBalance, setSbdSavingBalance] = useState(0);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [estimatedSteemValue, setEstimatedSteemValue] = useState(0);
  const [estimatedSbdValue, setEstimatedSbdValue] = useState(0);
  const [estimatedTokenValue, setEstimatedTokenValue] = useState(0);
  const [estimatedSpValue, setEstimatedSpValue] = useState(0);
  const [unclaimedBalance, setUnclaimedBalance] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [delegationsAmount, setDelegationsAmount] = useState(0);
  const [transferHistory, setTransferHistory] = useState([]);
  const intl = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    setEstimatedAmount(getEstimatedAmount(currentAccount, globalProps));
  }, [currentAccount, globalProps]);

  useEffect(() => {
    _getWalletData(selectedUser);
  }, [_getWalletData, selectedUser]);

  useEffect(() => {
    const _transferHistory = userActivities.filter(
      item =>
        get(item, 'textKey') === 'transfer' ||
        get(item, 'textKey') === 'transfer_to_vesting' ||
        get(item, 'textKey') === 'transfer_to_savings' ||
        get(item, 'textKey') === 'withdraw_vesting' ||
        get(item, 'textKey') === 'transfer_from_savings' ||
        get(item, 'textKey') === 'convert' ||
        get(item, 'textKey') === 'escrow_transfer' ||
        get(item, 'textKey') === 'escrow_dispute' ||
        get(item, 'textKey') === 'escrow_release' ||
        get(item, 'textKey') === 'escrow_approve' ||
        get(item, 'textKey') === 'cancel_transfer_from_savings' ||
        get(item, 'textKey') === 'delegate_vesting_shares' ||
        get(item, 'textKey') === 'fill_convert_request' ||
        get(item, 'textKey') === 'fill_transfer_from_savings' ||
        get(item, 'textKey') === 'fill_vesting_withdraw' ||
        get(item, 'textKey') === 'fill_order',
    );

    setTransferHistory(_transferHistory);
    setSbdBalance(Math.round(get(walletData, 'sbdBalance', 0) * 1000) / 1000);
    setTokenBalance(Math.round(get(walletData, 'tokenBalance', 0) * 1000) / 1000);
    setTokenAddress(get(walletData, 'tokenAddress', ''));
    setSteemBalance(Math.round(get(walletData, 'balance', 0) * 1000) / 1000);
    setSteemSavingBalance(Math.round(get(walletData, 'savingBalance', 0) * 1000) / 1000);
    setSbdSavingBalance(Math.round(get(walletData, 'savingBalanceSbd', 0) * 1000) / 1000);
    setSpBalance(
      Math.round(
        vestsToSp(get(walletData, 'vestingShares', 0), get(walletData, 'steemPerMVests', 0)) * 1000,
      ) / 1000,
    );
    setEstimatedValue(get(walletData, 'estimatedValue', 0));
    setEstimatedSteemValue(get(walletData, 'estimatedSteemValue', 0));
    setEstimatedSbdValue(get(walletData, 'estimatedSbdValue', 0));
    setEstimatedTokenValue(get(walletData, 'estimatedTokenValue', 0));
    setEstimatedSpValue(get(walletData, 'estimatedSpValue', 0));
    setDelegationsAmount(
      vestsToSp(
        get(walletData, 'vestingSharesReceived', 0) - get(walletData, 'vestingSharesDelegated', 0),
        get(walletData, 'steemPerMVests', 0),
      ).toFixed(3),
    );

    if (
      get(walletData, 'rewardSteemBalance', 0) ||
      get(walletData, 'rewardSbdBalance', 0) ||
      get(walletData, 'rewardVestingSteem', 0)
    ) {
      const getBalance = (val, cur) => (val ? Math.round(val * 1000) / 1000 + cur : '');

      setUnclaimedBalance(
        `${getBalance(get(walletData, 'rewardSteemBalance', 0), ' STEEM')} ${getBalance(
          get(walletData, 'rewardSbdBalance', 0),
          ' SBD',
        )} ${getBalance(get(walletData, 'rewardVestingSteem', 0), ' SP')}`,
      );
    }
  }, [userActivities, walletData]);

  // Components functions

  const _getWalletData = useCallback(
    async _selectedUser => {
      const _walletData = await groomingWalletData(_selectedUser, globalProps, currency);

      setWalletData(_walletData);
      setIsLoading(false);
      setUserActivities(
        get(_walletData, 'transactions', []).map(item =>
          groomingTransactionData(item, steemPerMVests),
        ),
      );
      setEstimatedWalletValue && setEstimatedWalletValue(_walletData.estimatedValue);
      const getBalance = (val, cur) => (val ? Math.round(val * 1000) / 1000 + cur : '');
      setUnclaimedBalance(
        `${getBalance(get(_walletData, 'rewardSteemBalance', 0), ' STEEM')} ${getBalance(
          get(_walletData, 'rewardSbdBalance', 0),
          ' SBD',
        )} ${getBalance(get(_walletData, 'rewardVestingSteem', 0), ' SP')}`,
      );
    },
    [globalProps, setEstimatedWalletValue, steemPerMVests],
  );

  const _isHasUnclaimedRewards = account => {
    return (
      parseToken(get(account, 'reward_steem_balance')) > 0 ||
      parseToken(get(account, 'reward_sbd_balance')) > 0 ||
      parseToken(get(account, 'reward_vesting_steem')) > 0
    );
  };

  const _claimRewardBalance = async () => {
    let isHasUnclaimedRewards;

    if (isClaiming) {
      return;
    }

    await setIsClaiming(true);

    getAccount(currentAccount.name)
      .then(account => {
        isHasUnclaimedRewards = _isHasUnclaimedRewards(account[0]);
        if (isHasUnclaimedRewards) {
          const {
            reward_steem_balance: steemBal,
            reward_sbd_balance: sbdBal,
            reward_vesting_balance: vestingBal,
          } = account[0];
          return claimRewardBalance(currentAccount, pinCode, steemBal, sbdBal, vestingBal);
        }
        setIsClaiming(false);
      })
      .then(() => getAccount(currentAccount.name))
      .then(account => {
        _getWalletData(selectedUser);
        if (isHasUnclaimedRewards) {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.claim_reward_balance_ok',
              }),
            ),
          );
        }
      })
      .then(account => {
        _getWalletData(selectedUser);
        setIsClaiming(false);
      })
      .catch(() => {
        setIsClaiming(false);

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
      });
  };

  const _handleOnWalletRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);

    getAccount(selectedUser.name)
      .then(account => {
        _getWalletData(selectedUser);
        setRefreshing(false);
      })
      .catch(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
        setRefreshing(false);
      });
  };

  const _navigate = async (transferType, fundType) => {
    let balance;

    if (
      (transferType === 'transfer_token' || transferType === 'purchase_estm') &&
      fundType === 'STEEM'
    ) {
      balance = Math.round(walletData.balance * 1000) / 1000;
    }
    if (
      (transferType === 'transfer_token' ||
        transferType === 'convert' ||
        transferType === 'purchase_estm') &&
      fundType === 'SBD'
    ) {
      balance = Math.round(walletData.sbdBalance * 1000) / 1000;
    }
    if (transferType === 'withdraw_steem' && fundType === 'STEEM') {
      balance = Math.round(walletData.savingBalance * 1000) / 1000;
    }
    if (transferType === 'withdraw_sbd' && fundType === 'SBD') {
      balance = Math.round(walletData.savingBalanceSbd * 1000) / 1000;
    }

    if (isPinCodeOpen) {
      dispatch(
        openPinCodeModal({
          navigateTo: ROUTES.SCREENS.TRANSFER,
          navigateParams: { transferType, fundType, balance, tokenAddress },
        }),
      );
    } else {
      navigate({
        routeName: ROUTES.SCREENS.TRANSFER,
        params: { transferType, fundType, balance, tokenAddress },
      });
    }
  };

  const getTokenAddress = tokenType => {
    if (tokenType === 'BTC') {
      console.log(getBtcAddress(pinCode, currentAccount));
    }
  };

  return (
    children &&
    children({
      claimRewardBalance: _claimRewardBalance,
      currentAccountUsername: currentAccount.name,
      handleOnWalletRefresh: _handleOnWalletRefresh,
      isClaiming,
      refreshing,
      selectedUsername: get(selectedUser, 'name', ''),
      isLoading,
      walletData,
      steemPerMVests,
      userActivities,
      transferHistory,
      steemBalance,
      spBalance,
      sbdBalance,
      tokenBalance,
      getTokenAddress,
      steemSavingBalance,
      sbdSavingBalance,
      estimatedValue,
      estimatedSteemValue,
      estimatedSbdValue,
      estimatedTokenValue,
      estimatedSpValue,
      delegationsAmount,
      navigate: _navigate,
      steemDropdown: STEEM_DROPDOWN,
      sbdDropdown: SBD_DROPDOWN,
      btcDropdown: BTC_DROPDOWN,
      savingSteemDropdown: SAVING_STEEM_DROPDOWN,
      savingSbdDropdown: SAVING_SBD_DROPDOWN,
      steemPowerDropdown: STEEM_POWER_DROPDOWN,
      unclaimedBalance: unclaimedBalance && unclaimedBalance.trim(),
      estimatedAmount,
    })
  );
};

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  globalProps: state.account.globalProps,
  currency: state.application.currency.currency,
  steemPerMVests: state.account.globalProps.steemPerMVests,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default connect(mapStateToProps)(WalletContainer);
