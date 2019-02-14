import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import PostDisplayView from '../view/postDisplayView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostDisplayContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions
  componentWillReceiveProps(nextProps) {
    const { isFetchPost } = this.props;
    if (isFetchPost !== nextProps.isFetchPost && nextProps.isFetchPost) {
      this._fetchPost();
    }
  }

  // Component Functions
  _handleOnVotersPress = (activeVotes) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
    });
  };

  _handleOnReplyPress = () => {
    const { post, navigation } = this.props;
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isReply: true,
        post,
        fetchPost: this._fetchPost,
      },
    });
  };

  _handleOnEditPress = () => {
    const { post, navigation } = this.props;
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isEdit: true,
        post,
        fetchPost: this._fetchPost,
      },
    });
  };

  _fetchPost = async () => {
    const { post, fetchPost } = this.props;

    fetchPost(post.author, post.permlink);
  };

  render() {
    const {
      currentAccount, isLoggedIn, parentPost, post,
    } = this.props;

    return (
      <PostDisplayView
        currentAccount={currentAccount}
        fetchPost={this._fetchPost}
        handleOnEditPress={this._handleOnEditPress}
        handleOnReplyPress={this._handleOnReplyPress}
        handleOnVotersPress={this._handleOnVotersPress}
        isLoggedIn={isLoggedIn}
        parentPost={parentPost}
        post={post}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,

  isLoggedIn: state.application.isLoggedIn,
});

export default withNavigation(connect(mapStateToProps)(PostDisplayContainer));
