import * as dsteem from '@esteemapp/dhive';
import sha256 from 'crypto-js/sha256';
import Config from 'react-native-config';
import get from 'lodash/get';

import { Alert } from 'react-native';
import { getDigitPinCode, getMutes, getUser } from './dhive';
import {
  setUserData,
  setAuthStatus,
  getUserDataWithUsername,
  updateUserData,
  updateCurrentUsername,
  getUserData,
  setSCAccount,
  getSCAccount,
  setPinCode,
  getPinCode,
} from '../../realm/realm';
import { encryptKey, decryptKey } from '../../utils/crypto';
import hsApi from './hivesignerAPI';
import { getSCAccessToken, getUnreadNotificationCount } from '../ecency/ecency';

// Constants
import AUTH_TYPE from '../../constants/authType';
import { makeHsCode } from '../../utils/hive-signer-helper';

export const login = async (username, password, isPinCodeOpen) => {
  let loginFlag = false;
  let avatar = '';
  let authType = '';
  // Get user account data from HIVE Blockchain
  const account = await getUser(username);
  const isUserLoggedIn = await isLoggedInUser(username);

  if (!account) {
    return Promise.reject(new Error('auth.invalid_username'));
  }

  if (isUserLoggedIn) {
    return Promise.reject(new Error('auth.already_logged'));
  }

  // Public keys of user
  const publicKeys = {
    activeKey: get(account, 'active.key_auths', []).map((x) => x[0])[0],
    memoKey: get(account, 'memo_key', ''),
    ownerKey: get(account, 'owner.key_auths', []).map((x) => x[0])[0],
    postingKey: get(account, 'posting.key_auths', []).map((x) => x[0])[0],
  };

  // // Set private keys of user
  const privateKeys = getPrivateKeys(username, password);

  // Check all keys
  Object.keys(publicKeys).map((pubKey) => {
    if (publicKeys[pubKey] === privateKeys[pubKey].createPublic().toString()) {
      loginFlag = true;
      if (privateKeys.isMasterKey) {
        authType = AUTH_TYPE.MASTER_KEY;
      } else {
        authType = pubKey;
      }
    }
  });

  const signerPrivateKey = privateKeys.ownerKey || privateKeys.activeKey || privateKeys.postingKey;
  const code = await makeHsCode(account.name, signerPrivateKey);
  const scTokens = await getSCAccessToken(code);
  account.unread_activity_count = await getUnreadNotificationCount(
    scTokens ? scTokens.access_token : '',
  );
  account.mutes = await getMutes(account.username);

  let jsonMetadata;
  try {
    jsonMetadata = JSON.parse(account.posting_json_metadata) || '';
  } catch (err) {
    jsonMetadata = '';
  }
  if (Object.keys(jsonMetadata).length !== 0) {
    avatar = jsonMetadata.profile.profile_image || '';
  }
  if (loginFlag) {
    const userData = {
      username,
      avatar,
      authType,
      masterKey: '',
      postingKey: '',
      activeKey: '',
      memoKey: '',
      accessToken: '',
    };

    if (isPinCodeOpen) {
      account.local = userData;
    } else {
      const resData = {
        pinCode: Config.DEFAULT_PIN,
        password,
        accessToken: get(scTokens, 'access_token', ''),
      };
      const updatedUserData = await getUpdatedUserData(userData, resData);

      account.local = updatedUserData;
      account.local.avatar = avatar;
    }

    const authData = {
      isLoggedIn: true,
      currentUsername: username,
    };
    await setAuthStatus(authData);
    await setSCAccount(scTokens);

    // Save user data to Realm DB
    await setUserData(account.local);
    await updateCurrentUsername(account.name);
    return {
      ...account,
      password,
    };
  }
  return Promise.reject(new Error('auth.invalid_credentials'));
};

