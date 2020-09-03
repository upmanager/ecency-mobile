/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';
import { get, unionBy } from 'lodash';

// STEEM
import { getPostsSummary, getPost } from '../../../providers/steem/dsteem';
import { getPromotePosts } from '../../../providers/esteem/esteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostCardPlaceHolder, NoPost } from '../../basicUIElements';
import { ThemeContainer } from '../../../containers';

// Styles
import styles from './postsStyles';
import { default as ROUTES } from '../../../constants/routeNames';

const PostsView = ({
  filterOptions,
  selectedOptionIndex,
  isHideImage,
  handleImagesHide,
  feedPosts,
  isConnected,
  currentAccountUsername,
  getFor,
  tag,
  nsfw,
  setFeedPosts,
  pageType,
  isLoginDone,
  isLoggedIn,
  handleOnScroll,
  navigation,
  changeForceLoadPostState,
  forceLoadPost,
  filterOptionsValue,
  feedUsername,
}) => {
  const [posts, setPosts] = useState(isConnected ? [] : feedPosts);
  const [startAuthor, setStartAuthor] = useState('');
  const [startPermlink, setStartPermlink] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(selectedOptionIndex || 0);
  const [isNoPost, setIsNoPost] = useState(false);
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [selectedFilterValue, setSelectedFilterValue] = useState(
    filterOptionsValue && filterOptionsValue[selectedFilterIndex],
  );
  const intl = useIntl();
  const postsList = useRef(null);

  useEffect(() => {
    if (isConnected) {
      const fetchPromotePost = async () => {
        if (pageType !== 'profiles') {
          await _getPromotePosts();
        }
      };
      fetchPromotePost();
      _loadPosts();
    }
  }, [
    _getPromotePosts,
    _loadPosts,
    changeForceLoadPostState,
    currentAccountUsername,
    forceLoadPost,
    isConnected,
    pageType,
    selectedOptionIndex,
  ]);

  useEffect(() => {
    if (forceLoadPost) {
      setPosts([]);
      setStartAuthor('');
      setStartPermlink('');
      setSelectedFilterIndex(selectedOptionIndex || 0);
      setIsNoPost(false);

      _loadPosts();

      if (changeForceLoadPostState) {
        changeForceLoadPostState(false);
      }
    }
  }, [
    _loadPosts,
    changeForceLoadPostState,
    currentAccountUsername,
    forceLoadPost,
    selectedOptionIndex,
  ]);

  useEffect(() => {
    if (!startAuthor && !startPermlink) {
      _loadPosts(selectedFilterValue);
    }
  }, [
    _loadPosts,
    filterOptions,
    filterOptionsValue,
    selectedFilterValue,
    startAuthor,
    startPermlink,
  ]);

  const _handleOnDropdownSelect = async (index) => {
    if (index === selectedFilterIndex) {
      _scrollTop();
    } else {
      if (filterOptions && filterOptions.length > 0) {
        await setSelectedFilterValue(filterOptionsValue[index]);
      }

      setSelectedFilterIndex(index);
      setPosts([]);
      setStartPermlink('');
      setStartAuthor('');
      setIsNoPost(false);
    }
  };

  const _getPromotePosts = useCallback(async () => {
    await getPromotePosts()
      .then(async (res) => {
        if (res && res.length) {
          const _promotedPosts = await Promise.all(
            res.map((item) =>
              getPost(
                get(item, 'author'),
                get(item, 'permlink'),
                currentAccountUsername,
                true,
              ).then((post) => post),
            ),
          );

          setPromotedPosts(_promotedPosts);
        }
      })
      .catch(() => {});
  }, [currentAccountUsername]);

  const _loadPosts = useCallback(
    (type) => {
      if (
        isLoading ||
        !isConnected ||
        (!isLoggedIn && type === 'feed') ||
        (!isLoggedIn && type === 'blog')
      ) {
        return;
      }

      if (!isConnected && (refreshing || isLoading)) {
        setRefreshing(false);
        setIsLoading(false);
        return;
      }
      if (posts.length > 2) {
        setIsLoading(true);
      }

      const filter = type || selectedFilterValue;
      let options;
      const limit = 6;

      if (filter === 'feed' || filter === 'blog' || getFor === 'blog' || filter === 'reblogs') {
        options = {
          tag: feedUsername,
          limit,
        };
      } else {
        options = {
          tag,
          limit,
        };
      }

      if (startAuthor && startPermlink && !refreshing) {
        options.start_author = startAuthor;
        options.start_permlink = startPermlink;
      }
      options.truncate_body = 200;

      getPostsSummary(filter, options, currentAccountUsername, nsfw)
        .then((result) => {
          if (result.length > 0) {
            let _posts = result;

            if (filter === 'reblogs') {
              for (let i = _posts.length - 1; i >= 0; i--) {
                if (_posts[i].author === currentAccountUsername) {
                  _posts.splice(i, 1);
                }
              }
            }
            if (_posts.length > 0) {
              if (posts.length > 0) {
                if (refreshing) {
                  _posts = unionBy(_posts, posts, 'permlink');
                } else {
                  _posts = unionBy(posts, _posts, 'permlink');
                }
              }

              if (posts.length < 7 && pageType !== 'profiles') {
                setFeedPosts(_posts);
              }

              if (!refreshing) {
                setStartAuthor(result[result.length - 1] && result[result.length - 1].author);
                setStartPermlink(result[result.length - 1] && result[result.length - 1].permlink);
              }
              setPosts(_posts);
              setRefreshing(false);
              setIsLoading(false);
            }
          } else if (result.length === 0) {
            setIsNoPost(true);
            setRefreshing(false);
            setIsLoading(false);
          }
        })
        .catch(() => {
          setRefreshing(false);
          setIsLoading(false);
        });
    },
    [
      currentAccountUsername,
      getFor,
      isConnected,
      isLoading,
      isLoggedIn,
      nsfw,
      pageType,
      posts,
      //promotedPosts,
      refreshing,
      selectedFilterValue,
      setFeedPosts,
      startAuthor,
      startPermlink,
      tag,
    ],
  );

  const _handleOnRefreshPosts = async () => {
    setRefreshing(true);
    if (pageType !== 'profiles') {
      await _getPromotePosts();
    }
  };

  useEffect(() => {
    if (refreshing) {
      _loadPosts();
    }
  }, [refreshing]);

  const _renderFooter = () => {
    if (isLoading) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator animating size="large" />
        </View>
      );
    }

    return null;
  };

  const _handleOnPressLogin = () => {
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  const _renderEmptyContent = () => {
    if ((selectedFilterValue === 'feed' || selectedFilterValue === 'blog') && !isLoggedIn) {
      return (
        <NoPost
          imageStyle={styles.noImage}
          isButtonText
          defaultText={intl.formatMessage({
            id: 'profile.login_to_see',
          })}
          handleOnButtonPress={_handleOnPressLogin}
        />
      );
    }

    if (isNoPost) {
      return (
        <NoPost
          imageStyle={styles.noImage}
          name={tag}
          text={intl.formatMessage({
            id: 'profile.havent_posted',
          })}
          defaultText={intl.formatMessage({
            id: selectedFilterValue === 'feed' ? 'profile.follow_people' : 'profile.havent_posted',
          })}
        />
      );
    }

    return (
      <View style={styles.placeholderWrapper}>
        <PostCardPlaceHolder />
        <PostCardPlaceHolder />
      </View>
    );
  };

  const _handleOnScroll = () => {
    if (handleOnScroll) {
      handleOnScroll();
    }
  };

  const _scrollTop = () => {
    postsList.current.scrollToOffset({ x: 0, y: 0, animated: true });
  };

  const _renderItem = ({ item, index }) => {
    const e = [];
    if (index % 3 === 0) {
      const ix = index / 3 - 1;
      if (promotedPosts[ix] !== undefined) {
        const p = promotedPosts[ix];
        if (get(p, 'author', null) && posts.filter((x) => x.permlink === p.permlink).length <= 0) {
          e.push(
            <PostCard
              key={`${p.author}-${p.permlink}-prom`}
              isRefresh={refreshing}
              content={p}
              isHideImage={isHideImage}
            />,
          );
        }
      }
    }
    if (get(item, 'author', null)) {
      e.push(
        <PostCard
          key={`${item.author}-${item.permlink}`}
          isRefresh={refreshing}
          content={item}
          isHideImage={isHideImage}
        />,
      );
    }
    return e;
  };

  return (
    <ThemeContainer>
      {({ isDarkTheme }) => (
        <View style={styles.container}>
          {filterOptions && (
            <FilterBar
              dropdownIconName="arrow-drop-down"
              options={filterOptions.map((item) =>
                intl.formatMessage({ id: `home.${item.toLowerCase()}` }).toUpperCase(),
              )}
              selectedOptionIndex={selectedFilterIndex}
              defaultText={filterOptions[selectedOptionIndex]}
              rightIconName="view-module"
              rightIconType="MaterialIcons"
              onDropdownSelect={_handleOnDropdownSelect}
              onRightIconPress={handleImagesHide}
            />
          )}

          <FlatList
            ref={postsList}
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={_renderItem}
            keyExtractor={(content, i) => `key-${i.toString()}`}
            onEndReached={() => _loadPosts()}
            removeClippedSubviews
            refreshing={refreshing}
            onRefresh={_handleOnRefreshPosts}
            onEndReachedThreshold={0.1}
            initialNumToRender={4}
            ListFooterComponent={_renderFooter}
            onScrollEndDrag={_handleOnScroll}
            ListEmptyComponent={_renderEmptyContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={_handleOnRefreshPosts}
                progressBackgroundColor="#357CE6"
                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                titleColor="#fff"
                colors={['#fff']}
              />
            }
          />
        </View>
      )}
    </ThemeContainer>
  );
};

export default withNavigation(PostsView);
/* eslint-enable */
