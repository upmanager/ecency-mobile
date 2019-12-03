/* eslint-disable react/jsx-wrap-multilines */
import React, { PureComponent } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { injectIntl } from 'react-intl';

// Constants

// Components
import { BasicHeader, UserListItem } from '../../../components';

// Utils
import styles from './followScreenStyles';

class FollowsScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _renderItem = (item, index) => {
    const { isFollowing } = this.props;
    const username = isFollowing ? item.following : item.follower;

    return <UserListItem index={index} username={username} />;
  };

  render() {
    const { loadMore, data, isFollowing, count, handleSearch, intl, isLoading } = this.props;
    const title = intl.formatMessage({
      id: !isFollowing ? 'profile.follower' : 'profile.following',
    });
    const headerTitle = `${title} (${count})`;

    return (
      <View style={styles.container}>
        <BasicHeader title={headerTitle} isHasSearch handleOnSearch={handleSearch} />
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={() => loadMore()}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => this._renderItem(item, index)}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.text}>
                {intl.formatMessage({
                  id: 'voters.no_user',
                })}
              </Text>
            )
          }
        />
      </View>
    );
  }
}

export default injectIntl(FollowsScreen);
/* eslint-enable */
