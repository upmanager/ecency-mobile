import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const SpView = ({ handleOnSelected, index, currentIndex }) => (
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
            steemPowerDropdown,
            unclaimedBalance,
            navigate,
            estimatedAmount,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(userActivities, isLoading)}
              index={index}
              claim={claimRewardBalance}
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
              handleOnDropdownSelected={option => navigate(option, 'STEEM_POWER')}
              type="steem_power"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
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
