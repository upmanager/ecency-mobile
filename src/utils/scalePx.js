import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// based on iphone X's scale
const scale = SCREEN_WIDTH / 414;

export default (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};
