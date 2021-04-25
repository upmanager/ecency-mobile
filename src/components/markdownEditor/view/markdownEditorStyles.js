import EStyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '$primaryBackgroundColor',
  },
  textWrapper: {
    fontSize: 12,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 0, // On android side, textinput has default padding
    paddingHorizontal: 16,
    color: '$primaryBlack',
    backgroundColor: '$primaryBackgroundColor',
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  inlinePadding: {
    padding: 8,
  },
  leftButtonsWrapper: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '$deviceWidth / 3',
  },
  rightButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editorButton: {
    color: '$primaryDarkGray',
    marginRight: 15,
    height: 24,
  },
  dropdownStyle: {
    marginRight: 8,
  },
  rightIcons: {
    marginRight: 20,
  },
  dropdownIconStyle: {
    color: '$primaryDarkGray',
  },
  icon: {
    color: '$editorButtonColor',
  },
  iconArrow: {
    marginLeft: 4,
    color: '$iconColor',
  },
  clearButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    width: 56,
    backgroundColor: '$primaryBlue',
  },
  clearIcon: {
    color: '$primaryLightGray',
  },
  replySection: {
    paddingTop: 10,
    paddingBottom: 0,
  },
  accountTile: {
    height: 60,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 2,
  },
  name: {
    marginLeft: 4,
    color: '$primaryDarkGray',
  },
  modalStyle: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 16,
  },
  floatingContainer: Platform.select({
    //absolute positioning makes button hide behind keyboard on ios
    ios: {
      alignItems: 'flex-end',
      margin: 16,
      marginBottom: 24,
    },
    //on android the appearing of button was causing momentary glitch with ios variant style
    android: {
      position: 'absolute',
      right: 16,
      bottom: 56,
    },
  }),
});
