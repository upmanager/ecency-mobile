import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import get from 'lodash/get';

import { postBodySummary, renderPostBody } from '@esteemapp/esteem-render-helpers';

// Dsteem
import { getActiveVotes } from '../providers/steem/dsteem';
import { getPostReblogs } from '../providers/esteem/esteem';

// Utils
import { getReputation } from './reputation';
import { getResizedImage, getResizedAvatar } from './image';

export const parsePosts = async (posts, currentUserName) => {
  if (posts) {
    const promises = posts.map(post => parsePost(post, currentUserName));
    const formattedPosts = await Promise.all(promises);
    return formattedPosts;
  }
  return null;
};

export const parsePost = async (post, currentUserName, isPromoted) => {
  if (!post) {
    return null;
  }
  const activeVotes = await getActiveVotes(get(post, 'author'), get(post, 'permlink'));
  if (currentUserName === post.author) {
    post.markdownBody = post.body;
  }
  post.is_promoted = isPromoted;
  post.json_metadata = JSON.parse(post.json_metadata);
  post.image = postImage(post.json_metadata, post.body);
  post.active_votes = activeVotes;
  post.vote_count = post.active_votes.length;
  post.author_reputation = getReputation(post.author_reputation);
  post.avatar = getResizedAvatar(get(post, 'author'));
  post.active_votes.sort((a, b) => b.rshares - a.rshares);

  post.body = renderPostBody(post);
  post.summary = postBodySummary(post, 150);
  post.is_declined_payout = Number(parseFloat(post.max_accepted_payout)) === 0;

  if (currentUserName) {
    post.is_voted = isVoted(post.active_votes, currentUserName);
    post.is_down_voted = isDownVoted(post.active_votes, currentUserName);
  } else {
    post.is_voted = false;
    post.is_down_voted = false;
  }

  post.active_votes = parseActiveVotes(post, currentUserName);

  post.reblogs = await getPostReblogs(post);
  post.reblogCount = get(post, 'reblogs', []).length;

  return post;
};

const postImage = (metaData, body) => {
  const imgTagRegex = /(<img[^>]*>)/g;
  const markdownImageRegex = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
  // eslint-disable-next-line max-len
  const urlRegex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gm;
  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  let imageLink;

  if (metaData && metaData.image && metaData.image[0]) {
    [imageLink] = metaData.image;
  } else if (body && markdownImageRegex.test(body)) {
    const markdownMatch = body.match(markdownImageRegex);
    if (markdownMatch[0]) {
      const firstMarkdownMatch = markdownMatch[0];
      [imageLink] = firstMarkdownMatch.match(urlRegex);
    }
  }

  if (!imageLink && imageRegex.test(body)) {
    const imageMatch = body.match(imageRegex);
    [imageLink] = imageMatch;
  }

  if (!imageLink && imgTagRegex.test(body)) {
    const _imgTag = body.match(imgTagRegex);
    const match = _imgTag[0].match(urlRegex);

    if (match && match[0]) {
      [imageLink] = match;
    }
  }

  if (imageLink) {
    return getResizedImage(imageLink, 640);
  }
  return '';
};

export const parseComments = async (comments, currentUserName) => {
  const pArray = comments.map(async comment => {
    const activeVotes = await getActiveVotes(get(comment, 'author'), get(comment, 'permlink'));

    if (comment.body.includes('Posted using [Partiko')) {
      comment.body = comment.body
        .split('\n')
        .filter(item => item.includes('Posted using [Partiko') === false)
        .join('\n');
    }
    comment.pending_payout_value = parseFloat(get(comment, 'pending_payout_value', 0)).toFixed(3);
    comment.author_reputation = getReputation(get(comment, 'author_reputation'));
    comment.avatar = getResizedAvatar(get(comment, 'author'));
    comment.markdownBody = get(comment, 'body');
    comment.body = renderPostBody(comment);
    comment.active_votes = activeVotes;
    comment.vote_count = activeVotes && activeVotes.length;

    if (currentUserName && activeVotes && activeVotes.length > 0) {
      comment.is_voted = isVoted(activeVotes, currentUserName);
      comment.is_down_voted = isDownVoted(comment.active_votes, currentUserName);
    } else {
      comment.is_voted = false;
      comment.is_down_voted = false;
    }

    comment.active_votes = parseActiveVotes(comment, currentUserName);

    return comment;
  });

  const _comments = await Promise.all(pArray);

  return _comments;
};

const isVoted = (activeVotes, currentUserName) => {
  const result = activeVotes.find(
    element => get(element, 'voter') === currentUserName && get(element, 'percent', 0) > 0,
  );
  if (result) {
    return result.percent;
  }
  return false;
};

const isDownVoted = (activeVotes, currentUserName) => {
  const result = activeVotes.find(
    element => get(element, 'voter') === currentUserName && get(element, 'percent') < 0,
  );
  if (result) {
    return result.percent;
  }
  return false;
};

const parseActiveVotes = (post, currentUserName) => {
  const totalPayout =
    parseFloat(post.pending_payout_value) +
    parseFloat(post.total_payout_value) +
    parseFloat(post.curator_payout_value);

  post.total_payout = totalPayout.toFixed(3);

  const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares || 0;

  if (!isEmpty(post.active_votes)) {
    forEach(post.active_votes, value => {
      post.vote_percent = value.voter === currentUserName ? value.percent : null;
      value.value = (value.rshares * ratio).toFixed(3);
      value.reputation = getReputation(get(value, 'reputation'));
      value.percent /= 100;
      value.is_down_vote = Math.sign(value.percent) < 0;
      value.avatar = getResizedAvatar(get(value, 'voter'));
    });
  }

  return post.active_votes;
};
