import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Dsteem
import { getAccount, claimRewardBalance } from '../../../providers/steem/dsteem';

// Utils
import { groomingWalletData } from '../../../utils/wallet';

// Component
import WalletView from '../view/walletView';

/*
 *            Props Name               Description            Value
 * @props -->  currentAccountUsername   description here      Value Type Here
 @ props -->   selectedUsername
 @ props -->   walletData
 *
 */

class WalletContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletData: null,
      claiming: false,
      isRefreshing: false,
    };
  }

  componentDidMount() {
    const { selectedUser } = this.props;

    this._getWalletData(selectedUser);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedUser } = this.props;

    if (selectedUser.name !== nextProps.selectedUser.name) {
      this._getWalletData(nextProps.selectedUser);
    }
  }

  // Components functions

  _getWalletData = async (selectedUser) => {
    const walletData = await groomingWalletData(selectedUser);

    this.setState({ walletData });
  };

  _claimRewardBalance = () => {
    const { currentAccount, intl, pinCode } = this.props;
    const { claiming } = this.state;

    if (claiming) {
      return;
    }

    this.setState({ claiming: true });

    getAccount(currentAccount.name)
      .then((account) => {
        const {
          reward_steem_balance: steemBal,
          reward_sbd_balance: sbdBal,
          reward_vesting_balance: vestingBal,
        } = account[0];

        return claimRewardBalance(currentAccount, pinCode, steemBal, sbdBal, vestingBal);
      })
      .then(() => getAccount(currentAccount.name))
      .then((account) => {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.claim_reward_balance_ok',
          }),
        );
        this._getWalletData(account && account[0]);
      })
      .then((account) => {
        this._getWalletData(account && account[0]);
      })
      .catch((err) => {
        Alert.alert(err);
      })
      .finally(() => {
        this.setState({ claiming: false });
      });
  };

  _handleOnWalletRefresh = () => {
    const { selectedUser } = this.props;
    this.setState({ isRefreshing: true });

    getAccount(selectedUser.name)
      .then((account) => {
        this._getWalletData(account && account[0]);
      })
      .catch((err) => {
        Alert.alert(err);
      })
      .finally(() => {
        this.setState({ isRefreshing: false });
      });
  };

  render() {
    const { currentAccount, selectedUser } = this.props;
    const { walletData, claiming, isRefreshing } = this.state;

    return (
      <WalletView
        currentAccountUsername={currentAccount.name}
        selectedUsername={selectedUser && selectedUser.name}
        walletData={walletData}
        claimRewardBalance={this._claimRewardBalance}
        claiming={claiming}
        handleOnWalletRefresh={this._handleOnWalletRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin,
});

export default injectIntl(connect(mapStateToProps)(WalletContainer));
