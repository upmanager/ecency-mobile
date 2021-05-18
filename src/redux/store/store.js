import { createStore, applyMiddleware, compose } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import Reactotron from '../../../reactotron-config';

import reducer from '../reducers';

// Middleware: Redux Persist Config
const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  // Blacklist (Don't Save Specific Reducers)
  blacklist: ['nav', 'application', 'communities', 'user'],
  timeout: 0,
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, reducer);

const middleware = [thunk];
if (process.env.NODE_ENV === 'development') {
  // middleware.push(logger);
}

const store = createStore(
  persistedReducer,
  compose(applyMiddleware(...middleware), Reactotron.createEnhancer()),
);

const persistor = persistStore(store);

export { store, persistor };
