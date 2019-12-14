/* eslint-disable react/no-unused-state */
import React, { Fragment, Component } from 'react';
import { Text, View, ScrollView, Alert } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';
import Slider from 'react-native-slider';
import get from 'lodash/get';

import { getWithdrawRoutes } from '../../../providers/steem/dsteem';
import AUTH_TYPE from '../../../constants/authType';

import {
  BasicHeader,
  TransferFormItem,
  MainButton,
  DropdownButton,
  Modal,
  SquareButton,
  InformationBox,
  Icon,
  IconButton,
} from '../../../components';
import WithdrawAccountModal from './withdrawAccountModal';

import parseToken from '../../../utils/parseToken';
import parseDate from '../../../utils/parseDate';
import { vestsToSp } from '../../../utils/conversions';
import { isEmptyDate } from '../../../utils/time';

import styles from './transferStyles';
/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

class PowerDownView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.currentAccountName,
      amount: 0,
      steemConnectTransfer: false,
      isTransfering: false,
      isOpenWithdrawAccount: false,
      destinationAccounts: [],
    };

    this.startActionSheet = React.createRef();
    this.stopActionSheet = React.createRef();
  }

  // Component Functions

  _fetchRoutes = username => {
    return getWithdrawRoutes(username)
      .then(res => {
        const accounts = res.map(item => ({
          username: item.to_account,
          percent: item.percent,
          autoPowerUp: item.auto_vest,
        }));
        this.setState({
          destinationAccounts: accounts,
        });
        return res;
      })
      .catch(e => {
        alert(e.message || e.toString());
      });
  };

  _handleTransferAction = () => {
    const { transferToAccount, accountType, intl } = this.props;
    const { from, destinationAccounts, amount } = this.state;

    this.setState({ isTransfering: true });

    if (accountType === AUTH_TYPE.STEEM_CONNECT) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.warning' }),
        intl.formatMessage({ id: 'transfer.sc_power_down_error' }),
      );
    } else {
      transferToAccount(from, destinationAccounts, amount, '');
    }
  };

  _renderDropdown = (accounts, currentAccountName) => (
    <DropdownButton
      dropdownButtonStyle={styles.dropdownButtonStyle}
      rowTextStyle={styles.rowTextStyle}
      style={styles.dropdown}
      dropdownStyle={styles.dropdownStyle}
      textStyle={styles.dropdownText}
      options={accounts.map(item => item.username)}
      defaultText={currentAccountName}
      selectedOptionIndex={accounts.findIndex(item => item.username === currentAccountName)}
      onSelect={(index, value) => this._handleOnDropdownChange(value)}
    />
  );

  _renderDestinationAccountItems = () => {
    const { destinationAccounts } = this.state;

    if (destinationAccounts.length <= 0) {
      return this._renderButton();
    }
    return (
      <Fragment>
        {destinationAccounts.map(item => (
          <View style={styles.destinationAccountsLists} key={item.username}>
            <Text>{item.username}</Text>
            <IconButton
              style={styles.iconButton}
              size={20}
              iconStyle={styles.crossIcon}
              iconType="MaterialIcons"
              name="clear"
              onPress={() => this._removeDestinationAccount(item)}
            />
          </View>
        ))}
        {this._renderButton()}
      </Fragment>
    );
  };

  _removeDestinationAccount = account => {
    const { destinationAccounts } = this.state;
    const { setWithdrawVestingRoute, currentAccountName } = this.props;

    const result = destinationAccounts.filter(item => item.username !== account.username);

    setWithdrawVestingRoute(currentAccountName, account.username, 0, false);
    this.setState({ destinationAccounts: result });
  };

  _renderButton = () => (
    <SquareButton
      style={styles.formButton}
      textStyle={styles.formButtonText}
      onPress={() => this.setState({ isOpenWithdrawAccount: true })}
      text="Add withdraw account"
    />
  );

  _renderInformationText = text => <Text style={styles.amountText}>{text}</Text>;

  _renderIncomingFunds = (poweringDownFund, poweringDownVests, nextPowerDown) => (
    <Fragment>
      <Text style={styles.incomingFundSteem}>{`+ ${poweringDownFund} STEEM`}</Text>
      <Text style={styles.incomingFundVests}>{`- ${poweringDownVests} VESTS`}</Text>
      <Text style={styles.nextPowerDown}>{nextPowerDown}</Text>
    </Fragment>
  );

  _handleOnDropdownChange = value => {
    const { fetchBalance } = this.props;

    fetchBalance(value);
    this._fetchRoutes(value);
    this.setState({ from: value, amount: 0 });
  };

  _renderDescription = text => <Text style={styles.description}>{text}</Text>;

  _handleOnSubmit = (username, percent, autoPowerUp) => {
    const { destinationAccounts } = this.state;
    const { setWithdrawVestingRoute, currentAccountName, intl } = this.props;

    if (!destinationAccounts.some(item => item.username === username)) {
      destinationAccounts.push({ username, percent, autoPowerUp });
      setWithdrawVestingRoute(currentAccountName, username, percent, autoPowerUp);
      this.setState({
        isOpenWithdrawAccount: false,
        destinationAccounts,
      });
    } else {
      Alert.alert(
        intl.formatMessage({ id: 'alert.fail' }),
        intl.formatMessage({ id: 'alert.same_user' }),
      );
    }
  };

  // Component Life Cycles
  UNSAFE_componentWillMount() {
    const { currentAccountName } = this.props;

    this._fetchRoutes(currentAccountName);
  }

  render() {
    const {
      accounts,
      selectedAccount,
      intl,
      getAccountsWithUsername,
      transferType,
      currentAccountName,
      steemPerMVests,
    } = this.props;
    const { amount, isTransfering, isOpenWithdrawAccount } = this.state;
    let poweringDownVests = 0;
    let availableVestingShares = 0;
    let poweringDownFund = 0;

    const poweringDown = !isEmptyDate(get(selectedAccount, 'next_vesting_withdrawal'));
    const nextPowerDown = parseDate(get(selectedAccount, 'next_vesting_withdrawal'));

    if (poweringDown) {
      poweringDownVests = parseToken(get(selectedAccount, 'vesting_withdraw_rate'));
      poweringDownFund = vestsToSp(poweringDownVests, steemPerMVests).toFixed(3);
    } else {
      availableVestingShares =
        parseToken(get(selectedAccount, 'vesting_shares')) -
        (Number(get(selectedAccount, 'to_withdraw')) - Number(get(selectedAccount, 'withdrawn'))) /
          1e6 -
        parseToken(get(selectedAccount, 'delegated_vesting_shares'));
    }

    const spCalculated = vestsToSp(amount, steemPerMVests);
    const fundPerWeek = Math.round((spCalculated / 13) * 1000) / 1000;

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: `transfer.${transferType}` })} />
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.middleContent}>
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.from' })}
                rightComponent={() => this._renderDropdown(accounts, currentAccountName)}
              />
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.destination_accounts' })}
                rightComponent={this._renderDestinationAccountItems}
              />
              {!poweringDown && (
                <Fragment>
                  <TransferFormItem
                    label={intl.formatMessage({ id: 'transfer.amount' })}
                    rightComponent={() => this._renderInformationText(`${amount.toFixed(6)} VESTS`)}
                  />
                  <Slider
                    style={styles.slider}
                    trackStyle={styles.track}
                    thumbStyle={styles.thumb}
                    minimumTrackTintColor="#357ce6"
                    thumbTintColor="#007ee5"
                    maximumValue={availableVestingShares}
                    value={amount}
                    onValueChange={value => {
                      this.setState({ amount: value });
                    }}
                  />
                  <Text style={styles.informationText}>
                    {intl.formatMessage({ id: 'transfer.amount_information' })}
                  </Text>
                </Fragment>
              )}
              {poweringDown && (
                <Fragment>
                  <TransferFormItem
                    label={intl.formatMessage({ id: 'transfer.incoming_funds' })}
                    rightComponent={() =>
                      this._renderIncomingFunds(
                        poweringDownFund,
                        poweringDownVests,
                        nextPowerDown.toLocaleString(),
                      )
                    }
                  />
                </Fragment>
              )}
            </View>
            <View style={styles.bottomContent}>
              {!poweringDown && (
                <Fragment>
                  <View style={styles.informationView}>
                    <InformationBox
                      style={styles.spInformation}
                      text={`- ${spCalculated.toFixed(3)} SP`}
                    />
                    <InformationBox
                      style={styles.vestsInformation}
                      text={`- ${amount.toFixed(0)} VESTS`}
                    />
                  </View>
                  <Icon
                    style={styles.icon}
                    size={40}
                    iconType="MaterialIcons"
                    name="arrow-downward"
                  />
                  <InformationBox
                    style={styles.steemInformation}
                    text={`+ ${fundPerWeek.toFixed(3)} STEEM`}
                  />
                  <Text style={styles.informationText}>
                    {intl.formatMessage({ id: 'transfer.estimated_weekly' })}
                  </Text>
                  <MainButton
                    style={styles.button}
                    isDisable={amount <= 0}
                    onPress={() => this.startActionSheet.current.show()}
                    isLoading={isTransfering}
                  >
                    <Text style={styles.buttonText}>
                      {intl.formatMessage({ id: 'transfer.next' })}
                    </Text>
                  </MainButton>
                </Fragment>
              )}
              {poweringDown && (
                <MainButton
                  style={styles.stopButton}
                  onPress={() => this.stopActionSheet.current.show()}
                  isLoading={isTransfering}
                >
                  <Text style={styles.buttonText}>
                    {intl.formatMessage({ id: 'transfer.stop' })}
                  </Text>
                </MainButton>
              )}
            </View>
          </ScrollView>
        </View>
        <ActionSheet
          ref={this.startActionSheet}
          options={[
            intl.formatMessage({ id: 'alert.confirm' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'transfer.information' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={index => (index === 0 ? this._handleTransferAction() : null)}
        />
        <ActionSheet
          ref={this.stopActionSheet}
          options={[
            intl.formatMessage({ id: 'alert.confirm' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'transfer.stop_information' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={index =>
            index === 0 ? this.setState({ amount: 0 }, this._handleTransferAction()) : null
          }
        />
        <Modal
          isOpen={isOpenWithdrawAccount}
          isCloseButton
          isFullScreen
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
          handleOnModalClose={() => this.setState({ isOpenWithdrawAccount: false })}
        >
          <WithdrawAccountModal
            getAccountsWithUsername={getAccountsWithUsername}
            handleOnSubmit={this._handleOnSubmit}
          />
        </Modal>
      </Fragment>
    );
  }
}

export default injectIntl(PowerDownView);
/* eslint-enable */
