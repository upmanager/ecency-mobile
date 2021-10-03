import React, { Component } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';
import { get, isNull } from 'lodash';

// Utils
import { getWordsCount } from '../../../utils/editor';

// Components
import {
  BasicHeader,
  TitleArea,
  TagArea,
  TagInput,
  SummaryArea,
  PostForm,
  MarkdownEditor,
  SelectCommunityAreaView,
  SelectCommunityModalContainer,
  Modal,
  UserAvatar,
  MainButton,
} from '../../../components';

// dhive

import { getCommunity } from '../../../providers/hive/dhive';

// Styles
import globalStyles from '../../../globalStyles';
import { isCommunity } from '../../../utils/communityValidation';

import styles from './editorScreenStyles';
import ThumbSelectionModal from '../children/thumbSelectionModal';

class EditorScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */
  thumbSelectionModalRef = null;

  constructor(props) {
    super(props);
    this.state = {
      isFormValid: false,
      isPreviewActive: false,
      wordsCount: null,
      isRemoveTag: false,
      fields: {
        title: (props.draftPost && props.draftPost.title) || '',
        body: (props.draftPost && props.draftPost.body) || '',
        tags: (props.draftPost && props.draftPost.tags) || props.tags || [],
        community: props.community || [],
        isValid: false,
      },
      isCommunitiesListModalOpen: false,
      selectedCommunity: null,
      selectedAccount: null,
    };
  }

  // Component Life Cycles
  componentDidMount() {
    const { draftPost, currentAccount } = this.props;

    if (draftPost) {
      if (draftPost.tags?.length > 0 && isCommunity(draftPost.tags[0])) {
        this._getCommunity(draftPost.tags[0]);
      } else {
        this.setState({
          selectedAccount: currentAccount,
        });
      }
    }
  }

  componentWillUnmount() {
    const { isReply, isEdit } = this.props;
    if (!isReply && !isEdit) {
      this._saveDraftToDB();
    }
  }

  UNSAFE_componentWillReceiveProps = async (nextProps) => {
    const { draftPost, isUploading, community, currentAccount } = this.props;
    if (nextProps.draftPost && draftPost !== nextProps.draftPost) {
      if (nextProps.draftPost.tags?.length > 0 && isCommunity(nextProps.draftPost.tags[0])) {
        this._getCommunity(nextProps.draftPost.tags[0]);
      } else {
        this.setState({
          selectedAccount: currentAccount,
        });
      }

      await this.setState((prevState) => {
        if (community && community.length > 0) {
          nextProps.draftPost.tags = [...community, ...nextProps.draftPost.tags];
        }
        return {
          fields: {
            ...prevState.fields,
            ...nextProps.draftPost,
          },
        };
      });
    }

    if (isUploading !== nextProps) {
      this._handleFormUpdate();
    }
  };

  // Component Functions
  _initialFields = () => {
    const { initialEditor } = this.props;

    this.setState({
      fields: {
        title: '',
        body: '',
        tags: [],
        isValid: false,
      },
      isRemoveTag: true,
    });

    if (initialEditor) {
      initialEditor();
    }
  };

  _handleOnPressPreviewButton = () => {
    const { isPreviewActive } = this.state;

    this.setState({ isPreviewActive: !isPreviewActive }, () => {
      this._handleIsFormValid();
    });
  };

  _setWordsCount = (content) => {
    const _wordsCount = getWordsCount(content);
    const { wordsCount } = this.state;

    if (_wordsCount !== wordsCount) {
      this.setState({ wordsCount: _wordsCount });
    }
  };

  _handleOnSaveButtonPress = () => {
    this._saveDraftToDB();
  };

  _saveCurrentDraft = (fields) => {
    const { saveCurrentDraft } = this.props;

    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }

    this.changeTimer = setTimeout(() => {
      saveCurrentDraft(fields);
    }, 300);
  };

  _handleOnSubmit = () => {
    const { handleOnSubmit } = this.props;
    const { fields } = this.state;

    if (handleOnSubmit) {
      handleOnSubmit({ fields });
    }
  };

  _handleOnThumbSelection = (index) => {
    const { setThumbIndex } = this.props;
    if (setThumbIndex) {
      setThumbIndex(index);
    }
  };

  _showThumbSelectionModal = () => {
    const { fields } = this.state;
    if (this.thumbSelectionModalRef) {
      this.thumbSelectionModalRef.show(fields.body);
    }
  };

  _handleIsFormValid = (bodyText) => {
    const { fields } = this.state;
    const { isReply, isLoggedIn } = this.props;
    let isFormValid;

    if (isReply) {
      isFormValid = get(fields, 'body').length > 0;
    } else {
      isFormValid =
        get(fields, 'title', '') &&
        get(fields, 'title', '').length < 255 &&
        (get(fields, 'body', '') || (bodyText && bodyText > 0)) &&
        get(fields, 'tags', null) &&
        get(fields, 'tags', null).length <= 10 &&
        isLoggedIn;
    }
    this.setState({ isFormValid });
  };

  _handleFormUpdate = (componentID, content) => {
    const { handleFormChanged } = this.props;
    const { fields: _fields } = this.state;
    const fields = { ..._fields };

    if (componentID === 'body') {
      fields.body = content;
    } else if (componentID === 'title') {
      fields.title = content;
    } else if (componentID === 'tag-area') {
      fields.tags = content;
    }

    if (
      get(fields, 'body', '').trim() !== get(_fields, 'body', '').trim() ||
      get(fields, 'title', '').trim() !== get(_fields, 'title', '').trim() ||
      get(fields, 'tags') !== get(_fields, 'tags')
    ) {
      handleFormChanged();
      this._saveCurrentDraft(fields);
    }

    this.setState({ fields }, () => {
      this._handleIsFormValid();
    });
  };

  _handleOnTagAdded = async (tags) => {
    const { currentAccount } = this.props;

    if (tags.length > 0) {
      if (!isCommunity(tags[0])) {
        this.setState({
          selectedCommunity: null,
          selectedAccount: currentAccount,
        });
      }
    }

    const { fields: _fields } = this.state;
    const __tags = tags; //.map((t) => t.replace(/([^a-z0-9-]+)/gi, '').toLowerCase());
    const __fields = { ..._fields, tags: __tags };
    this.setState({ fields: __fields, isRemoveTag: false }, () => {
      this._handleFormUpdate('tag-area', __fields.tags);
    });
  };

  _handleChangeTitle = (text) => {
    const { fields: _fields } = this.state;

    _fields.title = text;

    this.setState({ fields: _fields }, () => {
      this._handleFormUpdate('title', _fields.title);
    });
  };

  _handlePressCommunity = (community) => {
    const { fields, selectedCommunity } = this.state;
    const { currentAccount } = this.props;

    const tags = [...fields.tags];
    if (community == null) {
      if (!isNull(selectedCommunity)) {
        tags.shift();
      }
    } else {
      if (!isNull(selectedCommunity)) {
        tags.shift();
      }

      tags.unshift(community.name);
    }

    this.setState({
      fields: { ...fields, tags },
      isCommunitiesListModalOpen: false,
      selectedCommunity: community,
      selectedAccount: community ? null : currentAccount,
    });
  };

  _getCommunity = (hive) => {
    getCommunity(hive)
      .then((community) => {
        this.setState({ selectedCommunity: community });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  _saveDraftToDB() {
    const { saveDraftToDB } = this.props;
    const { fields } = this.state;

    //save draft only if any of field is valid
    if (fields.body || fields.title) {
      saveDraftToDB(fields);
    }
  }

  render() {
    const {
      fields,
      isPreviewActive,
      wordsCount,
      isFormValid,
      isRemoveTag,
      isCommunitiesListModalOpen,
      selectedCommunity,
      selectedAccount,
    } = this.state;
    const {
      handleOnImagePicker,
      intl,
      isDraftSaved,
      isDraftSaving,
      isDraft,
      isEdit,
      isLoggedIn,
      isPostSending,
      isReply,
      isUploading,
      post,
      uploadedImage,
      handleOnBackPress,
      handleDatePickerChange,
      handleRewardChange,
      handleBeneficiaries,
      currentAccount,
      autoFocusText,
      sharedSnippetText,
      onLoadDraftPress,
      thumbIndex,
    } = this.props;
    const rightButtonText = intl.formatMessage({
      id: isEdit ? 'basic_header.update' : isReply ? 'basic_header.reply' : 'basic_header.publish',
    });

    const _renderCommunityModal = () => {
      return (
        <Modal
          isOpen={isCommunitiesListModalOpen}
          animationType="animationType"
          presentationStyle="pageSheet"
          style={styles.modal}
        >
          <SelectCommunityModalContainer
            onPressCommunity={this._handlePressCommunity}
            currentAccount={currentAccount}
            onCloseModal={() => {
              this.setState({ isCommunitiesListModalOpen: false });
            }}
          />
        </Modal>
      );
    };

    return (
      <View style={globalStyles.defaultContainer}>
        <BasicHeader
          handleDatePickerChange={(date) => handleDatePickerChange(date, fields)}
          handleRewardChange={handleRewardChange}
          handleBeneficiaries={handleBeneficiaries}
          handleOnBackPress={handleOnBackPress}
          handleOnPressPreviewButton={this._handleOnPressPreviewButton}
          handleOnSaveButtonPress={this._handleOnSaveButtonPress}
          handleOnSubmit={this._handleOnSubmit}
          isDraftSaved={isDraftSaved}
          isDraftSaving={isDraftSaving}
          isDraft={isDraft}
          isEdit={isEdit}
          isFormValid={isFormValid}
          isHasIcons
          isLoading={isPostSending || isUploading}
          isLoggedIn={isLoggedIn}
          isPreviewActive={isPreviewActive}
          isReply={isReply}
          quickTitle={wordsCount > 0 && `${wordsCount} words`}
          rightButtonText={rightButtonText}
          showThumbSelectionModal={this._showThumbSelectionModal}
        />
        <PostForm
          handleFormUpdate={this._handleFormUpdate}
          handleOnSubmit={this._handleOnSubmit}
          isFormValid={isFormValid}
          isPreviewActive={isPreviewActive}
        >
          {!isReply && !isEdit && (
            <SelectCommunityAreaView
              selectedAccount={selectedAccount}
              selectedCommunity={selectedCommunity}
              // because of the bug in react-native-modal
              // https://github.com/facebook/react-native/issues/26892
              onPressOut={() => this.setState({ isCommunitiesListModalOpen: true })}
              onPressIn={() => this.setState({ isCommunitiesListModalOpen: false })}
            />
          )}
          <MarkdownEditor
            componentID="body"
            draftBody={fields && fields.body}
            handleOnTextChange={this._setWordsCount}
            handleFormUpdate={this._handleFormUpdate}
            handleIsFormValid={this._handleIsFormValid}
            isFormValid={isFormValid}
            handleOpenImagePicker={handleOnImagePicker}
            intl={intl}
            uploadedImage={uploadedImage}
            initialFields={this._initialFields}
            isReply={isReply}
            isLoading={isPostSending}
            isUploading={isUploading}
            isEdit={isEdit}
            post={post}
            fields={fields}
            currentAccount={currentAccount}
            onTagChanged={this._handleOnTagAdded}
            onTitleChanged={this._handleChangeTitle}
            getCommunity={this._getCommunity}
            autoFocusText={autoFocusText}
            sharedSnippetText={sharedSnippetText}
            onLoadDraftPress={onLoadDraftPress}
          />
        </PostForm>
        {_renderCommunityModal()}
        <ThumbSelectionModal
          ref={(componentRef) => (this.thumbSelectionModalRef = componentRef)}
          thumbIndex={thumbIndex}
          onThumbSelection={this._handleOnThumbSelection}
        />
      </View>
    );
  }
}

export default injectIntl(EditorScreen);
