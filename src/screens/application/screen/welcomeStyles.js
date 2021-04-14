import { Dimensions, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import scalePx from '../../../utils/scalePx';

const WINDOW_HEIGHT = Dimensions.get('window').height;

export default EStyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.select({
      ios: 30,
      android: 50,
    }),
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  welcomeText: {
    fontSize: scalePx(34),
    color: '$primaryBlack',
  },
  ecencyText: {
    fontSize: scalePx(34),
    color: '$primaryBlue',
  },
  mascot: {
    position: 'absolute',
    width: '45%',
    height: 227,
    marginTop: Platform.select({
      ios: 20,
      android: WINDOW_HEIGHT * 0.07,
    }),
    right: 8,
    opacity: 0.7,
    shadowColor: '$primaryBlack',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    overflow: 'visible',
  },
  topText: {
    marginTop: 40,
  },
  sectionRow: {
    flexDirection: 'row',
    marginTop: 52,
  },
  sectionTitle: {
    fontSize: scalePx(17),
    fontWeight: '600',
    marginLeft: 10,
    color: '$primaryBlack',
  },
  sectionText: {
    fontSize: scalePx(15),
    marginLeft: 10,
    marginRight: 45,
    color: '$primaryBlack',
  },
  flex1: {
    flex: 1,
  },
});
