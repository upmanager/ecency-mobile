import parseToken from './parseToken';
import { GlobalProps } from '../redux/reducers/accountReducer';
import { votingPower } from '../providers/hive/dhive';

export const getEstimatedAmount = (account, globalProps:GlobalProps, sliderValue:number = 1) => {

  const { fundRecentClaims, fundRewardBalance, base, quote } = globalProps;
  const _votingPower:number = Number((100 * votingPower(account)).toFixed(0));
  /*
  const vestingShares = parseToken(account.vesting_shares);
  const receievedVestingShares = parseToken(account.received_vesting_shares);
  const delegatedVestingShared = parseToken(account.delegated_vesting_shares);
  const totalVests = vestingShares + receievedVestingShares - delegatedVestingShared;
  */
  const vestingShares = parseToken(account.post_voting_power);
  const totalVests = vestingShares;
  const weight = sliderValue * 10000;
  const hbdMedian = base / quote;
  console.log(_votingPower);
  const voteEffectiveShares = calculateVoteRshares(totalVests, _votingPower, weight)
  const voteValue = (voteEffectiveShares / fundRecentClaims) * fundRewardBalance * hbdMedian;
  const estimatedAmount = weight < 0 ? Math.min(voteValue * -1, 0) : Math.max(voteValue, 0)

  return Number.isNaN(estimatedAmount) ? '0.00000' : estimatedAmount.toFixed(5);

};


/*
 * Changes in HF25
 * Full 'rshares' always added to the post.
 * Curation rewards use 'weight' for posts/comments:
 *   0-24 hours -> weight = rshares_voted
 *   24 hours; 24+48=72 hours -> weight = rshares_voted /2
 *   72 hours; 3 days ->    rshares_voted / 8
 */
export const calculateVoteRshares = (userEffectiveVests:number, vp = 10000, weight = 10000) => {
  const userVestingShares = userEffectiveVests * 1e6;
  const userVotingPower = vp * (Math.abs(weight) / 10000)
  const voteRshares = userVestingShares * (userVotingPower / 10000) * 0.02
  return voteRshares
}

