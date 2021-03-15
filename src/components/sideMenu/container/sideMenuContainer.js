import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Actions
import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';
import { setInitPosts, setFeedPosts } from '../../../redux/actions/postsAction';
import { logout } from '../../../redux/actions/applicationActions';

// Component
import SideMenuView from '../view/sideMenuView';

const SideMenuContainer = ({ navigation }) => {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const otherAccounts = useSelector((state) => state.account.otherAccounts);
  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );

  const _navigateToRoute = (route = null) => {
    if (route) {
      navigation.navigate(route);
    }
  };

  const _handleLogout = () => {
    navigation.closeDrawer();
    dispatch(setFeedPosts([]));
    dispatch(setInitPosts([]));
    dispatch(logout());
  };

  const _handlePressOptions = () => {
    dispatch(toggleAccountsBottomSheet(!isVisibleAccountsBottomSheet));
  };

  return (
    <SideMenuView
      navigateToRoute={_navigateToRoute}
      isLoggedIn={isLoggedIn}
      userAvatar={null}
      currentAccount={currentAccount}
      handleLogout={_handleLogout}
      handlePressOptions={_handlePressOptions}
    />
  );
};

export default SideMenuContainer;
