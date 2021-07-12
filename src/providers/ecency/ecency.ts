import api from '../../config/api';
import ecencyApi from '../../config/ecencyApi';
import { upload } from '../../config/imageApi';
import serverList from '../../config/serverListApi';
import bugsnag from '../../config/bugsnag';
import { SERVER_LIST } from '../../constants/options/api';
import { parsePost } from '../../utils/postParser';

export const getCurrencyRate = (currency) =>
  api
    .get(`/market-data/currency-rate/${currency}/hbd?fixed=1`)
    .then((resp) => resp.data)
    .catch((err) => {
      bugsnag.notify(err);
      //TODO: save currency rate of offline values
      return 1;
    });

export const getCurrencyTokenRate = (currency, token) =>
  api
    .get(`/market-data/currency-rate/${currency}/${token}`)
    .then((resp) => resp.data)
    .catch((err) => {
      bugsnag.notify(err);
      return 0;
    });



/**
 * returns list of saved drafts on ecency server
 */
export const getDrafts = async () => {
  try{
    const res = await ecencyApi.post('/private-api/drafts');
    return res.data;
  }catch(error){
    bugsnag.notify(error);
    throw error;
  }
}
  


/**
 * @params draftId
 */
export const deleteDraft = async (draftId:string) => {
  try{
    const data = { id:draftId }
    const res = await ecencyApi.post(`/private-api/drafts-delete`, data);
    return res.data
  }catch(error){
    bugsnag.notify(error);
    throw error;
  }
}


/**
 * @params title
 * @params body
 * @params tags
 */
export const addDraft = async (title:string, body:string, tags:string) => {
  try {
    const data = { title, body, tags }
    const res = await ecencyApi.post('/private-api/drafts-add', data)
    const { drafts } = res.data;
    if (drafts) {
      return drafts.pop(); //return recently saved last draft in the list
    } else {
      throw new Error('No drafts returned in response');
    }
  } catch(error){
    bugsnag.notify(error);
    throw error;
  }
}


/**
 * @params draftId
 * @params title
 * @params body
 * @params tags
 */
export const updateDraft = async (draftId:string, title:string, body:string, tags:string) => {
  try {
    const data = {id:draftId, title, body, tags }
    const res = await ecencyApi.post(`/private-api/drafts-update`, data)
    if(res.data){
      return res.data
    } else {
      throw new Error("No data returned in response")
    }
  } catch(error){
    bugsnag.notify(error);
    throw error;
  }
};



/** 
 * ************************************
 * BOOKMARKS ECENCY APIS IMPLEMENTATION 
 * ************************************
 */

/**
 * Adds post to user's bookmarks
 * @param author 
 * @param permlink 
 * @returns array of saved bookmarks
 */
