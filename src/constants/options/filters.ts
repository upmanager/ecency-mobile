export const DEFAULT_FEED_FILTERS = ['friends', 'communities', 'hot'];

export const FEED_SCREEN_FILTER_MAP  = {
    friends:'home.friends',
    communities:'home.communities',
    trending:'home.top',
    hot:'home.hot',
    created:'home.new',
}

export const DEFAULT_COMMUNITY_FILTERS = ['trending', 'hot', 'created'];
export const COMMUNITY_SCREEN_FILTER_MAP = {
    trending:'home.top',
    hot: 'home.hot', 
    created: 'home.new',
    muted: 'community.muted',
    payout: 'community.payout'
}


export const GLOBAL_POST_FILTERS = ['home.TOP', 'home.HOT', 'home.NEW'];
export const GLOBAL_POST_FILTERS_VALUE = ['trending', 'hot', 'created'];

export const PROFILE_FILTERS_OWN = ['home.BLOG', 'home.POSTS', 'profile.replies'];
export const PROFILE_FILTERS = ['home.BLOG', 'home.POSTS', 'profile.comments', 'profile.wallet'];
export const PROFILE_FILTERS_VALUE = ['blog', 'posts', 'comments', 'wallet'];

export const getFilterMap = (type:'main'|'community') => {
    switch(type){
        case 'community': return COMMUNITY_SCREEN_FILTER_MAP;
        case 'main': return FEED_SCREEN_FILTER_MAP
    }
}

export const getDefaultFilters = (type:'main'|'community') => {
    switch(type){
        case 'community': return DEFAULT_COMMUNITY_FILTERS;
        case 'main': return DEFAULT_FEED_FILTERS
    }
}