export const loginWithSC2 = async (code, isPinCodeOpen) => {
  const scTokens = await getSCAccessToken(code);
  await hsApi.setAccessToken(get(scTokens, 'access_token', ''));
  const scAccount = await hsApi.me();
  const account = await getUser(scAccount.account.name);
  let avatar = '';

  return new Promise(async (resolve, reject) => {
    account.unread_activity_count = await getUnreadNotificationCount(
      scTokens ? scTokens.access_token : '',
    );
    account.mutes = await getMutes(account.username);

    let jsonMetadata;
    try {
      jsonMetadata = JSON.parse(account.posting_json_metadata) || '';
      if (Object.keys(jsonMetadata).length !== 0) {
        avatar = jsonMetadata.profile.profile_image || '';
      }
    } catch (error) {
      jsonMetadata = '';
    }
    const userData = {
      username: account.name,
      avatar,
      authType: AUTH_TYPE.STEEM_CONNECT,
      masterKey: '',
      postingKey: '',
      activeKey: '',
      memoKey: '',
      accessToken: '',
    };
    const isUserLoggedIn = await isLoggedInUser(account.name);

    if (isPinCodeOpen) {
      account.local = userData;
    } else {
      const resData = {
        pinCode: Config.DEFAULT_PIN,
        accessToken: get(scTokens, 'access_token', ''),
      };
      const updatedUserData = await getUpdatedUserData(userData, resData);

      account.local = updatedUserData;
      account.local.avatar = avatar;
    }

    if (isUserLoggedIn) {
      reject(new Error('auth.already_logged'));
    }

    setUserData(account.local)
      .then(async () => {
        updateCurrentUsername(account.name);
        const authData = {
          isLoggedIn: true,
          currentUsername: account.name,
        };
        await setAuthStatus(authData);
        await setSCAccount(scTokens);
        resolve({
          ...account,
          accessToken: get(scTokens, 'access_token', ''),
        });
      })
      .catch(() => {
        reject(new Error('auth.unknow_error'));
      });
  });
};

export const setUserDataWithPinCode = async (data) => {
  try {
    const result = await getUserDataWithUsername(data.username);
    const userData = result[0];

    if (!data.password) {
      const publicKey =
        get(userData, 'masterKey') ||
        get(userData, 'activeKey') ||
        get(userData, 'memoKey') ||
        get(userData, 'postingKey');

      if (publicKey) {
        data.password = decryptKey(publicKey, get(data, 'pinCode'));
      }
    }

    const updatedUserData = getUpdatedUserData(userData, data);

    await setPinCode(get(data, 'pinCode'));
    await updateUserData(updatedUserData);

    return updatedUserData;
  } catch (error) {
    console.warn('Failed to set user data with pin: ', data, error);
    return Promise.reject(new Error('auth.unknow_error'));
  }
};