export const addBookmark = async (author:string, permlink:string) => {
  try {
    const data = { author, permlink };
    const response = await ecencyApi.post(`/private-api/bookmarks-add`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to add bookmark", error)
    bugsnag.notify(error)
    throw error
  }
}

/**
 * fetches saved bookmarks of user
 * @returns array of saved bookmarks
 */
export const getBookmarks = async () => {
  try {
    const response = await ecencyApi.post(`/private-api/bookmarks`);
    return response.data;
  } catch(error) {
    console.warn("Failed to get saved bookmarks", error)
    bugsnag.notify(error)
    throw error
  }
}


/**
 * Deletes bookmark from user's saved bookmarks
 * @params bookmarkId
 * @returns array of saved bookmarks
 */
export const deleteBookmark = async (bookmarkId:string) => {
  try {
    const data = { id:bookmarkId}
    const response = await ecencyApi.post(`/private-api/bookmarks-delete`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to delete bookmark", error)
    bugsnag.notify(error)
    throw error
  }
}


export const addReport = (url) =>
  api
    .post('/report', {
      url,
    })
    .then((resp) => resp.data);


  /** 
 * ************************************
 * FAVOURITES ECENCY APIS IMPLEMENTATION 
 * ************************************
 */

/**
 * Fetches user favourites
 * @returns array of favourite accounts
 */
export const getFavorites = async () => {
  try{
    const response = await ecencyApi.post(`/private-api/favorites`)
    return response.data;
  } catch(error) {
    console.warn("Failed to get favorites", error);
    bugsnag.notify(error);
    throw error
  }
}

/**
 * Checks if user is precent in current user's favourites
 * @params targetUsername username
 * @returns boolean
 */
export const checkFavorite = async (targetUsername:string) => {
  try {
    const data = { account: targetUsername };
    const response = await ecencyApi.post(`/private-api/favorites-check`, data);
    return response.data || false;
  } catch(error) {
    console.warn("Failed to check favorite", error);
    bugsnag.notify(error);
  }
}

/**
 * Adds taget user to current user's favourites
 * @params target username
 * @returns array of user favourites
 */
export const addFavorite = async (targetUsername:string) => {
  try {
    const data = { account: targetUsername };
    const response = await ecencyApi.post(`/private-api/favorites-add`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to add user favorites", error);
    bugsnag.notify(error);
    throw error
  }
}


/**
 * Removes taget user to current user's favourites
 * @params target username
 * @returns array of user favourites
 */
export const deleteFavorite = async (targetUsername:string) => {
  try {
    const data = { account: targetUsername };
    const response = await ecencyApi.post(`/private-api/favorites-delete`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to add user favorites", error);
    bugsnag.notify(error);
    throw error;
  }
}


/** 
 * ************************************
 * SNIPPETS ECENCY APIS IMPLEMENTATION 
 * ************************************
 */


/**
 * Fetches all saved user fragments/snippets from ecency
 * @returns array of fragments
 */
export const getFragments = async () => {
  try {
    const response = await ecencyApi.post(`/private-api/fragments`);
    return response.data;
  } catch(error) {
    console.warn("Failed to get fragments", error);
    bugsnag.notify(error)
    throw error;
  }
}


/**
 * Adds new fragment/snippets to user's saved fragments/snippets
 * @params title title
 * @params body body
 * @returns array of fragments
 */

  export const addFragment = async (title: string, body: string) => {
    try{
      const data = { title, body };
      const response = await ecencyApi.post(`/private-api/fragments-add`, data);
      return response.data;
    } catch(error) {
      console.warn("Failed to add fragment", error);
      bugsnag.notify(error)
      throw error;
    }
  }

/**
 * Updates a fragment content using fragment id
 * @params fragmentId
 * @params title
 * @params body
 * @returns array of fragments
 */
 export const updateFragment = async (fragmentId:string, title: string, body: string) => {
  try{
    const data = { id:fragmentId, title, body };
    const response = await ecencyApi.post(`/private-api/fragments-update`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to update fragment", error);
    bugsnag.notify(error)
    throw error;
  }
}

/**
 * Deletes user saved fragment using specified fragment id
 * @params fragmentId
 * @returns array of fragments
 */
 export const deleteFragment = async (fragmentId:string) => {
  try{
    const data = { id:fragmentId };
    const response = await ecencyApi.post(`/private-api/fragments-delete`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to delete fragment", error);
    bugsnag.notify(error)
    throw error;
  }
}



  /** 
 * ************************************
 * ACTIVITES ECENCY APIS IMPLEMENTATION 
 * ************************************
 */

export const getLeaderboard = async (duration:'day'|'week'|'month') => {
  try{
    const response = await ecencyApi.get(`private-api/leaderboard/${duration}`)
    return response.data;
  } catch(error) {
    bugsnag.notify(error)
  }
}

/**
 * fetches notifications from ecency server using filter and since props
 * @param data optional filter and since props;
 * @returns array of notifications
 */
export const getNotifications = async (data:{
    filter?: "rvotes"|"mentions"|"follows"|"replies"|"reblogs"|"transfers", 
    since?:string
  }) => {
    try{
      const response = await ecencyApi.post(`/private-api/notifications`, data);
      return response.data;
    }catch(error){
      console.warn("Failed to get notifications", error)
      bugsnag.notify(error)
      throw error;
    }
  }


  export const getUnreadNotificationCount = async () => {
    try {
      const response = await ecencyApi.post(`/private-api/notifications/unread`)
      return response.data ? response.data.count : 0;
    } catch(error) {
      bugsnag.notify(error);
      throw error;
    }
  }

  export const markNotifications = async (id: string | null = null) => {
    try{
      const data = id ? { id } : {};
      const response = await ecencyApi.post((`/private-api/notifications/mark`), data);
      return response.data
    }catch(error) {
      bugsnag.notify(error);
      throw error
    }
  };


export const setPushToken = (data) =>
  new Promise((resolve, reject) => {
    api
      .post('/rgstrmbldvc/', data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

/** 
 * ************************************
 * SEARCH ECENCY APIS IMPLEMENTATION 
 * ************************************
 */

export const search = async (data:{
  q: string, 
  sort: string, 
  hideLow: string, 
  since?: string, 
  scroll_id?: string
}) => {
  try {
    const response = await ecencyApi.post('/search-api/search', data);
    return response.data;
  } catch(error) {
    console.warn("Search failed", error);
    bugsnag.notify(error);
    throw error;
  }
}


  /**
   * 
   * @param q query
   * @returns array of path strings
   */
  export const searchPath = async (q:string) => {
    try {
      const data = { q };
      const response = await ecencyApi.post('/search-api/search-path', data);
      return response.data; 
    } catch(error){
      console.warn("path search failed", error)
      bugsnag.notify(error);
      throw error
    }
  }


  /**
   * 
   * @param q query
   * @param limit number of posts to fetch
   * @param random random
   * @returns array of accounts
   */
  export const searchAccount = async (q:string = '', limit:number = 20, random:number = 0) => {
    try {
      const data = {
        q,
        limit,
        random,
      }
      const response = await ecencyApi.post(`/search-api/search-account`, data)
      return response.data;
    } catch(error) {
      console.warn("account search failed", error)
      bugsnag.notify(error);
      throw error;
    }
  }


  /**
   * 
   * @param q query
   * @param limit number of posts to fetch
   * @param random random
   * @returns array of accounts
   */
  export const searchTag = async (q:string = '', limit:number = 20, random:number = 0) => {
    try {
      const data = {
        q,
        limit,
        random,
      }
      const response = await ecencyApi.post(`/search-api/search-tag`, data);
      return response.data;
    } catch(error) {
      console.warn("tag search failed", error)
      bugsnag.notify(error);
      throw error
    }
  }



/** 
 * ************************************
 * SCHEDULES ECENCY APIS IMPLEMENTATION 
 * ************************************
 */

/**
 * Adds new post to scheduled posts
 * @param permlink 
 * @param title 
 * @param body 
 * @param meta 
 * @param options 
 * @param scheduleDate 
 * @returns All scheduled posts
 */
export const addSchedule = async (
  permlink:string,
  title:string,
  body:string,
  meta:any,
  options:any,
  scheduleDate:string
) => {
  try {
    const data = {
      title,
      permlink,
      meta,
      body,
      schedule: scheduleDate,
      options,
      reblog: 0,
    }
    const response = await ecencyApi
    .post('/private-api/schedules-add', data)
    return response.data;
  } catch(error) {
    console.warn("Failed to add post to schedule", error)
    bugsnag.notify(error);
    throw error;
  }
}

/**
 * Fetches all scheduled posts against current user
 * @returns array of app scheduled posts
 */
export const getSchedules = async () => {
  try {
    const response = await ecencyApi.post(`/private-api/schedules`)
    return response.data;
  } catch(error){
    console.warn("Failed to get schedules")
    bugsnag.notify(error)
    throw error;
  }
}

/**
 * Removes post from scheduled posts using post id;
 * @param id 
 * @returns array of scheduled posts
 */
export const deleteScheduledPost = async (id:string) => {
  try {
    const data = { id };
    const response = await ecencyApi.post(`/private-api/schedules-delete`, data);
    return response;
  }catch(error){
    console.warn("Failed to delete scheduled post")
    bugsnag.notify(error)
    throw error;
  }
} 

/**
 * Moves scheduled post to draft using schedule id
 * @param id 
 * @returns Array of scheduled posts
 */
export const moveScheduledToDraft = async (id:string) => {
  try {
    const data = { id }
    const response = await ecencyApi.post(`/private-api/schedules-move`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to move scheduled post to drafts")
    bugsnag.notify(error)
    throw error;
  }
}

// Old image service
/** 
 * ************************************
 * IMAGES ECENCY APIS IMPLEMENTATION 
 * ************************************
 */


export const getImages = async () => {
  try {
    const response = await ecencyApi.post('/private-api/images')
    return response.data;
  } catch(error){
    console.warn('Failed to get images', error);
    bugsnag.notify(error);
  }
}

export const addImage = async (url:string) => {
  try {
    const data = { url };
    const response = await ecencyApi.post(`/private-api/images-add`, data);
    return response.data;
  } catch(error) {
    console.warn('Failed to add image', error);
    bugsnag.notify(error);
    throw error;
  }
}

export const deleteImage = async (id:string) => {
  try {
    const data = { id };
    const response = await ecencyApi.post(`/private-api/images-delete`, data);
    return response.data;
  } catch(error) {
    console.warn('Failed to delete image', error);
    bugsnag.notify(error);
    throw error;
  }
}

export const uploadImage = (media, username, sign) => {
  const file = {
    uri: media.path,
    type: media.mime,
    name: media.filename || `img_${Math.random()}.jpg`,
    size: media.size,
  };

  const fData = new FormData();
  fData.append('file', file);

  return upload(fData, username, sign);
};

// New image service

export const getNodes = () => serverList.get().then((resp) => resp.data.hived || SERVER_LIST);



/**
 * refreshes access token using refresh token
 * @param code refresh token
 * @returns scToken (includes accessToken as property)
 */
export const getSCAccessToken = async (code:string) => {
  try{
    const response = await ecencyApi.post('/auth-api/hs-token-refresh', {
      code,
    })
    return response.data;
  }catch(error){
    console.warn("failed to refresh token")
    bugsnag.notify(error);
    throw error
  }
}



  /**
   * fetches promoted posts for tab content
   * @param username for parsing post data
   * @returns array of promoted posts
   */
  export const getPromotedEntries = async (username:string) => {
    try {
      console.log('Fetching promoted entries');
      return ecencyApi.get('/private-api/promoted-entries').then((resp) => {
        return resp.data.map((post_data:any) =>
          post_data ? parsePost(post_data, username, true) : null,
        );
      });
    } catch (error) {
      console.warn("Failed to get promoted enties")
      bugsnag.notify(error);
      return error;
    }
  };



export const purchaseOrder = (data) =>
  api
    .post('/purchase-order', data)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));



export const getPostReblogs = (data) =>
  api
    .get(`/post-reblogs/${data.author}/${data.permlink}`)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));


/**
 * Registers new user with ecency and hive, on confirmation sends 
 * details to user email
 * @param username for new user
 * @param email of new user
 * @param referral username
 * @returns boolean success flag
 */
export const signUp = async (username:string, email:string, referral?:string) => {
  try {
    const data = {
      username,
      email,
      referral
    }
    const response = await ecencyApi.post('/private-api/account-create', data);
    return response.status === 202;
  } catch (error) {
    bugsnag.notify(error);
    throw error;
  }
};
