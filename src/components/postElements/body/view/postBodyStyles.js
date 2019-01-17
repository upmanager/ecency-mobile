import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  text: {
    fontSize: 12,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
  },
  container: {
    paddingHorizontal: 0,
    marginTop: 10,
  },
  a: {
    color: '$primaryBlue',
    fontFamily: '$primaryFont',
  },
  img: {
    left: -16,
    // height: 50,
    marginTop: 10,
  },
  code: {
    fontFamily: '$editorFont',
  },
  commentContainer: {
    paddingHorizontal: 0,
    marginTop: 10,
  },
  th: {
    flex: 1,
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '$primaryBlack',
    fontSize: 14,
    padding: 5,
  },
  tr: {
    backgroundColor: '$darkIconColor',
    flexDirection: 'row',
  },
  td: {
    borderWidth: 0.5,
    borderColor: '$tableBorderColor',
    flex: 1,
    padding: 10,
    backgroundColor: '$tableTrColor',
  },
});
