import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  buttonWrapper: {
    minWidth: '$deviceWidth / 2.4',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  boostLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
  },
  buttonText: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    width: 100,
  },
  buttonIconWrapper: {
    backgroundColor: '$pureWhite',
    borderRadius: 20,
    width: 24,
    height: 24,
  },
  priceWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '$deviceWidth / 4',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '$primaryBlue',
  },
  descriptionWrapper: {
    backgroundColor: '$companyRed',
    width: 90,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  description: {
    fontSize: 10,
    color: '$pureWhite',
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '$primaryBackgroundColor',
    borderRadius: 5,
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    right: -12,
  },
});
