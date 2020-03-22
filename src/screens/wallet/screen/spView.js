import React from 'react';
import { View, Text } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const SpView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <AccountContainer>
      {({ currentAccount }) => (
        <SteemWalletContainer selectedUser={currentAccount}>
          {({
            isClaiming,
            claimRewardBalance,
            handleOnWalletRefresh,
            refreshing,
            userActivities,
            spBalance,
            isLoading,
            estimatedSpValue,
            delegationsAmount,
            steemPowerDropdown,
            unclaimedBalance,
            navigate,
            estimatedAmount,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(userActivities, isLoading)}
              index={index}
              claim={claimRewardBalance}
              reload={reload}
              fetchUserActivity={handleOnWalletRefresh}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              userActivities={userActivities}
              unclaimedBalance={unclaimedBalance}
              showBuyButton={unclaimedBalance.length > 0}
              userBalance={[
                { balance: spBalance, nameKey: 'steem_power', options: steemPowerDropdown },
              ]}
              handleOnDropdownSelected={option => navigate(option, 'HIVE_POWER')}
              type="steem_power"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'delegations',
                  value: (
                    <Text>
                      {delegationsAmount}
                      {' HP'}
                    </Text>
                  ),
                },
                {
                  textKey: 'estimated_value',
                  value: <FormattedCurrency isApproximate isToken value={estimatedSpValue} />,
                },
                {
                  textKey: 'estimated_amount',
                  value: <FormattedCurrency isApproximate value={estimatedAmount} />,
                },
              ]}
            />
          )}
        </SteemWalletContainer>
      )}
    </AccountContainer>
  </View>
);

export default SpView;
