import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const SbdView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <AccountContainer>
      {({ currentAccount }) => (
        <SteemWalletContainer selectedUser={currentAccount}>
          {({
            isClaiming,
            claimRewardBalance,
            handleOnWalletRefresh,
            refreshing,
            transferHistory,
            sbdBalance,
            isLoading,
            sbdSavingBalance,
            estimatedSbdValue,
            sbdDropdown,
            savingSbdDropdown,
            navigate,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(transferHistory, isLoading)}
              index={index}
              claim={claimRewardBalance}
              reload={reload}
              fetchUserActivity={handleOnWalletRefresh}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              unclaimedBalance={0}
              userBalance={[
                { balance: sbdBalance, nameKey: 'sbd', options: sbdDropdown },
                { balance: sbdSavingBalance, nameKey: 'savingsbd', options: savingSbdDropdown },
              ]}
              handleOnDropdownSelected={option => navigate(option, 'HBD')}
              type="sbd"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'estimated_value',
                  value: <FormattedCurrency isApproximate isToken value={estimatedSbdValue} />,
                  subTextKey: 'estimated_value_desc',
                },
              ]}
            />
          )}
        </SteemWalletContainer>
      )}
    </AccountContainer>
  </View>
);

export default SbdView;
