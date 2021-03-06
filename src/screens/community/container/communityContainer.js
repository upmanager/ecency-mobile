import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';
import { connect } from 'react-redux';

import { subscribeCommunity, getCommunity, getSubscriptions } from '../../../providers/hive/dhive';

import ROUTES from '../../../constants/routeNames';

const CommunityContainer = ({ children, navigation, currentAccount, pinCode, isLoggedIn }) => {
  const [data, setData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const tag = get(navigation, 'state.params.tag');

  useEffect(() => {
    getCommunity(tag)
      .then((res) => {
        setData(res);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [tag]);

  useEffect(() => {
    if (data) {
      getSubscriptions(currentAccount.username)
        .then((result) => {
          if (result) {
            const _isSubscribed = result.some((item) => item[0] === data.name);
            setIsSubscribed(_isSubscribed);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [data]);

  const _handleSubscribeButtonPress = () => {
    const _data = {
      isSubscribed: !isSubscribed,
      communityId: data.name,
    };

    subscribeCommunity(currentAccount, pinCode, _data)
      .then((result) => {
        setIsSubscribed(!isSubscribed);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const _handleNewPostButtonPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      key: 'editor_community_post',
      params: {
        community: [tag],
      },
    });
  };

  return (
    children &&
    children({
      data,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      handleNewPostButtonPress: _handleNewPostButtonPress,
      isSubscribed,
      isLoggedIn,
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(withNavigation(CommunityContainer));
