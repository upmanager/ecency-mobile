import React, { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services
import { act } from 'react-test-renderer';
import { getPost, getActiveVotes } from '../../../providers/hive/dhive';
import { getPostReblogs } from '../../../providers/ecency/ecency';

import { parseActiveVotes } from '../../../utils/postParser';

import PostCardView from '../view/postCardView';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const PostCardContainer = ({
  // isRefresh,
  navigation,
  currentAccount,
  content,
  isHideImage,
  nsfw,
  imageHeight,
  setImageHeight,
}) => {
  const [_content, setContent] = useState(content);
  const [reblogs, setReblogs] = useState([]);
  const [activeVotes, setActiveVotes] = useState(get(_content, 'active_votes', []));

  //NOTE: potentially unnessacry fetch
  // useEffect(() => {
  // if (isRefresh) {
  //   _fetchPost();
  // }
  // }, [isRefresh]);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async (val) => {
      try {
        const dd = await getPostReblogs(val);
        if (!isCancelled) {
          setReblogs(dd);
          return dd;
        }
      } catch (e) {
        if (!isCancelled) {
          setReblogs([]);
          return val;
        }
      }
    };

    if (_content) {
      fetchData(_content);
    }

    return () => {
      isCancelled = true;
    };
  }, [_content]);

  const _handleOnUserPress = () => {
    if (_content && get(currentAccount, 'name') !== get(_content, 'author')) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username: get(_content, 'author'),
          reputation: get(_content, 'author_reputation'),
        },
        key: get(_content, 'author'),
      });
    }
  };

  const _handleOnContentPress = (value) => {
    if (value) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          content: value,
        },
        key: get(value, 'permlink'),
      });
    }
  };

  const _handleOnVotersPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
        content: _content,
      },
      key: get(_content, 'permlink'),
    });
  };

  const _handleOnReblogsPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.REBLOGS,
      params: {
        reblogs,
      },
      key: get(_content, 'permlink', get(_content, 'author', '')),
    });
  };

  const _fetchPost = async () => {
    await getPost(
      get(_content, 'author'),
      get(_content, 'permlink'),
      get(currentAccount, 'username'),
    )
      .then((result) => {
        if (result) {
          setContent(result);
          setActiveVotes(get(result, 'active_votes', []));
        }
      })
      .catch(() => {});
  };

  return (
    <PostCardView
      handleOnUserPress={_handleOnUserPress}
      handleOnContentPress={_handleOnContentPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}
      fetchPost={_fetchPost}
      content={_content || content}
      isHideImage={isHideImage}
      isNsfwPost={nsfw || '1'}
      reblogs={reblogs}
      activeVotes={activeVotes}
      imageHeight={imageHeight}
      setImageHeight={setImageHeight}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  nsfw: state.application.nsfw,
});

export default withNavigation(connect(mapStateToProps)(PostCardContainer));
