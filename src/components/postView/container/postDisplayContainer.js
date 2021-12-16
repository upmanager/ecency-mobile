import React, { useEffect, useState } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Action
import { toastNotification } from '../../../redux/actions/uiAction';

// Dsteem
import { deleteComment } from '../../../providers/hive/dhive';
import { getPostReblogs } from '../../../providers/ecency/ecency';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Component
import PostDisplayView from '../view/postDisplayView';

const PostDisplayContainer = ({
  navigation,
  post,
  fetchPost,
  isFetchPost,
  isFetchComments,
  currentAccount,
  pinCode,
  dispatch,
  intl,
  isLoggedIn,
  isNewPost,
  parentPost,
  isPostUnavailable,
  author,
}) => {
  const [activeVotes, setActiveVotes] = useState([]);
  const [activeVotesCount, setActiveVotesCount] = useState(0);
  const [reblogs, setReblogs] = useState([]);

  useEffect(() => {
    if (post) {
      console.log('Gettting reblogs inside postDisplayContainer');
      const votes = get(post, 'active_votes', []);
      setActiveVotes(votes);
      setActiveVotesCount(votes.length);
      getPostReblogs(post).then((result) => {
        setReblogs(result || []);
      });
    }
  }, [post]);

  useEffect(() => {
    _fetchPost();
  }, [isFetchPost, isFetchComments]);

  // Component Functions
  const _handleOnVotersPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
        content: post,
      },
      // TODO: make unic
      key: post.permlink + activeVotes.length,
    });
  };

  const _handleOnReblogsPress = () => {
    if (reblogs.length > 0) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.REBLOGS,
        params: {
          reblogs,
        },
        key: post.permlink + reblogs.length,
      });
    }
  };

  const _handleOnReplyPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      key: 'editor_replay',
      params: {
        isReply: true,
        post,
        fetchPost: _fetchPost,
      },
    });
  };

  const _handleOnEditPress = () => {
    if (post) {
      const isReply = post.parent_author;

      navigation.navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        key: `editor_post_${post.permlink}`,
        params: {
          isEdit: true,
          isReply,
          post,
          fetchPost: _fetchPost,
        },
      });
    }
  };

  const _handleDeleteComment = (permlink) => {
    deleteComment(currentAccount, pinCode, permlink).then(() => {
      navigation.goBack();
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.removed',
          }),
        ),
      );
    });
  };

  const _fetchPost = async () => {
    if (post) {
      fetchPost(post.author, post.permlink);
    }
  };

  return (
    <PostDisplayView
      author={author}
      currentAccount={currentAccount}
      fetchPost={_fetchPost}
      handleOnEditPress={_handleOnEditPress}
      handleOnRemovePress={_handleDeleteComment}
      handleOnReplyPress={_handleOnReplyPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}
      isLoggedIn={isLoggedIn}
      isNewPost={isNewPost}
      isPostUnavailable={isPostUnavailable}
      parentPost={parentPost}
      post={post}
      activeVotes={activeVotes}
      activeVotesCount={activeVotesCount}
      setActiveVotesCount={setActiveVotesCount}
      reblogs={reblogs}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isLoggedIn: state.application.isLoggedIn,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(PostDisplayContainer)));
