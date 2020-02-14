import React from 'react';

import { TransferContainer } from '../../containers';

import TransferView from './screen/transferScreen';
import PowerDownView from './screen/powerDownScreen';
import DelegateView from './screen/delegateScreen';

const Transfer = ({ navigation }) => (
  <TransferContainer navigation={navigation}>
    {({
      accounts,
      balance,
      fundType,
      transferType,
      fetchBalance,
      selectedAccount,
      getAccountsWithUsername,
      transferToAccount,
      handleOnModalClose,
      accountType,
      currentAccountName,
      steemPerMVests,
      setWithdrawVestingRoute,
    }) => {
      switch (transferType) {
        case 'transfer_token':
        case 'purchase_estm':
        case 'convert':
        case 'transfer_to_saving':
        case 'powerUp':
        case 'points':
        case 'withdraw_steem':
        case 'withdraw_sbd':
          return (
            <TransferView
              accounts={accounts}
              balance={balance}
              fundType={fundType}
              transferType={transferType}
              fetchBalance={fetchBalance}
              getAccountsWithUsername={getAccountsWithUsername}
              transferToAccount={transferToAccount}
              handleOnModalClose={handleOnModalClose}
              accountType={accountType}
              currentAccountName={currentAccountName}
              selectedAccount={selectedAccount}
            />
          );
        case 'delegate':
          return (
            <DelegateView
              accounts={accounts}
              currentAccountName={currentAccountName}
              selectedAccount={selectedAccount}
              getAccountsWithUsername={getAccountsWithUsername}
              balance={balance}
              fetchBalance={fetchBalance}
              transferToAccount={transferToAccount}
              accountType={accountType}
              handleOnModalClose={handleOnModalClose}
              steemPerMVests={steemPerMVests}
            />
          );
        case 'power_down':
          return (
            <PowerDownView
              accounts={accounts}
              balance={balance}
              fundType={fundType}
              transferType={transferType}
              fetchBalance={fetchBalance}
              getAccountsWithUsername={getAccountsWithUsername}
              transferToAccount={transferToAccount}
              handleOnModalClose={handleOnModalClose}
              accountType={accountType}
              currentAccountName={currentAccountName}
              selectedAccount={selectedAccount}
              steemPerMVests={steemPerMVests}
              setWithdrawVestingRoute={setWithdrawVestingRoute}
            />
          );

        default:
          return null;
      }
    }}
  </TransferContainer>
);

export default Transfer;