export const updatePinCode = (data) =>
  new Promise((resolve, reject) => {
    let currentUser = null;
    try {
      setPinCode(get(data, 'pinCode'));
      getUserData()
        .then(async (users) => {
          const _onDecryptError = () => {
            throw new Error('Decryption failed');
          };
          if (users && users.length > 0) {
            users.forEach((userData) => {
              if (
                get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
                get(userData, 'authType', '') === AUTH_TYPE.ACTIVE_KEY ||
                get(userData, 'authType', '') === AUTH_TYPE.MEMO_KEY ||
                get(userData, 'authType', '') === AUTH_TYPE.POSTING_KEY
              ) {
                const publicKey =
                  get(userData, 'masterKey') ||
                  get(userData, 'activeKey') ||
                  get(userData, 'memoKey') ||
                  get(userData, 'postingKey');

                const password = decryptKey(
                  publicKey,
                  get(data, 'oldPinCode', ''),
                  _onDecryptError,
                );
                if (password === undefined) {
                  return;
                }

                data.password = password;
              } else if (get(userData, 'authType', '') === AUTH_TYPE.STEEM_CONNECT) {
                const accessToken = decryptKey(
                  get(userData, 'accessToken'),
                  get(data, 'oldPinCode', ''),
                  _onDecryptError,
                );
                if (accessToken === undefined) {
                  return;
                }
                data.accessToken = accessToken;
              }
              const updatedUserData = getUpdatedUserData(userData, data);
              updateUserData(updatedUserData);
              if (userData.username === data.username) {
                currentUser = updatedUserData;
              }
            });
            resolve(currentUser);
          }
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error.message);
    }
  });

export const verifyPinCode = async (data) => {
  try {
    const pinHash = await getPinCode();

    const result = await getUserDataWithUsername(data.username);
    const userData = result[0];

    // This is migration for new pin structure, it will remove v2.2
    if (!pinHash) {
      try {
        if (get(userData, 'authType', '') === AUTH_TYPE.STEEM_CONNECT) {
          decryptKey(get(userData, 'accessToken'), get(data, 'pinCode'));
        } else {
          decryptKey(userData.masterKey, get(data, 'pinCode'));
        }
        await setPinCode(get(data, 'pinCode'));
      } catch (error) {
        return Promise.reject(new Error('Invalid pin code, please check and try again'));
      }
    }

    if (sha256(get(data, 'pinCode')).toString() !== pinHash) {
      return Promise.reject(new Error('auth.invalid_pin'));
    }

    return true;
  } catch (err) {
    console.warn('Failed to verify pin in auth: ', data, err);
    return Promise.reject(err);
  }
};

export const refreshSCToken = async (userData, pinCode) => {
  const scAccount = await getSCAccount(userData.username);
  const now = new Date().getTime();
  const expireDate = new Date(scAccount.expireDate).getTime();

  try {
    const newSCAccountData = await getSCAccessToken(scAccount.refreshToken);

    await setSCAccount(newSCAccountData);
    const accessToken = newSCAccountData.access_token;
    const encryptedAccessToken = encryptKey(accessToken, pinCode);
    await updateUserData({
      ...userData,
      accessToken: encryptedAccessToken,
    });
    return encryptedAccessToken;
  } catch (error) {
    if (now > expireDate) {
      throw error;
    } else {
      console.warn('token failed to refresh but current token is still valid');
    }
  }
};

export const switchAccount = (username) =>
  new Promise((resolve, reject) => {
    getUser(username)
      .then((account) => {
        updateCurrentUsername(username)
          .then(() => {
            resolve(account);
          })
          .catch(() => {
            reject(new Error('auth.unknow_error'));
          });
      })
      .catch(() => {
        reject(new Error('auth.unknow_error'));
      });
  });

const getPrivateKeys = (username, password) => {
  try {
    return {
      activeKey: dsteem.PrivateKey.from(password),
      memoKey: dsteem.PrivateKey.from(password),
      ownerKey: dsteem.PrivateKey.from(password),
      postingKey: dsteem.PrivateKey.from(password),
      isMasterKey: false,
    };
  } catch (e) {
    return {
      activeKey: dsteem.PrivateKey.fromLogin(username, password, 'active'),
      memoKey: dsteem.PrivateKey.fromLogin(username, password, 'memo'),
      ownerKey: dsteem.PrivateKey.fromLogin(username, password, 'owner'),
      postingKey: dsteem.PrivateKey.fromLogin(username, password, 'posting'),
      isMasterKey: true,
    };
  }
};

export const getUpdatedUserData = (userData, data) => {
  const privateKeys = getPrivateKeys(get(userData, 'username', ''), get(data, 'password'));

  return {
    username: get(userData, 'username', ''),
    authType: get(userData, 'authType', ''),
    accessToken: encryptKey(data.accessToken, get(data, 'pinCode')),

    masterKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY
        ? encryptKey(data.password, get(data, 'pinCode'))
        : '',
    postingKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
      get(userData, 'authType', '') === AUTH_TYPE.POSTING_KEY
        ? encryptKey(get(privateKeys, 'postingKey', '').toString(), get(data, 'pinCode'))
        : '',
    activeKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
      get(userData, 'authType', '') === AUTH_TYPE.ACTIVE_KEY
        ? encryptKey(get(privateKeys, 'activeKey', '').toString(), get(data, 'pinCode'))
        : '',
    memoKey:
      get(userData, 'authType', '') === AUTH_TYPE.MASTER_KEY ||
      get(userData, 'authType', '') === AUTH_TYPE.MEMO_KEY
        ? encryptKey(get(privateKeys, 'memoKey', '').toString(), get(data, 'pinCode'))
        : '',
  };
};

const isLoggedInUser = async (username) => {
  const result = await getUserDataWithUsername(username);
  if (result.length > 0) {
    return true;
  }
  return false;
};

/**
 * This migration snippet is used to update access token for users logged in using masterKey
 * accessToken is required for all ecency api calls even for non hivesigner users.
 */
export const migrateToMasterKeyWithAccessToken = async (account, userData, pinHash) => {
  //get username, user local data from account;
  const username = account.name;

  //decrypt password from local data
  const pinCode = getDigitPinCode(pinHash);
  const password = decryptKey(
    userData.masterKey || userData.activeKey || userData.postingKey || userData.memoKey,
    pinCode,
  );

  // Set private keys of user
  const privateKeys = getPrivateKeys(username, password);

  const signerPrivateKey =
    privateKeys.ownerKey || privateKeys.activeKey || privateKeys.postingKey || privateKeys.memoKey;
  const code = await makeHsCode(account.name, signerPrivateKey);
  const scTokens = await getSCAccessToken(code);

  await setSCAccount(scTokens);
  const accessToken = scTokens.access_token;

  //update data
  const localData = {
    ...userData,
    accessToken: encryptKey(accessToken, pinCode),
  };
  //update realm
  await updateUserData(localData);

  //return account with update local data
  account.local = localData;
  return account;
};
