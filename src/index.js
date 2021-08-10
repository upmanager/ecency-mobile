import '../shim';
import React from 'react';
import 'react-native-gesture-handler';
import { Provider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { IntlProvider } from 'react-intl';
import firebase from '@react-native-firebase/app';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { flattenMessages } from './utils/flattenMessages';
import messages from './config/locales';

import Application from './screens/application';
import { store, persistor } from './redux/store/store';

const _renderApp = ({ locale }) => (
  <PersistGate loading={null} persistor={persistor}>
    <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
      <SafeAreaProvider>
        <Application />
      </SafeAreaProvider>
    </IntlProvider>
  </PersistGate>
);

const mapStateToProps = (state) => ({
  locale: state.application.language,
});

const App = connect(mapStateToProps)(_renderApp);

export default () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};
