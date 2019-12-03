import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services
import { getPost } from '../../../providers/steem/dsteem';

import PostCardView from '../view/postCardView';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostCardContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      _content: null,
    };
  }

  _handleOnUserPress = () => {
    const { navigation, currentAccount, content } = this.props;
    if (content && get(currentAccount, 'name') !== get(content, 'author')) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username: get(content, 'author'),
          reputation: get(content, 'author_reputation'),
        },
        key: get(content, 'author'),
      });
    }
  };

  _handleOnContentPress = content => {
    const { navigation } = this.props;

    if (content) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          content,
        },
        key: get(content, 'permlink'),
      });
    }
  };

  _handleOnVotersPress = activeVotes => {
    const { navigation, content } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
      key: get(content, 'permlink'),
    });
  };

  _handleOnReblogsPress = reblogs => {
    const { navigation, content } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.REBLOGS,
      params: {
        reblogs,
      },
      key: get(content, 'permlink', get(content, 'author', '')),
    });
  };

  _fetchPost = async () => {
    const { currentAccount, content } = this.props;

    await getPost(get(content, 'author'), get(content, 'permlink'), get(currentAccount, 'username'))
      .then(result => {
        if (result) {
          this.setState({ _content: result });
        }
      })
      .catch(() => {});
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (get(nextProps, 'isRefresh')) {
      this._fetchPost();
    }
  }

  render() {
    const { content, isHideImage, nsfw } = this.props;
    const { _content } = this.state;

    const isNsfwPost = nsfw === '1';

    return (
      <PostCardView
        handleOnUserPress={this._handleOnUserPress}
        handleOnContentPress={this._handleOnContentPress}
        handleOnVotersPress={this._handleOnVotersPress}
        handleOnReblogsPress={this._handleOnReblogsPress}
        fetchPost={this._fetchPost}
        content={_content || content}
        isHideImage={isHideImage}
        isNsfwPost={isNsfwPost}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  nsfw: state.application.nsfw,
});

export default withNavigation(connect(mapStateToProps)(PostCardContainer));
