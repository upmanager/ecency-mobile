import { combineReducers } from 'redux';
import accountReducer from './accountReducer';
import applicationReducer from './applicationReducer';
import nav from './nav';
import ui from './uiReducer';
import postsReducer from './postsReducer';
import communities from './communitiesReducer';
import user from './userReducer';
import customTabsReducer from './customTabsReducer';
import editorReducer from './editorReducer';

export default combineReducers({
  account: accountReducer,
  application: applicationReducer,
  posts: postsReducer,
  customTabs: customTabsReducer,
  editor: editorReducer,
  nav,
  ui,
  communities,
  user,
});
