import { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import ImagePicker from 'react-native-image-crop-picker';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';

import { uploadImage } from '../providers/ecency/ecency';

import { profileUpdate, signImage } from '../providers/hive/dhive';
import { updateCurrentAccount } from '../redux/actions/accountAction';
import { setAvatarCacheStamp } from '../redux/actions/uiAction';

// import ROUTES from '../constants/routeNames';

const FORM_DATA = [
  {
    valueKey: 'name',
    type: 'text',
    label: 'display_name',
    placeholder: '',
  },
  {
    valueKey: 'about',
    type: 'text',
    label: 'about',
    placeholder: '',
  },
  {
    valueKey: 'location',
    type: 'text',
    label: 'location',
    placeholder: '',
  },
  {
    valueKey: 'website',
    type: 'text',
    label: 'website',
    placeholder: '',
  },
];

class ProfileEditContainer extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isUploading: false,
      saveEnabled: false,
      about: get(props.currentAccount, 'about.profile.about'),
      name: get(props.currentAccount, 'about.profile.name'),
      location: get(props.currentAccount, 'about.profile.location'),
      website: get(props.currentAccount, 'about.profile.website'),
      coverUrl: get(props.currentAccount, 'about.profile.cover_image'),
      avatarUrl: get(props.currentAccount, 'avatar'),
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleOnItemChange = (val, item) => {
    this.setState({ [item]: val, saveEnabled:true });
  };

  _uploadImage = async (media, action) => {
    const { intl, currentAccount, pinCode } = this.props;

    this.setState({ isUploading: true });

    let sign = await signImage(media, currentAccount, pinCode);

    uploadImage(media, currentAccount.name, sign)
      .then((res) => {
        if (res.data && res.data.url) {
          this.setState({ [action]: res.data.url, isUploading: false, saveEnabled:true });
        }
      })
      .catch((error) => {
        if (error) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            error.message || error.toString(),
          );
        }
        this.setState({ isUploading: false });
      });
  };

  _handleMediaAction = (type, uploadAction) => {
    if (type === 'camera') {
      this._handleOpenCamera(uploadAction);
    } else if (type === 'image') {
      this._handleOpenImagePicker(uploadAction);
    }
  };

  _handleOpenImagePicker = (action) => {
    ImagePicker.openPicker(
      action == 'avatarUrl' ? IMAGE_PICKER_AVATAR_OPTIONS : IMAGE_PICKER_COVER_OPTIONS,
    )
      .then((media) => {
        this._uploadImage(media, action);
      })
      .catch((e) => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleOpenCamera = (action) => {
    ImagePicker.openCamera(
      action == 'avatarUrl' ? IMAGE_PICKER_AVATAR_OPTIONS : IMAGE_PICKER_COVER_OPTIONS,
    )
      .then((media) => {
        this._uploadImage(media, action);
      })
      .catch((e) => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleMediaOnSelectFailure = (error) => {
    const { intl } = this.props;

    if (get(error, 'code') === 'E_PERMISSION_MISSING') {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.permission_denied',
        }),
        intl.formatMessage({
          id: 'alert.permission_text',
        }),
      );
    }
  };

  _handleOnSubmit = async () => {
    const { currentAccount, pinCode, dispatch, navigation, intl } = this.props;
    const { name, location, website, about, coverUrl, avatarUrl } = this.state;

    this.setState({ isLoading: true });

    const params = {
      profile_image: avatarUrl,
      cover_image: coverUrl,
      name,
      website,
      about,
      location,
      version: 2,
    };

    try {
      await profileUpdate(params, pinCode, currentAccount);

      const _currentAccount = { ...currentAccount, display_name: name, avatar: avatarUrl };
      _currentAccount.about.profile = { ...params };

      dispatch(updateCurrentAccount(_currentAccount));
      dispatch(setAvatarCacheStamp(new Date().getTime()));
      this.setState({ isLoading: false });
      navigation.state.params.fetchUser();
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(error, 'message', error.toString()),
      );
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { children, currentAccount, isDarkTheme } = this.props;
    const {
      isLoading,
      isUploading,
      name,
      location,
      website,
      about,
      coverUrl,
      avatarUrl,
      saveEnabled
    } = this.state;

    return (
      children &&
      children({
        about,
        avatarUrl,
        coverUrl,
        currentAccount,
        formData: FORM_DATA,
        handleMediaAction: this._handleMediaAction,
        handleOnItemChange: this._handleOnItemChange,
        handleOnSubmit: this._handleOnSubmit,
        isDarkTheme,
        isLoading,
        isUploading,
        location,
        name,
        website,
        saveEnabled
      })
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  isDarkTheme: state.application.isDarkTheme,
  pinCode: state.application.pin,
});

export default connect(mapStateToProps)(injectIntl(withNavigation(ProfileEditContainer)));

const IMAGE_PICKER_AVATAR_OPTIONS = {
  includeBase64: true,
  cropping:true,
  width: 512,
  height: 512,
};

const IMAGE_PICKER_COVER_OPTIONS = {
  includeBase64: true,
};
