import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'row',
    height: '$deviceHeight - 110',
  },
  userDescription: {
    flexDirection: 'column',
    flexGrow: 1,
    marginLeft: 8,
  },
  voteItemWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
  },
  voteItemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  name: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    maxWidth: '$deviceWidth - 100',
    fontFamily: '$primaryFont',
  },
  reputation: {
    fontWeight: 'normal',
    fontFamily: '$primaryFont',
  },
  value: {
    color: '$primaryBlue',
    fontSize: 14,
    fontFamily: '$primaryFont',
    fontWeight: 'bold',
  },
  valueGray: {
    color: '$iconColor',
  },
  valueBlack: {
    color: '$primaryBlack',
  },
  rightWrapper: {
    textAlign: 'center',
    alignItems: 'center',
    width: 80,
    height: 30,
    justifyContent: 'center',
  },
  text: {
    color: '$iconColor',
    fontSize: 12,
    fontFamily: '$primaryFont',
  },
  avatar: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 32 / 2,
  },
  date: {
    color: '$primaryDarkGray',
  },
  itemIndex: {
    color: '$primaryDarkGray',
    fontSize: 10,
    marginRight: 17,
  },
  middleWrapper: {
    marginRight: 30,
  },
  summary: {
    color: '$primaryDarkGray',
  },
  popoverDetails: {
    flexDirection: 'row',
    height: 'auto',
    borderRadius: 20,
    paddingHorizontal: 26,
    width: 200,
    backgroundColor: '$primaryBackgroundColor',
  },
  arrow: {
    borderTopColor: '$primaryBackgroundColor',
    marginLeft: 0,
  },
  popoverWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
