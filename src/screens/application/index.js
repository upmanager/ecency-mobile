import React, { Fragment, useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';

import ApplicationContainer from './container/applicationContainer';
import WelcomeScreen from './screen/welcomeScreen';
import ApplicationScreen from './screen/applicationScreen';
import LaunchScreen from '../launch';
import { Modal } from '../../components';
import { PinCode } from '../pinCode';
import ErrorBoundary from './screen/errorBoundary';

const Application = () => {
  const [showAnimation, setShowAnimation] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    SplashScreen.hide();
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false);
      }, 3550);
    }
  }, [showAnimation]);

  return (
    <ApplicationContainer>
      {({
        isConnected,
        isDarkTheme,
        isPinCodeRequire,
        isReady,
        isRenderRequire,
        isThemeReady,
        locale,
        rcOffer,
        toastNotification,
        showWelcomeModal,
        handleWelcomeModalButtonPress,
      }) => {
        const _isAppReady = !showAnimation && isReady && isRenderRequire && isThemeReady;

        return (
          <ErrorBoundary>
            <Modal
              isOpen={showWelcomeModal && _isAppReady}
              isFullScreen
              swipeToClose={false}
              backButtonClose={false}
              style={{ margin: 0 }}
            >
              <WelcomeScreen handleButtonPress={handleWelcomeModalButtonPress} />
            </Modal>

            <Modal
              isOpen={isPinCodeRequire && !showWelcomeModal}
              isFullScreen
              swipeToClose={false}
              backButtonClose={false}
              style={{ margin: 0 }}
            >
              <PinCode />
            </Modal>

            {isThemeReady && isRenderRequire && (
              <ApplicationScreen
                isConnected={isConnected}
                locale={locale}
                toastNotification={toastNotification}
                isReady={isReady}
                isDarkTheme={isDarkTheme}
                rcOffer={rcOffer}
              />
            )}
            {!_isAppReady && <LaunchScreen />}
          </ErrorBoundary>
        );
      }}
    </ApplicationContainer>
  );
};

export default Application;

export { ApplicationContainer, ApplicationScreen };
