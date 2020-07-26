/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { useIntl } from 'react-intl';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import get from 'lodash/get';

// Utilities
import { getTimeFromNow } from '../../utils/time';

// Components
import { WalletLineItem, ListPlaceHolder } from '../basicUIElements';
import { CollapsibleCard } from '..';
import { ThemeContainer } from '../../containers';

import globalStyles from '../../globalStyles';

const TransactionView = ({ transactions, type, refreshing, setRefreshing, isLoading }) => {
  const intl = useIntl();
  const transaction_types = ['Points', 'HIVE', 'HBD', 'HP'];

  const _renderLoading = () => {
    if (isLoading) {
      return <ListPlaceHolder />;
    }

    return (
      <Text style={globalStyles.hintText}>{intl.formatMessage({ id: 'wallet.no_activity' })}</Text>
    );
  };

  const refreshControl = () => (
    <ThemeContainer>
      {(isDarkTheme) => (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => setRefreshing(true)}
          progressBackgroundColor="#357CE6"
          tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
          titleColor="#fff"
          colors={['#fff']}
        />
      )}
    </ThemeContainer>
  );

  const _renderItem = (item, index) => {
    return (
      Object.keys(item).length > 0 &&
      item.value.indexOf(transaction_types[type]) > -1 && (
        <CollapsibleCard
          key={`keyh-${item.created.toString()}`}
          noBorder
          noContainer
          titleComponent={
            <WalletLineItem
              key={`keyt-${item.created.toString()}`}
              index={index + 1}
              text={intl.formatMessage({
                id: `wallet.${get(item, 'textKey')}`,
              })}
              description={getTimeFromNow(get(item, 'created'))}
              isCircleIcon
              isThin
              circleIconColor="white"
              isBlackText
              iconName={get(item, 'icon')}
              iconType={get(item, 'iconType')}
              rightText={get(item, 'value', '').trim()}
            />
          }
        >
          {(get(item, 'details') || get(item, 'memo')) && (
            <WalletLineItem
              key={`keyd-${item.created.toString()}`}
              text={get(item, 'details', '')}
              isBlackText
              isThin
              description={get(item, 'memo')}
            />
          )}
        </CollapsibleCard>
      )
    );
  };

  return (
    <View style={globalStyles.listWrapper}>
      <FlatList
        data={transactions}
        style={globalStyles.tabBarBottom}
        ListEmptyComponent={_renderLoading()}
        onRefresh={refreshControl}
        refreshing={refreshing}
        renderItem={({ item, index }) => _renderItem(item, index)}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default TransactionView;
/* eslint-enable */
