import React, {useState, useEffect, useRef} from 'react';
import PostsList from '../../postsList';
import { getPromotedPosts, loadPosts } from '../services/tabbedPostsFetch';
import { LoadPostsOptions, TabContentProps, TabMeta } from '../services/tabbedPostsModels';
import {useSelector, useDispatch } from 'react-redux';
import TabEmptyView from './listEmptyView';
import { setInitPosts } from '../../../redux/actions/postsAction';
import NewPostsPopup from './newPostsPopup';
import { calculateTimeLeftForPostCheck } from '../services/tabbedPostsReducer';


const TabContent = ({
  filterKey, 
  isFeedScreen,
  pageType,
  forceLoadPosts,

  ...props
}: TabContentProps) => {
  let _postFetchTimer = null;
  let _isMounted = true;


  //redux properties
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isAnalytics = useSelector((state) => state.application.isAnalytics);
  const nsfw = useSelector((state) => state.application.nsfw);
  const isConnected = useSelector((state) => state.application.isConnected);
  const username = useSelector((state) => state.account.currentAccount.name);
  const initPosts = useSelector((state) => {
    if(isFeedScreen){
      if(username && filterKey === 'friends'){
        return state.posts.initPosts
      }else if (!username && filterKey === 'hot'){
        return state.posts.initPosts
      }
    }
    return []
  });

  //state
  const [posts, setPosts] = useState([]);
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [sessionUser, setSessionUser] = useState(username);
  const [tabMeta, setTabMeta] = useState({} as TabMeta);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);


  //refs
  let postsListRef = useRef<PostsListRef>()
  const postsRef = useRef(posts);
  postsRef.current = posts;

  //side effects
  useEffect(() => {
    _initContent(initPosts);
    return () => {
      _isMounted = false;
    }
  }, [])

  useEffect(()=>{
    if(isConnected && (username !== sessionUser || forceLoadPosts)){
      if(filterKey !== 'friends'){
        _initContent();
      }else{
        setPosts([])
      }
    }
  },[username, forceLoadPosts])




  //actions
  const _initContent = (_initPosts:any[] = []) => {
    setPosts(_initPosts);
    setTabMeta({
      startAuthor:'',
      startPermlink:'',
      isLoading:false,
      isRefreshing:false,
    } as TabMeta)
    setSessionUser(username);

    if(username || (filterKey !== 'friends' && filterKey !== 'communities')){
      _loadPosts(true);
      _getPromotedPosts();
    }
  }

  //fetch posts from server
  const _loadPosts = async (shouldReset:boolean = false, isLatestPostsCheck:boolean = false) => {
    const options = {
      setTabMeta:(meta:TabMeta) => {
        if(_isMounted){
          setTabMeta(meta)
        }
      },
      filterKey,
      prevPosts:postsRef.current,
      tabMeta,
      isLoggedIn,
      isAnalytics,
      nsfw,
      isConnected,
      isFeedScreen,
      refreshing:shouldReset,
      pageType,
      isLatestPostsCheck,
      ...props
    } as LoadPostsOptions

    const result = await loadPosts(options)
    if(_isMounted && result){
      _postProcessLoadResult(result, shouldReset)
    }
  }


  const _getPromotedPosts = async () => {
    if(pageType === 'profiles'){
      return;
    }
    const pPosts = await getPromotedPosts(username)
    if(pPosts){
      setPromotedPosts(pPosts)
    }
  }



  //schedules post fetch
  const _scheduleLatestPostsCheck = (firstPost:any) => {
    if (_postFetchTimer) {
      clearTimeout(_postFetchTimer);
    }

    const timeLeft = calculateTimeLeftForPostCheck(firstPost)
    if (firstPost) {
      _postFetchTimer = setTimeout(() => {
          const isLatestPostsCheck = true;
          _loadPosts(false, isLatestPostsCheck);
        }, 
        timeLeft
      );
    }
  };


  //processes response from loadPost
  const _postProcessLoadResult = ({updatedPosts, latestPosts}:any, shouldReset:boolean) => {
    //process new posts avatart
    if(latestPosts && Array.isArray(latestPosts)){
      if(latestPosts.length > 0){
        setLatestPosts(latestPosts)
      }else{
        _scheduleLatestPostsCheck(posts[0])
      }
    }

    //process returned data
    if(updatedPosts && Array.isArray(updatedPosts)){
      if (isFeedScreen && shouldReset) {
        //   //schedule refetch of new posts by checking time of current post
          _scheduleLatestPostsCheck(updatedPosts[0]);

          if (filterKey == username ? 'friends' : 'hot') {
            dispatch(setInitPosts(updatedPosts));
          }
      }
      setPosts(updatedPosts);
    }
  }


  

  //view related routines
  const _onPostsPopupPress = () => {
      _scrollToTop();
      _getPromotedPosts()
      setPosts([...latestPosts, ...posts])
      _scheduleLatestPostsCheck(latestPosts[0]);
      setLatestPosts([]);
  }

  const _scrollToTop = () => {
    postsListRef.current.scrollToTop();
  };

  

  //view rendereres
  const _renderEmptyContent = () => {
    return <TabEmptyView filterKey={filterKey} isNoPost={tabMeta.isNoPost}/>
  }


  return (

    <>
    <PostsList 
      ref={postsListRef}
      data={posts}
      isFeedScreen={isFeedScreen}
      promotedPosts={promotedPosts}
      onLoadPosts={(shouldReset)=>{
        _loadPosts(shouldReset)
        if(shouldReset){
          _getPromotedPosts()
        }
      }}
      isRefreshing={tabMeta.isRefreshing}
      isLoading={tabMeta.isLoading}
      ListEmptyComponent={_renderEmptyContent}
    />
    <NewPostsPopup 
      popupAvatars={latestPosts.map(post=>post.avatar || '')}
      onPress={_onPostsPopupPress}
      onClose={()=>{
        setLatestPosts([])
      }}
    />
  </>
  );
};

export default TabContent;


