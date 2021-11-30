import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import { get } from 'lodash';
import { Platform } from 'react-native';
import { postBodySummary, renderPostBody, catchPostImage } from '@ecency/render-helper';
import FastImage from 'react-native-fast-image';

// Utils
import parseAsset from './parseAsset';
import { getResizedAvatar } from './image';
import { parseReputation } from './user';

const webp = Platform.OS === 'ios' ? false : true;

export const parsePosts = (posts, currentUserName) => {
  if (posts) {
    const formattedPosts = posts.map((post) =>
      parsePost(post, currentUserName, false, true),
    );
    return formattedPosts;
  }
  return null;
};

export const parsePost = (post, currentUserName, isPromoted, isList = false) => {
  if (!post) {
    return null;
  }

  if (currentUserName === post.author) {
    post.markdownBody = post.body;
  }
  post.is_promoted = isPromoted;
  if (typeof post.json_metadata === 'string' || post.json_metadata instanceof String) {
    try {
      post.json_metadata = JSON.parse(post.json_metadata);
    } catch (error) {
      post.json_metadata = {};
    }
  }

  //adjust tags type as it can be string sometimes;
  post = parseTags(post);


  //extract cover image and thumbnail from post body
  post.image = catchPostImage(post, 600, 500, webp ? 'webp' : 'match');
  post.thumbnail = catchPostImage(post, 10, 7, webp ? 'webp' : 'match');

  post.author_reputation = parseReputation(post.author_reputation);
  post.avatar = getResizedAvatar(get(post, 'author'));
  if (!isList) {
    post.body = renderPostBody(post, true, webp);
  }
  post.summary = postBodySummary(post, 150);
  post.is_declined_payout = parseAsset(post.max_accepted_payout).amount === 0;

  const totalPayout =
    parseAsset(post.pending_payout_value).amount +
    parseAsset(post.author_payout_value).amount +
    parseAsset(post.curator_payout_value).amount;

  post.total_payout = totalPayout;
  post.maxPayout = parseAsset(post.max_accepted_payout).amount || 0;


  //stamp posts with fetched time;
  post.post_fetched_at = new Date().getTime();

  //discard post body if list
  if (isList) {
    post.body = '';
  }

  //cache image
  if (post.image) {
    FastImage.preload([{ uri: post.image }]);
  }

  return post;
};


export const parseCommentThreads = async (commentsMap:any, author:string, permlink:string) => {
  const MAX_THREAD_LEVEL = 3;
  const comments = [];
  
  if(!commentsMap){
    return null;
  }


  //traverse map to curate threads
  const parseReplies = (commentsMap:any, replies:any[], level:number) => {
    if(replies && replies.length > 0 && MAX_THREAD_LEVEL > level){
      return replies.map((pathKey)=>{
        const comment = commentsMap[pathKey];
        if(comment){
          const parsedComment = parseComment(comment);
          parsedComment.replies = parseReplies(commentsMap, parsedComment.replies, level + 1)
          return parsedComment;
        }else{
          return null;
        }
      });
    }
    return [];
  }

  for(const key in commentsMap){
    if(commentsMap.hasOwnProperty(key)){

      const comment = parseComment(commentsMap[key]);

      if(comment && comment.parent_author === author && comment.parent_permlink === permlink){
        //extract replies
        comment.replies = parseReplies(commentsMap, comment.replies, 1)
        comments.push(comment);
      }
      
    }
  }

  return comments;
};



export const parseComments = (comments:any[]) => {
  if(!comments){
    return null;
  }

  return comments.map((comment)=>parseComment(comment));
};

export const parseComment = (comment:any) => {
  comment.pending_payout_value = parseFloat(get(comment, 'pending_payout_value', 0)).toFixed(3);
  comment.author_reputation = parseReputation(get(comment, 'author_reputation'));
  comment.avatar = getResizedAvatar(get(comment, 'author'));
  comment.markdownBody = get(comment, 'body');
  comment.body = renderPostBody(comment, true, webp);

  //parse json meta;
  if (typeof comment.json_metadata === 'string' || comment.json_metadata instanceof String) {
    try {
      comment.json_metadata = JSON.parse(comment.json_metadata);
    } catch (error) {
      comment.json_metadata = {};
    }
  }

  //adjust tags type as it can be string sometimes;
  comment = parseTags(comment);
  

  //calculate and set total_payout to show to user.
  const totalPayout =
    parseAsset(comment.pending_payout_value).amount +
    parseAsset(comment.author_payout_value).amount +
    parseAsset(comment.curator_payout_value).amount;

  comment.total_payout = totalPayout;
  comment.maxPayout = parseAsset(comment.max_accepted_payout).amount || 0;

  //stamp comments with fetched time;
  comment.post_fetched_at = new Date().getTime();

  return comment;
};

export const isVoted = async (activeVotes, currentUserName) => {
  if (!currentUserName) {
    return false;
  }
  const result = activeVotes.find(
    (element) => get(element, 'voter') === currentUserName && get(element, 'rshares', 0) > 0,
  );
  if (result) {
    return result.rshares;
  }
  return false;
};

export const isDownVoted = async (activeVotes, currentUserName) => {
  if (!currentUserName) {
    return false;
  }
  const result = activeVotes.find(
    (element) => get(element, 'voter') === currentUserName && get(element, 'rshares') < 0,
  );
  if (result) {
    return result.rshares;
  }
  return false;
};

export const parseActiveVotes = (post) => {
  const totalPayout =
    post.total_payout ||
    parseFloat(post.pending_payout_value) +
      parseFloat(post.total_payout_value) +
      parseFloat(post.curator_payout_value);

  const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares || 0;

  if (!isEmpty(post.active_votes)) {
    forEach(post.active_votes, (value) => {
      value.reward = (value.rshares * ratio).toFixed(3);
      value.percent /= 100;
      value.is_down_vote = Math.sign(value.percent) < 0;
      value.avatar = getResizedAvatar(get(value, 'voter'));
    });
  }

  return post.active_votes;
};


const parseTags = (post:any) => {
  if(post.json_metadata){
    let _tags =  get(post.json_metadata, 'tags', []);
    if(typeof _tags === 'string'){
      let separator = ' ';
      if(_tags.indexOf(', ') > -1){
        separator = ', ';
      }else if(_tags.indexOf(',') > -1){
        separator = ',';
      }
      post.json_metadata.tags = _tags.split(separator)
    }
  }
  return post;
}