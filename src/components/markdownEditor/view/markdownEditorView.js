import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  FlatList,
  Text,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { renderPostBody } from '@ecency/render-helper';
import { useDispatch, useSelector } from 'react-redux';
import { View as AnimatedView } from 'react-native-animatable';
import { get } from 'lodash';
import { Icon } from '../../icon';

// Utils
import Formats from './formats/formats';
import applyImageLink from './formats/applyWebLinkFormat';

// Actions
import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

// Components
import {
  IconButton,
  PostBody,
  Separator,
  StickyBar,
  TextInput,
  UserAvatar,
  TitleArea,
  TagArea,
  TagInput,
  SummaryArea,
  Modal,
  SnippetsModal,
  UploadsGalleryModal,
} from '../../index';

import { ThemeContainer } from '../../../containers';

// Styles
import styles from './markdownEditorStyles';
import applySnippet from './formats/applySnippet';
import { MainButton } from '../../mainButton';
import isAndroidOreo from '../../../utils/isAndroidOreo';

const MIN_BODY_INPUT_HEIGHT = 300;

const MarkdownEditorView = ({
  draftBody,
  handleIsFormValid,
  handleOpenImagePicker,
  intl,
  isPreviewActive,
  isReply,
  isLoading,
  isUploading,
  initialFields,
  onChange,
  handleOnTextChange,
  handleIsValid,
  componentID,
  uploadedImage,
  isEdit,
  post,
  fields,
  onTagChanged,
  onTitleChanged,
  getCommunity,
  currentAccount,
  autoFocusText,
  sharedSnippetText,
  onLoadDraftPress,
}) => {
  const [text, setText] = useState(draftBody || '');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [editable, setEditable] = useState(true);
  const [bodyInputHeight, setBodyInputHeight] = useState(MIN_BODY_INPUT_HEIGHT);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [showDraftLoadButton, setShowDraftLoadButton] = useState(false);

  const inputRef = useRef(null);
  const galleryRef = useRef(null);
  const clearRef = useRef(null);
  const uploadsGalleryModalRef = useRef(null);

  const dispatch = useDispatch();
  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );

  useEffect(() => {
    if (!isPreviewActive) {
      _setTextAndSelection({ selection: { start: 0, end: 0 }, text });
    }
  }, [isPreviewActive]);

  useEffect(() => {
    if (onLoadDraftPress) {
      setShowDraftLoadButton(true);
    }
  }, [onLoadDraftPress]);

  useEffect(() => {
    if (text === '' && draftBody !== '') {
      _setTextAndSelection({ selection: { start: 0, end: 0 }, text: draftBody });
    }
  }, [draftBody]);

  useEffect(() => {
    //hide draft button if fields changes and button was visible
    if (showDraftLoadButton) {
      let isCreating =
        get(fields, 'title', '') !== '' ||
        get(fields, 'body', '') !== '' ||
        get(fields, 'tags', []) !== [];

      if (isCreating) {
        setShowDraftLoadButton(false);
      }
    }
  }, [fields]);

  useEffect(() => {
    if (sharedSnippetText) {
      _handleOnSnippetReceived(sharedSnippetText);
    }
  }, [sharedSnippetText]);

  useEffect(() => {
    if (editable === null) {
      // workaround for android context menu issue
      setEditable(false);
      setTimeout(() => {
        setEditable(!isLoading);
      }, 100);
    } else {
      setEditable(!isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    if (uploadedImage && uploadedImage.url) {
      if (uploadedImage.shouldInsert) {
        applyImageLink({
          text,
          selection,
          setTextAndSelection: _setTextAndSelection,
          item: { url: uploadedImage.url, text: uploadedImage.hash },
          isImage: !!uploadedImage,
        });
      } else {
        uploadsGalleryModalRef.current.showModal();
      }
    }
  }, [uploadedImage]);

  useEffect(() => {
    setText(draftBody);
  }, [draftBody]);

  useEffect(() => {
    if (autoFocusText && inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocusText]);

  useEffect(() => {
    const nextText = text.replace(text, '');

    if (nextText && nextText.length > 0) {
      _changeText(text);

      if (handleIsFormValid) {
        handleIsFormValid(text);
      }
    }
  }, [text]);

  const changeUser = async () => {
    dispatch(toggleAccountsBottomSheet(!isVisibleAccountsBottomSheet));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _changeText = useCallback((input) => {
    setText(input);

    if (onChange) {
      onChange(input);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(input && input.length));
    }

    if (handleOnTextChange) {
      handleOnTextChange(input);
    }
  });

  const _handleOnSelectionChange = async (event) => {
    setSelection(event.nativeEvent.selection);
  };

  const _handleOnContentSizeChange = async (event) => {
    const height = Math.max(MIN_BODY_INPUT_HEIGHT, event.nativeEvent.contentSize.height + 100);
    setBodyInputHeight(height);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _setTextAndSelection = useCallback(({ selection: _selection, text: _text }) => {
    inputRef.current.setNativeProps({
      text: _text,
    });

    // Workaround for iOS selection update issue
    const isIos = Platform.OS === 'ios';
    if (isIos) {
      setTimeout(() => {
        inputRef.current.setNativeProps({
          selection: _selection,
        });
        setSelection(_selection);
      }, 100);
    } else {
      inputRef.current.setNativeProps({
        selection: _selection,
      });
      setSelection(_selection);
    }
    setIsSnippetsOpen(false);
    _changeText(_text);
  });

  const _renderPreview = () => (
    <ScrollView style={styles.previewContainer}>
      {text ? (
        <PostBody body={renderPostBody(text, true, Platform.OS === 'ios' ? false : true)} />
      ) : (
        <Text>...</Text>
      )}
    </ScrollView>
  );

  const _handleOnSnippetReceived = (snippetText) => {
    applySnippet({
      text,
      selection,
      setTextAndSelection: _setTextAndSelection,
      snippetText,
    });
  };

  const _handleOnMediaSelect = (mediaInsert) => {
    if (mediaInsert && mediaInsert.url) {
      applyImageLink({
        text,
        selection,
        setTextAndSelection: _setTextAndSelection,
        item: { url: mediaInsert.url, text: mediaInsert.hash },
        isImage: !!mediaInsert,
      });
    }
  };

  const _renderMarkupButton = ({ item }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconStyle={styles.icon}
        iconType={item.iconType}
        name={item.icon}
        onPress={() =>
          item.onPress({ text, selection, setTextAndSelection: _setTextAndSelection, item })
        }
      />
    </View>
  );

  const _renderFloatingDraftButton = () => {
    if (showDraftLoadButton) {
      const _onPress = () => {
        setShowDraftLoadButton(false);
        onLoadDraftPress();
      };
      return (
        <AnimatedView style={styles.floatingContainer} animation="bounceInRight">
          <MainButton
            style={{ width: isLoading ? null : 120 }}
            onPress={_onPress}
            iconName="square-edit-outline"
            iconType="MaterialCommunityIcons"
            iconColor="white"
            text="DRAFT"
            isLoading={isLoading}
          />
        </AnimatedView>
      );
    }
  };

  const _renderEditorButtons = () => (
    <StickyBar>
      <View style={styles.leftButtonsWrapper}>
        <FlatList
          data={Formats}
          keyboardShouldPersistTaps="always"
          renderItem={({ item, index }) => index < 3 && _renderMarkupButton({ item })}
          horizontal
        />
      </View>
      <View style={styles.rightButtonsWrapper}>
        <IconButton
          size={20}
          style={styles.rightIcons}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="link"
          onPress={() =>
            Formats[3].onPress({ text, selection, setTextAndSelection: _setTextAndSelection })
          }
        />
        <IconButton
          onPress={() => setIsSnippetsOpen(true)}
          style={styles.rightIcons}
          size={20}
          iconStyle={styles.icon}
          iconType="MaterialCommunityIcons"
          name="text-short"
        />
        <IconButton
          onPress={() => {
            galleryRef.current.show();
          }}
          style={styles.rightIcons}
          size={20}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="image"
        />
        <View style={styles.clearButtonWrapper}>
          <IconButton
            onPress={() => clearRef.current.show()}
            size={20}
            iconStyle={styles.clearIcon}
            iconType="FontAwesome"
            name="trash"
            backgroundColor={styles.clearButtonWrapper.backgroundColor}
          />
        </View>
      </View>
    </StickyBar>
  );

  const _handleClear = (index) => {
    if (index === 0) {
      initialFields();
      setText('');
      _setTextAndSelection({ text: '', selection: { start: 0, end: 0 } });
    }
  };

  const _renderEditor = () => (
    <>
      {isReply && !isEdit && <SummaryArea summary={post.summary} />}
      {!isReply && (
        <TitleArea value={fields.title} onChange={onTitleChanged} componentID="title" intl={intl} />
      )}
      {!isReply && !isPreviewActive && (
        <TagInput
          value={fields.tags}
          componentID="tag-area"
          intl={intl}
          handleTagChanged={onTagChanged}
          setCommunity={getCommunity}
        />
      )}
      {!isReply && isPreviewActive && (
        <TagArea
          draftChips={fields.tags.length > 0 ? fields.tags : null}
          componentID="tag-area"
          intl={intl}
        />
      )}
      {isReply && (
        <View style={styles.replySection}>
          <TouchableOpacity style={styles.accountTile} onPress={() => changeUser()}>
            <View style={styles.avatarAndNameContainer}>
              <UserAvatar noAction username={currentAccount.username} />
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{`@${currentAccount.username}`}</Text>
              </View>
              <Icon
                size={24}
                iconStyle={styles.leftIcon}
                style={styles.iconArrow}
                name="arrow-drop-down"
                iconType="MaterialIcons"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
      {!isPreviewActive ? (
        <ThemeContainer>
          {({ isDarkTheme }) => (
            <TextInput
              multiline
              autoCorrect={true}
              autoFocus={isReply ? true : false}
              onChangeText={_changeText}
              onSelectionChange={_handleOnSelectionChange}
              placeholder={intl.formatMessage({
                id: isReply ? 'editor.reply_placeholder' : 'editor.default_placeholder',
              })}
              placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
              selectionColor="#357ce6"
              style={{ ...styles.textWrapper, height: bodyInputHeight }}
              underlineColorAndroid="transparent"
              innerRef={inputRef}
              editable={editable}
              contextMenuHidden={false}
              autoGrow={false}
              scrollEnabled={false}
              onContentSizeChange={_handleOnContentSizeChange}
            />
          )}
        </ThemeContainer>
      ) : (
        _renderPreview()
      )}
    </>
  );

  const _renderEditorWithScroll = () => (
    <ScrollView style={styles.container}>{_renderEditor()}</ScrollView>
  );

  const _renderEditorWithoutScroll = () => <View style={styles.container}>{_renderEditor()}</View>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 30 })}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {isAndroidOreo() ? _renderEditorWithoutScroll() : _renderEditorWithScroll()}

      {_renderFloatingDraftButton()}
      {!isPreviewActive && _renderEditorButtons()}

      <Modal
        isOpen={isSnippetsOpen}
        handleOnModalClose={() => setIsSnippetsOpen(false)}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        //handleOnModalClose={() => setBeneficiaryModal(false)}
        title={intl.formatMessage({ id: 'editor.snippets' })}
        animationType="slide"
        style={styles.modalStyle}
      >
        <SnippetsModal handleOnSelect={_handleOnSnippetReceived} />
      </Modal>

      <UploadsGalleryModal
        ref={uploadsGalleryModalRef}
        username={currentAccount.username}
        handleOnSelect={_handleOnMediaSelect}
        uploadedImage={uploadedImage}
      />

      <ActionSheet
        ref={galleryRef}
        options={[
          intl.formatMessage({
            id: 'editor.open_gallery',
          }),
          intl.formatMessage({
            id: 'editor.capture_photo',
          }),
          intl.formatMessage({
            id: 'editor.uploaded_images',
          }),

          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={3}
        onPress={(index) => {
          if (index == 2) {
            uploadsGalleryModalRef.current.showModal();
          } else {
            handleOpenImagePicker(index === 0 ? 'image' : index === 1 && 'camera');
          }
        }}
      />
      <ActionSheet
        ref={clearRef}
        title={intl.formatMessage({
          id: 'alert.clear_alert',
        })}
        options={[
          intl.formatMessage({
            id: 'alert.clear',
          }),
          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={1}
        onPress={_handleClear}
      />
    </KeyboardAvoidingView>
  );
};

export default MarkdownEditorView;
