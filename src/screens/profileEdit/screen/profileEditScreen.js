import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import ActionSheet from 'react-native-actionsheet';

import { ProfileEditContainer } from '../../../containers';

import { AvatarHeader, ProfileEditForm } from '../../../components';

class ProfileEditScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      selectedUploadAction: '',
    };

    this.galleryRef = React.createRef();
  }

  // Component Life Cycles

  // Component Functions
  _showImageUploadActions = (action) => {
    this.setState({ selectedUploadAction: action }, () => {
      this.galleryRef.current.show();
    });
  };

  render() {
    const { intl } = this.props;
    const { selectedUploadAction } = this.state;

    return (
      <ProfileEditContainer>
        {({
          currentAccount,
          isDarkTheme,
          formData,
          handleOnItemChange,
          handleMediaAction,
          name,
          location,
          website,
          about,
          avatarUrl,
          coverUrl,
          isLoading,
          isUploading,
          handleOnSubmit,
        }) => (
          <Fragment>
            <AvatarHeader
              username={get(currentAccount, 'name')}
              name={name}
              reputation={get(currentAccount, 'reputation')}
              avatarUrl={avatarUrl}
              showImageUploadActions={() => this._showImageUploadActions('avatarUrl')}
              isUploading={isUploading && selectedUploadAction === 'avatarUrl'}
            />
            <ProfileEditForm
              formData={formData}
              isDarkTheme={isDarkTheme}
              about={about}
              name={name}
              location={location}
              website={website}
              coverUrl={coverUrl}
              showImageUploadActions={() => this._showImageUploadActions('coverUrl')}
              handleOnItemChange={handleOnItemChange}
              isLoading={isLoading}
              isUploading={isUploading && selectedUploadAction === 'coverUrl'}
              handleOnSubmit={handleOnSubmit}
            />

            <ActionSheet
              ref={this.galleryRef}
              options={[
                intl.formatMessage({
                  id: 'editor.open_gallery',
                }),
                intl.formatMessage({
                  id: 'editor.capture_photo',
                }),
                intl.formatMessage({
                  id: 'alert.cancel',
                }),
              ]}
              cancelButtonIndex={2}
              onPress={(index) => {
                handleMediaAction(
                  index === 0 ? 'image' : index === 1 && 'camera',
                  selectedUploadAction,
                );
              }}
            />
          </Fragment>
        )}
      </ProfileEditContainer>
    );
  }
}

export default injectIntl(ProfileEditScreen);
