import get from 'lodash/get';
import parseDate from './parseDate';
import parseToken from './parseToken';
import { vestsToSp } from './conversions';
import { getState, getFeedHistory } from '../providers/steem/dsteem';
import { getCurrencyTokenRate } from '../providers/esteem/esteem';

export const groomingTransactionData = (transaction, steemPerMVests) => {
  if (!transaction || !steemPerMVests) {
    return [];
  }

  const result = { iconType: 'MaterialIcons' };

  [result.textKey] = transaction[1].op;
  const opData = transaction[1].op[1];
  const { timestamp } = transaction[1];

  result.created = timestamp;
  result.icon = 'local-activity';

  //TODO: Format other wallet related operations

  switch (result.textKey) {
    case 'curation_reward':
      const { reward } = opData;
      const { comment_author: commentAuthor, comment_permlink: commentPermlink } = opData;

      result.value = `${vestsToSp(parseToken(reward), steemPerMVests)
        .toFixed(3)
        .replace(',', '.')} SP`;
      result.details = commentAuthor ? `@${commentAuthor}/${commentPermlink}` : null;
      break;
    case 'author_reward':
    case 'comment_benefactor_reward':
      let {
        sbd_payout: sbdPayout,
        steem_payout: steemPayout,
        vesting_payout: vestingPayout,
      } = opData;

      const { author, permlink } = opData;

      sbdPayout = parseToken(sbdPayout)
        .toFixed(3)
        .replace(',', '.');
      steemPayout = parseToken(steemPayout)
        .toFixed(3)
        .replace(',', '.');
      vestingPayout = vestsToSp(parseToken(vestingPayout), steemPerMVests)
        .toFixed(3)
        .replace(',', '.');

      result.value = `${sbdPayout > 0 ? `${sbdPayout} SBD` : ''} ${
        steemPayout > 0 ? `${steemPayout} STEEM` : ''
      } ${vestingPayout > 0 ? `${vestingPayout} SP` : ''}`;

      result.details = author && permlink ? `@${author}/${permlink}` : null;
      if (result.textKey === 'comment_benefactor_reward') {
        result.icon = 'comment';
      }
      break;
    case 'claim_reward_balance':
      let { reward_sbd: rewardSdb, reward_steem: rewardSteem, reward_vests: rewardVests } = opData;

      rewardSdb = parseToken(rewardSdb)
        .toFixed(3)
        .replace(',', '.');
      rewardSteem = parseToken(rewardSteem)
        .toFixed(3)
        .replace(',', '.');
      rewardVests = vestsToSp(parseToken(rewardVests), steemPerMVests)
        .toFixed(3)
        .replace(',', '.');

      result.value = `${rewardSdb > 0 ? `${rewardSdb} SBD` : ''} ${
        rewardSteem > 0 ? `${rewardSteem} STEEM` : ''
      } ${rewardVests > 0 ? `${rewardVests} SP` : ''}`;
      break;
    case 'transfer':
    case 'transfer_to_savings':
    case 'transfer_from_savings':
    case 'transfer_to_vesting':
      const { amount, memo, from, to } = opData;

      result.value = `${amount}`;
      result.icon = 'compare-arrows';
      result.details = from && to ? `@${from} to @${to}` : null;
      result.memo = memo || null;
      break;
    case 'withdraw_vesting':
      const { acc } = opData;
      let { vesting_shares: opVestingShares } = opData;

      opVestingShares = parseToken(opVestingShares);
      result.value = `${vestsToSp(opVestingShares, steemPerMVests)
        .toFixed(3)
        .replace(',', '.')} SP`;
      result.icon = 'attach-money';
      result.details = acc ? `@${acc}` : null;
      break;
    case 'fill_order':
      const { current_pays: currentPays, open_pays: openPays } = opData;

      result.value = `${currentPays} = ${openPays}`;
      result.icon = 'reorder';
      break;
    case 'escrow_transfer':
    case 'escrow_dispute':
    case 'escrow_release':
    case 'escrow_approve':
      const { agent, escrow_id } = opData;
      let { from: frome } = opData;
      let { to: toe } = opData;

      result.value = `${escrow_id}`;
      result.icon = 'wb-iridescent';
      result.details = frome && toe ? `@${frome} to @${toe}` : null;
      result.memo = agent || null;
      break;
    case 'delegate_vesting_shares':
      const { delegator, delegatee, vesting_shares } = opData;

      result.value = `${vesting_shares}`;
      result.icon = 'change-history';
      result.details = delegatee && delegator ? `@${delegator} to @${delegatee}` : null;
      break;
    case 'cancel_transfer_from_savings':
      let { from: from_who, request_id: requestId } = opData;

      result.value = `${0}`;
      result.icon = 'cancel';
      result.details = from_who ? `from @${from_who}, id: ${requestId}` : null;
      break;
    case 'fill_convert_request':
      let { owner: who, requestid: requestedId, amount_out: amount_out } = opData;

      result.value = `${amount_out}`;
      result.icon = 'hourglass-full';
      result.details = who ? `@${who}, id: ${requestedId}` : null;
      break;
    case 'fill_transfer_from_savings':
      let { from: fillwho, to: fillto, amount: fillamount, request_id: fillrequestId } = opData;

      result.value = `${fillamount}`;
      result.icon = 'hourglass-full';
      result.details = fillwho ? `@${fillwho} to @${fillto}, id: ${fillrequestId}` : null;
      break;
    case 'fill_vesting_withdraw':
      let { from_account: pd_who, to_account: pd_to, deposited: deposited } = opData;

      result.value = `${deposited}`;
      result.icon = 'hourglass-full';
      result.details = pd_who ? `@${pd_who} to ${pd_to}` : null;
      break;
    default:
      return [];
  }
  return result;
};

