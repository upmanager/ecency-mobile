import React from 'react';
import { SafeAreaView, FlatList, Text } from 'react-native';
import { withNavigation } from 'react-navigation';
import { useIntl } from 'react-intl';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { EmptyScreen, UserListItem } from '../../basicUIElements';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './votersDisplayStyles';

const VotersDisplayView = ({ votes, navigation, createdAt = '2010-01-01T00:00:00' }) => {
  const intl = useIntl();

  /*getActiveVotes(get(content, 'author'), get(content, 'permlink'))
    .then((result) => {
      result.sort((a, b) => b.rshares - a.rshares);

      const _votes = parseActiveVotes({ ...content, active_votes: result });
      setActiveVotes(_votes);
    })
    .catch(() => {});*/

  const _handleOnUserPress = (username) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  const _renderItem = ({ item, index }) => {
    const value = `$ ${item.reward}`;
    const percent = `${item.percent}%`;

    //snippet to avoid rendering time form long past
    const minTimestamp = new Date(createdAt).getTime();
    const voteTimestamp = new Date(item.time).getTime();
    const timeString = item.time && minTimestamp < voteTimestamp ? getTimeFromNow(item.time) : null;

    return (
      <UserListItem
        index={index}
        username={item.voter}
        description={timeString}
        isHasRightItem
        isRightColor={item.is_down_vote}
        rightText={value}
        isLoggedIn
        handleOnPress={() => _handleOnUserPress(item.voter)}
        isClickable
        subRightText={percent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {votes && votes.length > 0 ? (
        <FlatList
          data={votes}
          keyExtractor={(item) => item.voter}
          removeClippedSubviews={false}
          renderItem={_renderItem}
        />
      ) : (
        <EmptyScreen style={styles.emptyContainer} />
      )}
    </SafeAreaView>
  );
};

export default withNavigation(VotersDisplayView);
