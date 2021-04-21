import React, { Fragment, Component, useState, useRef, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { hsOptions } from '../../../constants/hsOptions';
import AUTH_TYPE from '../../../constants/authType';

import {
  BasicHeader,
  TextInput,
  TransferFormItem,
  MainButton,
  DropdownButton,
  UserAvatar,
  Icon,
  Modal,
} from '../../../components';

import styles from './transferStyles';

const TransferView = ({
  currentAccountName,
  transferType,
  getAccountsWithUsername,
  balance,
  transferToAccount,
  accountType,
  accounts,
  intl,
  handleOnModalClose,
  fundType,
  selectedAccount,
  fetchBalance,
}) => {
  const [from, setFrom] = useState(currentAccountName);
  const [destination, setDestination] = useState(
    transferType === 'transfer_to_vesting' ||
      transferType === 'transfer_to_savings' ||
      transferType === 'withdraw_vesting' ||
      transferType === 'withdraw_hive' ||
      transferType === 'withdraw_hbd' ||
      transferType === 'convert'
      ? currentAccountName
      : transferType === 'purchase_estm'
      ? 'esteem.app'
      : '',
  );
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState(transferType === 'purchase_estm' ? 'estm-purchase' : '');
  const [isUsernameValid, setIsUsernameValid] = useState(
    !!(
      transferType === 'purchase_estm' ||
      transferType === 'transfer_to_vesting' ||
      transferType === 'transfer_to_savings' ||
      transferType === 'withdraw_vesting' ||
      transferType === 'withdraw_hive' ||
      transferType === 'withdraw_hbd' ||
      (transferType === 'convert' && currentAccountName)
    ),
  );
  const [hsTransfer, setHsTransfer] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);
  const confirm = useRef(null);

  //useEffect(() => {
  //}, []);

  const _handleTransferAction = () => {
    setIsTransfering(true);
    if (accountType === AUTH_TYPE.STEEM_CONNECT) {
      setHsTransfer(true);
    } else {
      transferToAccount(from, destination, amount, memo);
    }
  };

  const _handleOnChange = (state, val) => {
    let _amount = val.toString();
    if (_amount.includes(',')) {
      _amount = val.replace(',', '.');
    }
    if (state === 'amount') {
      if (parseFloat(Number(_amount)) <= parseFloat(balance)) {
        setAmount(_amount);
      }
    }
    if (state === 'destination') {
      getAccountsWithUsername(val).then((res) => {
        const isValid = res.includes(val);

        setIsUsernameValid(isValid);
      });
      setDestination(_amount);
    }
    if (state === 'memo') {
      setMemo(_amount);
    }
  };

  const _renderInput = (placeholder, state, keyboardType, isTextArea) => (
    <TextInput
      style={[isTextArea ? styles.textarea : styles.input]}
      onChangeText={(amount) => _handleOnChange(state, amount)}
      value={
        state === 'destination'
          ? destination
          : state === 'amount'
          ? amount
          : state === 'memo'
          ? memo
          : ''
      }
      placeholder={placeholder}
      placeholderTextColor="#c1c5c7"
      autoCapitalize="none"
      multiline={isTextArea}
      numberOfLines={isTextArea ? 4 : 1}
      keyboardType={keyboardType}
    />
  );
  const _renderDropdown = (accounts, currentAccountName) => (
    <DropdownButton
      dropdownButtonStyle={styles.dropdownButtonStyle}
      rowTextStyle={styles.rowTextStyle}
      style={styles.dropdown}
      dropdownStyle={styles.dropdownStyle}
      textStyle={styles.dropdownText}
      options={accounts.map((item) => item.username)}
      defaultText={currentAccountName}
      selectedOptionIndex={accounts.findIndex((item) => item.username === currentAccountName)}
      onSelect={(index, value) => _handleOnDropdownChange(value)}
    />
  );

  const _handleOnDropdownChange = (value) => {
    fetchBalance(value);
    setFrom(value);
    if (transferType === 'convert') {
      setDestination(value);
    }
  };

  const _renderDescription = (text) => <Text style={styles.description}>{text}</Text>;
  let path;
  if (hsTransfer) {
    if (transferType === 'points') {
      const json = JSON.stringify({
        sender: get(selectedAccount, 'name'),
        receiver: destination,
        amount: `${Number(amount).toFixed(3)} ${fundType}`,
        memo,
      });
      path = `sign/custom-json?authority=active&required_auths=%5B%22${get(
        selectedAccount,
        'name',
      )}%22%5D&required_posting_auths=%5B%5D&id=esteem_point_transfer&json=${encodeURIComponent(
        json,
      )}`;
    } else if (transferType === 'transfer_to_savings') {
      path = `sign/transfer_to_savings?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    } else if (transferType === 'delegate_vesting_shares') {
      path = `sign/delegate_vesting_shares?delegator=${currentAccountName}&delegatee=${destination}&vesting_shares=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (transferType === 'transfer_to_vesting') {
      path = `sign/transfer_to_vesting?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (transferType === 'withdraw_hive' || transferType === 'withdraw_hbd') {
      path = `sign/transfer_from_savings?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&request_id=${new Date().getTime() >>> 0}`;
    } else if (transferType === 'convert') {
      path = `sign/convert?owner=${currentAccountName}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&requestid=${new Date().getTime() >>> 0}`;
    } else if (transferType === 'withdraw_vesting') {
      path = `sign/withdraw_vesting?account=${currentAccountName}&vesting_shares=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else {
      path = `sign/transfer?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    }
  }
  return (
    <Fragment>
      <BasicHeader title={intl.formatMessage({ id: `transfer.${transferType}` })} />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.topContent}>
            <UserAvatar username={from} size="xl" style={styles.userAvatar} noAction />
            <Icon style={styles.icon} name="arrow-forward" iconType="MaterialIcons" />
            <UserAvatar username={destination} size="xl" style={styles.userAvatar} noAction />
          </View>
          <View style={styles.middleContent}>
            <TransferFormItem
              label={intl.formatMessage({ id: 'transfer.from' })}
              rightComponent={() => _renderDropdown(accounts, currentAccountName)}
            />
            {transferType !== 'convert' && (
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.to' })}
                rightComponent={() =>
                  _renderInput(
                    intl.formatMessage({ id: 'transfer.to_placeholder' }),
                    'destination',
                    'default',
                  )
                }
              />
            )}
            <TransferFormItem
              label={intl.formatMessage({ id: 'transfer.amount' })}
              rightComponent={() =>
                _renderInput(intl.formatMessage({ id: 'transfer.amount' }), 'amount', 'numeric')
              }
            />
            <TransferFormItem
              rightComponent={() => (
                <TouchableOpacity onPress={() => _handleOnChange('amount', balance)}>
                  {_renderDescription(
                    `${intl.formatMessage({
                      id: 'transfer.amount_desc',
                    })} ${balance} ${fundType === 'ESTM' ? 'Points' : fundType}`,
                  )}
                </TouchableOpacity>
              )}
            />
            {(transferType === 'points' ||
              transferType === 'transfer_token' ||
              transferType === 'transfer_to_savings') && (
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.memo' })}
                rightComponent={() =>
                  _renderInput(
                    intl.formatMessage({ id: 'transfer.memo_placeholder' }),
                    'memo',
                    'default',
                    true,
                  )
                }
              />
            )}
            {(transferType === 'points' || transferType === 'transfer_token') && (
              <TransferFormItem
                rightComponent={() =>
                  _renderDescription(intl.formatMessage({ id: 'transfer.memo_desc' }))
                }
              />
            )}
            {transferType === 'convert' && (
              <TransferFormItem
                rightComponent={() =>
                  _renderDescription(intl.formatMessage({ id: 'transfer.convert_desc' }))
                }
              />
            )}
          </View>
          <View style={styles.bottomContent}>
            <MainButton
              style={styles.button}
              isDisable={!(amount >= 0.001 && isUsernameValid)}
              onPress={() => confirm.current.show()}
              isLoading={isTransfering}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
          </View>
        </ScrollView>
      </View>
      <ActionSheet
        ref={confirm}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'transfer.information' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          index === 0 ? _handleTransferAction() : null;
        }}
      />
      {path && (
        <Modal
          isOpen={hsTransfer}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${hsOptions.base_url}${path}` }} />
        </Modal>
      )}
    </Fragment>
  );
};

export default injectIntl(TransferView);
