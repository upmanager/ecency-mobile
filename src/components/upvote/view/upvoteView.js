import React, { Component, Fragment } from 'react';
import {
  View, TouchableOpacity, ActivityIndicator, Text, Alert,
} from 'react-native';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Slider from 'react-native-slider';
// Constants

// Components
import { Icon } from '../../icon';
import { PulseAnimation } from '../../animations';
// STEEM
import { upvoteAmount, vote } from '../../../providers/steem/dsteem';

// Styles
import styles from './upvoteStyles';

class UpvoteView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      sliderValue: props.upvotePercent || 1,
      isVoting: false,
      isVoted: props.isVoted,
      amount: '0.00000',
    };
  }

  // Component Life Cycles
  componentDidMount() {
    this._calculateEstimatedAmount();
  }

  componentWillReceiveProps(nextProps) {
    const { isVoted, upvotePercent } = this.props;
    const { isVoted: localIsVoted } = this.state;

    if (isVoted !== nextProps.isVoted && localIsVoted !== nextProps.isVoted) {
      this.setState({ isVoted: nextProps.isVoted });
    }

    if (upvotePercent !== nextProps.upvotePercent) {
      this.setState({ sliderValue: nextProps.upvotePercent });
    }
  }

  // Component Functions
  _calculateEstimatedAmount = async () => {
    const { currentAccount } = this.props;
    // Calculate total vesting shares
    if (currentAccount) {
      const { sliderValue } = this.state;
      const totalVests = parseFloat(currentAccount.vesting_shares)
        + parseFloat(currentAccount.received_vesting_shares)
        - parseFloat(currentAccount.delegated_vesting_shares);

      const finalVest = totalVests * 1e6;

      const power = (currentAccount.voting_power * (sliderValue * 10000)) / 10000 / 50;

      const rshares = (power * finalVest) / 10000;

      const estimated = await upvoteAmount(rshares);

      this.setState({
        amount: estimated.toFixed(5),
      });
    }
  };

  _upvoteContent = async () => {
    const {
      author, currentAccount, fetchPost, handleSetUpvotePercent, permlink, pinCode,
    } = this.props;
    const { sliderValue } = this.state;

    this.setState(
      {
        isVoting: true,
      },
      () => {
        handleSetUpvotePercent(sliderValue);
      },
    );

    const weight = sliderValue ? (sliderValue * 100).toFixed(0) * 100 : 0;

    vote(
      currentAccount,
      pinCode,
      author,
      permlink,
      weight,
    )
      .then(() => {
        this.setState(
          {
            isVoted: !!sliderValue,
            isVoting: false,
          },
          () => {
            if (fetchPost) {
              fetchPost();
            }
          },
        );
      })
      .catch((err) => {
        Alert.alert('Failed!', err.message);
        this.setState({
          isVoted: false,
          isVoting: false,
        });
      });
  };

  render() {
    const { isDecinedPayout, isLoggedIn, isShowPayoutValue, totalPayout } = this.props;
    const {
      isVoting, amount, sliderValue, isVoted,
    } = this.state;
    let iconName = 'ios-arrow-dropup';
    let iconType;

    if (isVoted) {
      iconName = 'upcircle';
      iconType = 'AntDesign';
    }

    const _percent = `${(sliderValue * 100).toFixed(0)}%`;
    const _amount = `$${amount}`;
    const _totalPayout = totalPayout ? totalPayout : '0.000';

    return (
      <PopoverController>
        {({
          openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect,
        }) => (
          <Fragment>
            <TouchableOpacity
              start
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
                  <Icon
                    style={[styles.upvoteIcon]}
                    active={!isLoggedIn}
                    iconType={iconType}
                    name={iconName}
                  />
                )}
                {isShowPayoutValue && (
                <Text style={[styles.payoutValue, isDecinedPayout && styles.declinedPayout]}>{`$${_totalPayout}`}</Text>
                )}
              </Fragment>
            </TouchableOpacity>

            <Popover
              contentStyle={styles.popover}
              arrowStyle={styles.arrow}
              backgroundStyle={styles.overlay}
              visible={popoverVisible}
              onClose={closePopover}
              fromRect={popoverAnchorRect}
              placement="top"
              supportedOrientations={['portrait', 'landscape']}
            >
              <View style={styles.popoverWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    closePopover();
                    this._upvoteContent();
                  }}
                  style={styles.upvoteButton}
                >
                  {isVoting ? (
                    <ActivityIndicator />
                  ) : (
                    <Icon
                      size={20}
                      style={[styles.upvoteIcon, { color: '#007ee5' }]}
                      active={!isLoggedIn}
                      iconType={iconType}
                      name={iconName}
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.amount}>{_amount}</Text>
                <Slider
                  style={styles.slider}
                  minimumTrackTintColor="#357ce6"
                  trackStyle={styles.track}
                  thumbStyle={styles.thumb}
                  thumbTintColor="#007ee5"
                  value={sliderValue}
                  onValueChange={(value) => {
                    this.setState({ sliderValue: value }, () => {
                      this._calculateEstimatedAmount();
                    });
                  }}
                />
                <Text style={styles.percent}>{_percent}</Text>
              </View>
            </Popover>
          </Fragment>
        )}
      </PopoverController>
    );
  }
}

export default UpvoteView;
