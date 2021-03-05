import {
  SET_FEED_POSTS,
  SET_OTHER_POSTS,
  FETCH_POSTS,
  FETCH_POSTS_SUCCESS,
  RESET,
  FILTER_SELECTED,
  SET_INIT_POSTS,
} from '../constants/constants';

export const setFeedPosts = (payload) => ({
  payload,
  type: SET_FEED_POSTS,
});
export const setInitPosts = (payload) => ({
  payload,
  type: SET_INIT_POSTS,
});
export const setOtherPosts = (payload) => ({
  payload,
  type: SET_OTHER_POSTS,
});
export const fetchPosts = (payload) => ({
  payload,
  type: FETCH_POSTS,
});
export const fetchPostsSuccess = (payload) => ({
  payload,
  type: FETCH_POSTS_SUCCESS,
});
export const reset = (payload) => ({
  payload,
  type: RESET,
});
export const filterSelected = (payload) => ({
  payload,
  type: FILTER_SELECTED,
});