export const groomingWalletData = async (user, globalProps, userCurrency) => {
  const walletData = {};

  if (!user) {
    return walletData;
  }

  const state = await getState(`/@${get(user, 'name')}/transfers`);
  const { accounts } = state;
  if (!accounts) {
    return walletData;
  }
  const userdata = get(accounts, get(user, 'name'), '');

  // TODO: move them to utils these so big for a lifecycle function
  walletData.rewardSteemBalance = parseToken(userdata.reward_steem_balance);
  walletData.rewardSbdBalance = parseToken(userdata.reward_sbd_balance);
  walletData.rewardVestingSteem = parseToken(userdata.reward_vesting_steem);
  walletData.hasUnclaimedRewards =
    walletData.rewardSteemBalance > 0 ||
    walletData.rewardSbdBalance > 0 ||
    walletData.rewardVestingSteem > 0;
  walletData.balance = parseToken(userdata.balance);
  walletData.vestingShares = parseToken(userdata.vesting_shares);
  walletData.vestingSharesDelegated = parseToken(userdata.delegated_vesting_shares);
  walletData.vestingSharesReceived = parseToken(userdata.received_vesting_shares);
  walletData.vestingSharesTotal =
    walletData.vestingShares - walletData.vestingSharesDelegated + walletData.vestingSharesReceived;
  walletData.sbdBalance = parseToken(userdata.sbd_balance);
  walletData.savingBalance = parseToken(userdata.savings_balance);
  walletData.savingBalanceSbd = parseToken(userdata.savings_sbd_balance);

  const feedHistory = await getFeedHistory();
  const base = parseToken(feedHistory.current_median_history.base);
  const quote = parseToken(feedHistory.current_median_history.quote);

  walletData.steemPerMVests = globalProps.steemPerMVests;

  const pricePerSteem = base / quote;

  const totalSteem =
    vestsToSp(walletData.vestingShares, walletData.steemPerMVests) +
    walletData.balance +
    walletData.savingBalance;

  const totalSbd = walletData.sbdBalance + walletData.savingBalanceSbd;

  walletData.estimatedValue = totalSteem * pricePerSteem + totalSbd;

  const ppSbd = await getCurrencyTokenRate(userCurrency, 'sbd');
  const ppSteem = await getCurrencyTokenRate(userCurrency, 'steem');

  walletData.estimatedSteemValue = (walletData.balance + walletData.savingBalance) * ppSteem;
  walletData.estimatedSbdValue = totalSbd * ppSbd;
  walletData.estimatedSpValue =
    vestsToSp(walletData.vestingShares, walletData.steemPerMVests) * ppSteem;

  walletData.showPowerDown = userdata.next_vesting_withdrawal !== '1969-12-31T23:59:59';
  const timeDiff = Math.abs(parseDate(userdata.next_vesting_withdrawal) - new Date());
  walletData.nextVestingWithdrawal = Math.round(timeDiff / (1000 * 3600));

  const { transfer_history: transferHistory, other_history: virtualHistory } = userdata;

  const realHistory = transferHistory
    ? transferHistory.slice(Math.max(transferHistory.length - 50, 0))
    : [];
  realHistory.push(...virtualHistory); //concat
  realHistory.sort(compare); //sort desc

  walletData.transactions = realHistory;

  return walletData;
};

function compare(a, b) {
  if (a[1].block < b[1].block) {
    return 1;
  }
  if (a[1].block > b[1].block) {
    return -1;
  }
  return 0;
}

export const groomingPointsTransactionData = transaction => {
  if (!transaction) {
    return null;
  }
  const result = { ...transaction };

  result.details = get(transaction, 'sender')
    ? `from @${get(transaction, 'sender')}`
    : get(transaction, 'receiver') && `to @${get(transaction, 'receiver')}`;

  result.value = `${get(transaction, 'amount')} ESTM`;

  return result;
};
