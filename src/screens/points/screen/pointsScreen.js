import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { View, SafeAreaView } from 'react-native';

// Containers
import { PointsContainer } from '../../../containers';

// Components
import { Header, Points, NoPost } from '../../../components';

// Styles
import styles from './pointsStyles';

class PointsScreen extends PureComponent {
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

  render() {
    const { intl, isLoggedIn, handleLoginPress } = this.props;

    return (
      <Fragment>
        <Header />
        <SafeAreaView style={styles.container}>
          {isLoggedIn ? (
            <PointsContainer>
              {({
                handleOnDropdownSelected,
                claimPoints,
                fetchUserActivity,
                isClaiming,
                isDarkTheme,
                isLoading,
                refreshing,
                userActivities,
                userPoints,
              }) => (
                <Points
                  claimPoints={claimPoints}
                  fetchUserActivity={fetchUserActivity}
                  isClaiming={isClaiming}
                  isDarkTheme={isDarkTheme}
                  isLoading={isLoading}
                  refreshing={refreshing}
                  userActivities={userActivities}
                  userPoints={userPoints}
                  handleOnDropdownSelected={handleOnDropdownSelected}
                />
              )}
            </PointsContainer>
          ) : (
            <NoPost
              style={styles.noPostContainer}
              isButtonText
              defaultText={intl.formatMessage({
                id: 'profile.login_to_see',
              })}
              handleOnButtonPress={handleLoginPress}
            />
          )}
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default injectIntl(PointsScreen);
