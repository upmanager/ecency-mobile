
export interface TabbedPostsProps {
    filterOptions:string[],
    filterOptionsValue:string[],
    isFeedScreen:boolean,
    feedUsername:string,
    selectedOptionIndex:number,
    feedSubfilterOptions:string[],
    feedSubfilterOptionsValue:string[],
    getFor:string,
    pageType:'main'|'community'|'profile'|'ownProfile',
    tag:string,
    forceLoadPosts:boolean,
    tabContentOverrides:Map<number, any>,
    imagesToggleEnabled?:boolean,
    stackedTabs:boolean,
    onTabChange:(index:number)=>void
    handleOnScroll:()=>void,
}

export interface TabMeta {
    startPermlink:string,
    startAuthor:string,
    isLoading:boolean,
    isRefreshing:boolean,
    isNoPost:boolean,
  }
  
  export interface LoadPostsOptions {
        
    filterKey:string;
    prevPosts:any[];
      tabMeta:TabMeta;
      setTabMeta:(meta:TabMeta)=>void,
      getFor:string,
      isConnected:boolean,
      isLoggedIn:boolean,
      feedUsername:string,
      pageType:string,
      tag:string,
      nsfw:string,
      isAnalytics:boolean,
      isLatestPostsCheck?:boolean,
      refreshing?:boolean,

  }


  export interface TabContentProps {
    filterKey:string,
    isFeedScreen:boolean,
    isInitialTab:boolean,
    getFor:string,
    pageType:string,
    feedUsername:string,
    tag:string,
    forceLoadPosts:boolean,
    filterScrollRequest:string,
    onScrollRequestProcessed:()=>void
    handleOnScroll:()=>void;
  }