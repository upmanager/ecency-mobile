import React, { Fragment, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Slider from '@esteemapp/react-native-slider';

// Utils
import { getEstimatedAmount } from '../../../utils/vote';

// Components
import { Icon } from '../../icon';
import { PulseAnimation } from '../../animations';
import { TextButton } from '../../buttons';
import { FormattedCurrency } from '../../formatedElements';
// Services
import { setRcOffer } from '../../../redux/actions/uiAction';

// STEEM
import { vote } from '../../../providers/hive/dhive';

// Styles
import styles from './upvoteStyles';
import { useAppSelector } from '../../../hooks';

interface UpvoteViewProps {
  isDecinedPayout:boolean;
  isShowPayoutValue:boolean;
  totalPayout:number;
  maxPayout:number;
  payoutDeclined:boolean;
  pendingPayout:number;
  promotedPayout:number;
  authorPayout:number;
  curationPayout:number;
  payoutDate:string;
  isDownVoted:boolean;
  beneficiaries:string[];
  warnZeroPayout:boolean;
  breakdownPayout:string;
  globalProps:any;
  author:string;
  handleSetUpvotePercent:(value:number)=>void;
  permlink:string;
  dispatch:any
  onVote:(amount:string, downvote:boolean)=>void;
  isVoted:boolean;
  upvotePercent:number;
}

const UpvoteView = ({
  isDecinedPayout,
  isShowPayoutValue,
  totalPayout,
  maxPayout,
  payoutDeclined,
  pendingPayout,
  promotedPayout,
  authorPayout,
  curationPayout,
  payoutDate,
  isDownVoted,
  beneficiaries,
  warnZeroPayout,
  breakdownPayout,
  globalProps,
  author,
  handleSetUpvotePercent,
  permlink,
  dispatch,
  onVote,
  isVoted,
  upvotePercent
}:UpvoteViewProps) => {
  const intl = useIntl();

  const isLoggedIn = useAppSelector(state => state.application.isLoggedIn);
  const currentAccount = useAppSelector(state => state.account.currentAccount);
  const pinCode = useAppSelector(state => state.application.pin);


  const [sliderValue, setSliderValue] = useState(1);
  const [amount, setAmount] = useState('0.00000');
  const [isVoting, setIsVoting] = useState(false);
  const [upvote, setUpvote] = useState(isVoted || false);
  const [downvote, setDownvote] = useState(isDownVoted || false);
  const [isShowDetails, setIsShowDetails] = useState(false);

  useEffect(() => {
    _calculateEstimatedAmount();
  }, [])

  
  useEffect(() => {
    const value = (isVoted || isDownVoted) 
    ? 1 
    : upvotePercent <= 1
      ? upvotePercent 
      : 1;

    setSliderValue(value);
    _calculateEstimatedAmount(value);
  }, [upvotePercent])


  useEffect(() => {
    if(isVoted !== null && isVoted !== upvote){
      setUpvote(isVoted || false);
    }
  }, [isVoted])


  // Component Functions
  const _calculateEstimatedAmount = async (value:number = sliderValue) => {
    if (currentAccount && Object.entries(currentAccount).length !== 0) {
      setAmount(getEstimatedAmount(currentAccount, globalProps, value))
    }
  };


  const _upvoteContent = (closePopover) => {
    if (!downvote) {
      closePopover();
      setIsVoting(true);
      handleSetUpvotePercent(sliderValue);

      const weight = sliderValue ? Math.trunc(sliderValue * 100) * 100 : 0;

      console.log('casting up vote: ' + weight);
      vote(currentAccount, pinCode, author, permlink, weight)
        .then(() => {
          setUpvote(!!sliderValue);
          setIsVoting(false);
          onVote(amount, false);
        })
        .catch((err) => {
          if (
            err &&
            err.response &&
            err.response.jse_shortmsg &&
            err.response.jse_shortmsg.includes('wait to transact')
          ) {
            //when RC is not enough, offer boosting account
            setUpvote(false);
            setIsVoting(false);
            dispatch(setRcOffer(true));
          } else if (err && err.jse_shortmsg && err.jse_shortmsg.includes('wait to transact')) {
            //when RC is not enough, offer boosting account
            setUpvote(false);
            setIsVoting(false);
            dispatch(setRcOffer(true));
          } else {
            //when voting with same percent or other errors
            if (err.message && err.message.indexOf(':') > 0) {
              Alert.alert(
                intl.formatMessage({
                  id: 'alert.fail',
                }),
                err.message.split(': ')[1],
              );
            } else {
              Alert.alert(
                intl.formatMessage({
                  id: 'alert.fail',
                }),
                err.jse_shortmsg || err.error_description,
              );
            }
            setIsVoting(false);
          }
        });
    } else {
      setSliderValue(1);
      setDownvote(false);
    }
  };



  const _downvoteContent = (closePopover) => {
    if (downvote) {
      closePopover();
      setIsVoting(true);
      handleSetUpvotePercent(sliderValue);
      

      const weight = sliderValue ? Math.trunc(sliderValue * 100) * -100 : 0;

      console.log('casting down vote: ' + weight);
      vote(currentAccount, pinCode, author, permlink, weight)
        .then(() => {
          setUpvote(!!sliderValue);
          setIsVoting(false);
          onVote(amount, true);
        })
        .catch((err) => {
          Alert.alert('Failed!', err.message);
          setUpvote(false);
          setIsVoting(false);
        });
    } else {
      setSliderValue(1);
      setDownvote(true);
    }
  };



  const _handleOnPopoverClose = () => {
    setTimeout(() => {
      setIsShowDetails(false);
    }, 300);
  };

  

  let iconName = 'upcircleo';
  const iconType = 'AntDesign';
  let downVoteIconName = 'downcircleo';

  if (upvote) {
    iconName = 'upcircle';
  }

  if (isDownVoted) {
    downVoteIconName = 'downcircle';
  }

  const _percent = `${downvote ? '-' : ''}${(sliderValue * 100).toFixed(0)}%`;
  const _amount = `$${amount}`;
  
  const payoutLimitHit = totalPayout >= maxPayout;
  const _shownPayout = payoutLimitHit && maxPayout > 0 ? maxPayout : totalPayout;

  const sliderColor = downvote ? '#ec8b88' : '#357ce6';

  const _payoutPopupItem = (label, value) => {
    return (
      <View style={styles.popoverItemContent}>
        <Text style={styles.detailsLabel}>{label}</Text>
        <Text style={styles.detailsText}>{value}</Text>
      </View>
    );
  };

  return (
    <PopoverController>
        {({ openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect }) => (
          <Fragment>
            <TouchableOpacity
              ref={setPopoverAnchor}
              onPress={openPopover}
              style={styles.upvoteButton}
              disabled={!isLoggedIn}
            >
              <Fragment>
                {isVoting ? (
                  <View style={{ width: 19 }}>
                    <PulseAnimation
                      color="#357ce6"
                      numPulses={1}
                      diameter={20}
                      speed={100}
                      duration={1500}
                      isShow={!isVoting}
                    />
                  </View>
                ) : (
                  <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }}>
                    <Icon
                      style={[styles.upvoteIcon, isDownVoted && { color: '#ec8b88' }]}
                      active={!isLoggedIn}
                      iconType={iconType}
                      name={isDownVoted ? downVoteIconName : iconName}
                    />
                  </View>
                )}
              </Fragment>
            </TouchableOpacity>
            <View style={styles.payoutTextButton}>
              {isShowPayoutValue && (
                <TextButton
                  style={styles.payoutTextButton}
                  textStyle={[styles.payoutValue, isDecinedPayout && styles.declinedPayout]}
                  text={<FormattedCurrency value={_shownPayout || '0.000'} />}
                  onPress={() => {
                    openPopover();
                    setIsShowDetails(true);
                  }}
                />
              )}
            </View>

            <Popover
              contentStyle={isShowDetails ? styles.popoverDetails : styles.popoverSlider}
              arrowStyle={isShowDetails ? styles.arrow : styles.hideArrow}
              backgroundStyle={styles.overlay}
              visible={popoverVisible}
              onClose={() => {
                closePopover();
                _handleOnPopoverClose();
              }}
              fromRect={popoverAnchorRect}
              placement="top"
              supportedOrientations={['portrait', 'landscape']}
            >
              <View style={styles.popoverWrapper}>
                {isShowDetails ? (
                  <View style={styles.popoverContent}>
                    {promotedPayout > 0 &&
                      _payoutPopupItem(
                        intl.formatMessage({ id: 'payout.promoted' }),
                        `${'~'}$${promotedPayout}`,
                      )}

                    {pendingPayout > 0 &&
                      _payoutPopupItem(
                        intl.formatMessage({ id: 'payout.potential_payout' }),
                        `${'~'}$${pendingPayout}`,
                      )}

                    {authorPayout > 0 &&
                      _payoutPopupItem(
                        intl.formatMessage({ id: 'payout.author_payout' }),
                        `${'~'}$${authorPayout}`,
                      )}

                    {curationPayout > 0 &&
                      _payoutPopupItem(
                        intl.formatMessage({ id: 'payout.curation_payout' }),
                        `${'~'}$${curationPayout}`,
                      )}

                    {!!breakdownPayout &&
                      pendingPayout > 0 &&
                      _payoutPopupItem(
                        intl.formatMessage({ id: 'payout.breakdown' }),
                        breakdownPayout,
                      )}

                    {beneficiaries.length > 0 &&
                      _payoutPopupItem(
                        intl.formatMessage({ id: 'payout.beneficiaries' }),
                        beneficiaries,
                      )}

                    {!!payoutDate &&
                      _payoutPopupItem(
                        intl.formatMessage({ id: 'payout.payout_date' }),
                        payoutDate,
                      )}

                    {warnZeroPayout &&
                      _payoutPopupItem(intl.formatMessage({ id: 'payout.warn_zero_payout' }), '')}
                  </View>
                ) : (
                  <Fragment>
                    <TouchableOpacity
                      onPress={() => {
                        _upvoteContent(closePopover);
                      }}
                      style={styles.upvoteButton}
                    >
                      <Icon
                        size={20}
                        style={[styles.upvoteIcon, { color: '#007ee5' }]}
                        active={!isLoggedIn}
                        iconType="AntDesign"
                        name={iconName}
                      />
                    </TouchableOpacity>
                    <Text style={styles.amount}>{_amount}</Text>
                    <Slider
                      style={styles.slider}
                      minimumTrackTintColor={sliderColor}
                      trackStyle={styles.track}
                      thumbStyle={styles.thumb}
                      thumbTintColor="#007ee5"
                      value={sliderValue}
                      onValueChange={(value) => {
                        setSliderValue(value);
                        _calculateEstimatedAmount(value);
                      }}
                    />
                    <Text style={styles.percent}>{_percent}</Text>
                    <TouchableOpacity
                      onPress={() => _downvoteContent(closePopover)}
                      style={styles.upvoteButton}
                    >
                      <Icon
                        size={20}
                        style={[styles.upvoteIcon, { color: '#ec8b88' }]}
                        active={!isLoggedIn}
                        iconType="AntDesign"
                        name={downVoteIconName}
                      />
                    </TouchableOpacity>
                  </Fragment>
                )}
              </View>
            </Popover>
          </Fragment>
        )}
      </PopoverController>
  )
}



export default UpvoteView;
