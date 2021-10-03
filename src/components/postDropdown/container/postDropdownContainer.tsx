import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Share, Alert } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services and Actions
import { reblog } from '../../../providers/hive/dhive';
import { addBookmark, addReport } from '../../../providers/ecency/ecency';
import { toastNotification, setRcOffer, showActionModal } from '../../../redux/actions/uiAction';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';

// Constants
import OPTIONS from '../../../constants/options/post';
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import { writeToClipboard } from '../../../utils/clipboard';
import { getPostUrl } from '../../../utils/post';

// Component
import PostDropdownView from '../view/postDropdownView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostDropdownContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions
  componentWillUnmount = () => {
    if (this.alertTimer) {
      clearTimeout(this.alertTimer);
      this.alertTimer = 0;
    }

    if (this.shareTimer) {
      clearTimeout(this.shareTimer);
      this.shareTimer = 0;
    }

    if (this.actionSheetTimer) {
      clearTimeout(this.actionSheetTimer);
      this.actionSheetTimer = 0;
    }
  };

  // Component Functions
  _handleOnDropdownSelect = async (index) => {
    const { content, dispatch, intl } = this.props;

    switch (OPTIONS[index]) {
      case 'copy':
        await writeToClipboard(getPostUrl(get(content, 'url')));
        this.alertTimer = setTimeout(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
          this.alertTimer = 0;
        }, 300);
        break;

      case 'reblog':
        this.actionSheetTimer = setTimeout(() => {
          this.ActionSheet.show();
          this.actionSheetTimer = 0;
        }, 100);
        break;

      case 'reply':
        this._redirectToReply();
        break;

      case 'share':
        this.shareTimer = setTimeout(() => {
          this._share();
          this.shareTimer = 0;
        }, 500);
        break;

      case 'bookmarks':
        this._addToBookmarks();
        break;

      case 'promote':
        this._redirectToPromote(ROUTES.SCREENS.REDEEM, 1, 'promote');
        break;

      case 'boost':
        this._redirectToPromote(ROUTES.SCREENS.REDEEM, 2, 'boost');
        break;

      case 'report':
        this._report(get(content, 'url'));
        break;

      default:
        break;
    }
  };

  _share = () => {
    const { content } = this.props;
    const postUrl = getPostUrl(get(content, 'url'));

    Share.share({
      message: `${get(content, 'title')} ${postUrl}`,
    });
  };

  _report = (url) => {
    const { dispatch, intl } = this.props;

    const _onConfirm = () => {
      addReport('content', url)
      .then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'report.added',
            }),
          ),
        );
      })
      .catch(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'report.added',
            }),
          ),
        );
      });
    }

    dispatch(showActionModal(
      intl.formatMessage({id:'report.confirm_report_title'}),
      intl.formatMessage({id:'report.confirm_report_body'}),
      [{
        text:intl.formatMessage({id:'alert.cancel'}),
        onPress:()=>{}
      },{
        text:intl.formatMessage({id:'alert.confirm'}),
        onPress:_onConfirm
      }]
    ))
   
  };

  _addToBookmarks = () => {
    const { content, dispatch, intl } = this.props;

    addBookmark(get(content, 'author'), get(content, 'permlink'))
      .then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'bookmarks.added',
            }),
          ),
        );
      })
      .catch(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
      });
  };

  _reblog = () => {
    const { content, currentAccount, dispatch, intl, isLoggedIn, pinCode } = this.props;
    if (isLoggedIn) {
      reblog(currentAccount, pinCode, content.author, get(content, 'permlink', ''))
        .then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.success_rebloged',
              }),
            ),
          );
        })
        .catch((error) => {
          if (String(get(error, 'jse_shortmsg', '')).indexOf('has already reblogged') > -1) {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.already_rebloged',
                }),
              ),
            );
          } else {
            if (error && error.jse_shortmsg.split(': ')[1].includes('wait to transact')) {
              //when RC is not enough, offer boosting account
              dispatch(setRcOffer(true));
            } else {
              //when other errors
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
            }
          }
        });
    }
  };

  _redirectToReply = () => {
    const { content, fetchPost, isLoggedIn, navigation } = this.props;

    if (isLoggedIn) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        params: {
          isReply: true,
          post: content,
          fetchPost,
        },
      });
    }
  };

  _redirectToPromote = (routeName, from, redeemType) => {
    const { content, isLoggedIn, navigation, dispatch, isPinCodeOpen } = this.props;
    const params = {
      from,
      permlink: `${get(content, 'author')}/${get(content, 'permlink')}`,
      redeemType,
    };

    if (isPinCodeOpen) {
      dispatch(
        openPinCodeModal({
          navigateTo: routeName,
          navigateParams: params,
        }),
      );
    } else if (isLoggedIn) {
      navigation.navigate({
        routeName,
        params,
      });
    }
  };

  render() {
    const {
      intl,
      currentAccount: { name },
      content,
    } = this.props;
    let _OPTIONS = OPTIONS;

    /*if ((content && content.author === name) || get(content, 'reblogged_by[0]', null) === name) {
      _OPTIONS = OPTIONS.filter(item => item !== 'reblog');
    }*/

    return (
      <Fragment>
        <PostDropdownView
          options={_OPTIONS.map((item) =>
            intl.formatMessage({ id: `post_dropdown.${item}` }).toUpperCase(),
          )}
          handleOnDropdownSelect={this._handleOnDropdownSelect}
          {...this.props}
        />
        <ActionSheet
          ref={(o) => (this.ActionSheet = o)}
          options={['Reblog', intl.formatMessage({ id: 'alert.cancel' })]}
          title={intl.formatMessage({ id: 'post.reblog_alert' })}
          cancelButtonIndex={1}
          onPress={(index) => {
            index === 0 ? this._reblog() : null;
          }}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(PostDropdownContainer)));
