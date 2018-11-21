import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  post: {
    shadowColor: '$white',
    padding: 0,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 0,
    borderRadius: 5,
    backgroundColor: '$primaryBackgroundColor',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: 'lightgray',
    borderWidth: 1,
  },
  author: {
    backgroundColor: '$white',
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  timeAgo: {
    alignSelf: 'center',
    fontSize: 9,
    fontWeight: '100',
    marginHorizontal: 3,
  },
  authorName: {
    color: '#222',
    fontWeight: '600',
    fontSize: 10,
  },
  upvoteButton: {
    margin: 0,
    flexDirection: 'row',
    paddingVertical: 0,
  },
  upvoteIcon: {
    alignSelf: 'flex-start',
    fontSize: 20,
    color: '#007ee5',
    margin: 0,
    width: 18,
  },
  payout: {
    alignSelf: 'center',
    fontSize: 10,
    color: '#626262',
    marginLeft: 3,
  },
  payoutIcon: {
    fontSize: 15,
    marginHorizontal: 3,
    color: '#a0a0a0',
    alignSelf: 'center',
  },
  payoutButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  commentButton: {
    padding: 0,
    margin: 0,
    flexDirection: 'row',
  },
  comment: {
    alignSelf: 'center',
    fontSize: 10,
    color: '#626262',
    marginLeft: 3,
  },
  commentIcon: {
    alignSelf: 'flex-start',
    fontSize: 20,
    color: '#007ee5',
    margin: 0,
    width: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    marginVertical: 5,
  },
  summary: {
    fontSize: 10,
    fontWeight: '200',
    overflow: 'hidden',
  },
  header: {
    shadowColor: '$white',
    height: 50,
    borderRadius: 5,
    backgroundColor: '$primaryBackgroundColor',
  },
  body: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
  },
  image: {
    margin: 0,
    alignItems: 'center',
    alignSelf: 'center',
    height: 200,
    width: '$deviceWidth - 16',
    borderRadius: 8,
  },
  badge: {
    alignSelf: 'center',
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 10,
    width: 15,
    height: 15,
    padding: 2,
    backgroundColor: 'lightgray',
    marginHorizontal: 5,
  },
  category: {
    alignSelf: 'center',
    borderRadius: 10,
    height: 15,
    backgroundColor: '#007EE5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  categoryText: {
    fontSize: 9,
    color: '$white',
    fontWeight: '600',
  },
  text: {
    fontSize: 7,
    alignSelf: 'center',
    textAlignVertical: 'center',
    color: '$white',
    fontWeight: 'bold',
  },
  topLikers: {
    shadowColor: '$white',
    backgroundColor: '#f8f8f8',
    borderWidth: 0,
    padding: 0,
    borderRadius: 5,
  },
  likers_1: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: 'lightgray',
    marginVertical: -5,
  },
  likers_2: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: 'lightgray',
    marginVertical: -5,
    marginLeft: -3,
  },
  likers_3: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: 'lightgray',
    marginVertical: -5,
    marginLeft: -3,
  },
  footer: {
    shadowColor: '$white',
    paddingLeft: 5,
    borderRadius: 5,
    fontSize: 10,
    fontWeight: '100',
    fontFamily: '$primaryFont',
    color: '#777777',
  },
  popover: {
    width: '$deviceWidth - 20',
    borderRadius: 5,
    padding: 10,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: '$primaryBackgroundColor',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
  },
});
