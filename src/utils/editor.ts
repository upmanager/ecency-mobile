import getSlug from 'speakingurl';
import { diff_match_patch as diffMatchPatch } from 'diff-match-patch';
import VersionNumber from 'react-native-version-number';

export const getWordsCount = (text) =>
  text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0;

const permlinkRnd = () => (Math.random() + 1).toString(16).substring(2);

export const generatePermlink = (title, random = false) => {
  if (!title) {
    return '';
  }

  const slug = getSlug(title);
  let perm = slug && slug.toString();

  if (title) {
    // make shorter url if possible
    let shortp = perm.split('-');
    if (shortp.length > 5) {
      perm = shortp.slice(0, 5).join('-');
    }

    if (random) {
      const rnd = permlinkRnd();
      perm = `${perm}-${rnd}`;
    }

    // STEEMIT_MAX_PERMLINK_LENGTH
    if (perm.length > 255) {
      perm = perm.substring(perm.length - 255, perm.length);
    }

    // only letters numbers and dashes
    perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, '');

    if (perm.length === 0) {
      return permlinkRnd();
    }
  }

  return perm;
};

export const generateReplyPermlink = (toAuthor) => {
  if (!toAuthor) {
    return '';
  }

  const t = new Date(Date.now());

  const timeFormat = `${t.getFullYear().toString()}${(
    t.getMonth() + 1
  ).toString()}${t
    .getDate()
    .toString()}t${t
    .getHours()
    .toString()}${t
    .getMinutes()
    .toString()}${t.getSeconds().toString()}${t.getMilliseconds().toString()}z`;

  return `re-${toAuthor.replace(/\./g, '')}-${timeFormat}`;
};

export const makeOptions = (postObj) => {
  if (!postObj.author || !postObj.permlink) {
    return {};
  }

  const a = {
    allow_curation_rewards: true,
    allow_votes: true,
    author: postObj.author,
    permlink: postObj.permlink,
    max_accepted_payout: '1000000.000 HBD',
    percent_hbd: 10000,
    extensions: [],
  };
  switch (postObj.operationType) {
    case 'sp':
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_hbd = 0;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) => a.account.localeCompare(b.account));
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;

    case 'dp':
      a.max_accepted_payout = '0.000 HBD';
      a.percent_hbd = 10000;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) => a.account.localeCompare(b.account));
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;

    default:
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_hbd = 10000;
      if (postObj.beneficiaries && postObj.beneficiaries.length > 0) {
        postObj.beneficiaries.sort((a, b) => a.account.localeCompare(b.account));
        a.extensions = [[0, { beneficiaries: postObj.beneficiaries }]];
      }
      break;
  }

  return a;
};

export const makeJsonMetadataReply = (tags) => ({
  tags,
  app: `ecency/${VersionNumber.appVersion}-mobile`,
  format: 'markdown+html',
});

export const makeJsonMetadata = (meta, tags) =>
  Object.assign({}, meta, {
    tags,
    app: `ecency/${VersionNumber.appVersion}-mobile`,
    format: 'markdown+html',
  });

export const makeJsonMetadataForUpdate = (oldJson, meta, tags) => {
  const { meta: oldMeta } = oldJson;
  const mergedMeta = Object.assign({}, oldMeta, meta);

  return Object.assign({}, oldJson, mergedMeta, { tags });
};


const extractUrls = (body:string) => {
  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const mUrls = body && body.match(urlReg);
  return mUrls || [];
}


export const extractImageUrls = ({body, urls}:{body?:string, urls?:string[]}) => {
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|heic|webp))/gim;

  let imgUrls = [];
  const mUrls = urls || extractUrls(body);

  mUrls.forEach((url)=>{
    const isImage = url.match(imgReg);
    if (isImage) {
      imgUrls.push(url);
    }
  })

  return imgUrls;
}

export const extractMetadata = (body:string, thumbIndex?:number) => {
  const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;

  const out = {};

  const mUrls = extractUrls(body);
  const mUsers = body && body.match(userReg);

  const matchedImages = extractImageUrls({urls:mUrls});
  const matchedLinks = [];
  const matchedUsers = [];

  if (mUrls) {
    mUrls.forEach((url)=>{
      if(matchedImages.indexOf(url) < 0){
        matchedLinks.push(url);
      }
    })
  }

  if (matchedLinks.length) {
    out.links = matchedLinks;
  }

  if (matchedImages.length) {
    if(thumbIndex){
      matchedImages.splice(0, 0, matchedImages.splice(thumbIndex, 1)[0]);
    }
    
    out.image = matchedImages;
  }

  if (mUsers) {
    for (let i = 0; i < mUsers.length; i++) {
      matchedUsers.push(mUsers[i].trim().substring(1));
    }
  }

  if (matchedUsers.length) {
    out.users = matchedUsers;
  }

  return out;
};

export const createPatch = (text1, text2) => {
  if (!text1 && text1 === '') {
    return undefined;
  }

  const dmp = new diffMatchPatch();
  const patches = dmp.patch_make(text1, text2);
  const patch = dmp.patch_toText(patches);

  return patch;
};
