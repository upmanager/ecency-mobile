import React, { PureComponent, Fragment } from 'react';
import { View, FlatList } from 'react-native';
import { injectIntl } from 'react-intl';

import { getTimeFromNow } from '../../../utils/time';
// Constants

// Components
import Comments from '../container/commentsContainer';
import { PostBody, PostHeaderDescription } from '../../postElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';

// Styles
// import styles from './commentStyles';

class CommentsView extends PureComponent {
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
  _handleOnDropdownSelect = () => {};

  _keyExtractor = item => item.permlink;

  render() {
    const {
      avatarSize,
      commentNumber,
      comments,
      currentAccountUsername,
      handleOnEditPress,
      handleOnReplyPress,
      handleOnUserPress,
      isLoggedIn,
      isProfilePreview,
      marginLeft,
      fetchPost,
      intl,
      showComentsToggle,
      isShowComments,
      parentPermlink,
      selectedPermlink,
    } = this.props;

    //    if (isShowComments) alert(isShowComments);

    return (
      <View>
        {!!comments && (
          <FlatList
            data={comments}
            keyExtractor={this._keyExtractor}
            renderItem={({ item, index }) => (
              <View key={index}>
                <PostHeaderDescription
                  key={item.permlink}
                  // date={intl.formatRelative(item.created)}
                  date={getTimeFromNow(item.created)}
                  name={item.author}
                  reputation={item.author_reputation}
                  size={avatarSize || 24}
                />
                <View
                  style={{
                    marginLeft: marginLeft || 29,
                    flexDirection: 'column',
                    marginTop: -10,
                  }}
                >
                  <PostBody isComment handleOnUserPress={handleOnUserPress} body={item.body} />
                  <View style={{ flexDirection: 'row' }}>
                    {isLoggedIn && (
                      <Fragment>
                        <Upvote isShowPayoutValue content={item} />
                        <IconButton
                          size={18}
                          iconStyle={{ color: '#c1c5c7' }}
                          style={{ marginLeft: 10 }}
                          name="reply"
                          onPress={() => handleOnReplyPress && handleOnReplyPress(item)}
                          iconType="MaterialIcons"
                        />
                        {currentAccountUsername === item.author && (
                          <IconButton
                            size={18}
                            iconStyle={{ color: '#c1c5c7' }}
                            style={{ marginLeft: 10 }}
                            name="create"
                            onPress={() => handleOnEditPress && handleOnEditPress(item)}
                            iconType="MaterialIcons"
                          />
                        )}
                        {item.children > 0 && commentNumber === 1 && (
                          <IconButton
                            size={18}
                            iconStyle={{ color: '#c1c5c7' }}
                            style={{ marginLeft: 10 }}
                            name="star"
                            onPress={() => showComentsToggle(item.permlink)}
                            iconType="MaterialIcons"
                          />
                        )}
                      </Fragment>
                    )}
                  </View>
                </View>
                {!isProfilePreview
                  && item.children > 0
                  && (isShowComments
                    && (selectedPermlink === item.permlink
                      || selectedPermlink === item.parent_permlink) && (
                      <View style={{ marginLeft: marginLeft || 29 }}>
                        <Comments
                          key={item.permlink}
                          selectedPermlink={selectedPermlink}
                          parentPermlink={item.parent_permlink}
                          isShowComments={isShowComments}
                          commentNumber={commentNumber && commentNumber * 2}
                          marginLeft={20}
                          avatarSize={avatarSize || 16}
                          author={item.author}
                          permlink={item.permlink}
                          commentCount={item.children}
                          fetchPost={fetchPost}
                        />
                      </View>
                  ))}
              </View>
            )}
          />
        )}
      </View>
    );
  }
}

export default injectIntl(CommentsView);
