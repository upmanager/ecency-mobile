import get from 'lodash/get';
import parseDate from './parseDate';
import parseToken from './parseToken';
import { vestsToHp } from './conversions';
import { getFeedHistory, getAccount, getAccountHistory } from '../providers/hive/dhive';
import { getCurrencyTokenRate } from '../providers/ecency/ecency';

export const transferTypes = [
  'curation_reward',
  'author_reward',
  'comment_benefactor_reward',
  'claim_reward_balance',
  'transfer',
  'transfer_to_savings',
  'transfer_from_savings',
  'transfer_to_vesting',
  'withdraw_vesting',
  'fill_order',
  'escrow_transfer',
  'escrow_dispute',
  'escrow_release',
  'escrow_approve',
  'delegate_vesting_shares',
  'cancel_transfer_from_savings',
  'fill_convert_request',
  'fill_transfer_from_savings',
  'fill_vesting_withdraw',
];

export const groomingTransactionData = (transaction, hivePerMVests) => {
  if (!transaction || !hivePerMVests) {
    return [];
  }

  const result = {
    iconType: 'MaterialIcons',
  };

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

      result.value = `${vestsToHp(parseToken(reward), hivePerMVests)
        .toFixed(3)
        .replace(',', '.')} HP`;
      result.details = commentAuthor ? `@${commentAuthor}/${commentPermlink}` : null;
      break;
    case 'author_reward':
    case 'comment_benefactor_reward':
      let {
        hbd_payout: hbdPayout,
        hive_payout: hivePayout,
        vesting_payout: vestingPayout,
      } = opData;

      const { author, permlink } = opData;

      hbdPayout = parseToken(hbdPayout).toFixed(3).replace(',', '.');
      hivePayout = parseToken(hivePayout).toFixed(3).replace(',', '.');
      vestingPayout = vestsToHp(parseToken(vestingPayout), hivePerMVests)
        .toFixed(3)
        .replace(',', '.');

      result.value = `${hbdPayout > 0 ? `${hbdPayout} HBD` : ''} ${
        hivePayout > 0 ? `${hivePayout} HIVE` : ''
      } ${vestingPayout > 0 ? `${vestingPayout} HP` : ''}`;

      result.details = author && permlink ? `@${author}/${permlink}` : null;
      if (result.textKey === 'comment_benefactor_reward') {
        result.icon = 'comment';
      }
      break;
    case 'claim_reward_balance':
      let { reward_hbd: rewardHdb, reward_hive: rewardHive, reward_vests: rewardVests } = opData;

      rewardHdb = parseToken(rewardHdb).toFixed(3).replace(',', '.');
      rewardHive = parseToken(rewardHive).toFixed(3).replace(',', '.');
      rewardVests = vestsToHp(parseToken(rewardVests), hivePerMVests).toFixed(3).replace(',', '.');

      result.value = `${rewardHdb > 0 ? `${rewardHdb} HBD` : ''} ${
        rewardHive > 0 ? `${rewardHive} HIVE` : ''
      } ${rewardVests > 0 ? `${rewardVests} HP` : ''}`;
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
      result.value = `${vestsToHp(opVestingShares, hivePerMVests).toFixed(3).replace(',', '.')} HP`;
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
  const state = await getAccount(get(user, 'name'));

  //const { accounts } = state;
  //if (!accounts) {
  //  return walletData;
  //}
  const [userdata] = state;

  // TODO: move them to utils these so big for a lifecycle function
  walletData.rewardHiveBalance = parseToken(userdata.reward_hive_balance);
  walletData.rewardHbdBalance = parseToken(userdata.reward_hbd_balance);
  walletData.rewardVestingHive = parseToken(userdata.reward_vesting_hive);
  walletData.hasUnclaimedRewards =
    walletData.rewardHiveBalance > 0 ||
    walletData.rewardHbdBalance > 0 ||
    walletData.rewardVestingHive > 0;
  walletData.balance = parseToken(userdata.balance);
  walletData.vestingShares = parseToken(userdata.vesting_shares);
  walletData.vestingSharesDelegated = parseToken(userdata.delegated_vesting_shares);
  walletData.vestingSharesReceived = parseToken(userdata.received_vesting_shares);
  walletData.vestingSharesTotal =
    walletData.vestingShares - walletData.vestingSharesDelegated + walletData.vestingSharesReceived;
  walletData.hbdBalance = parseToken(userdata.hbd_balance);
  walletData.savingBalance = parseToken(userdata.savings_balance);
  walletData.savingBalanceHbd = parseToken(userdata.savings_hbd_balance);

  const feedHistory = await getFeedHistory();
  const base = parseToken(feedHistory.current_median_history.base);
  const quote = parseToken(feedHistory.current_median_history.quote);

  walletData.hivePerMVests = globalProps.hivePerMVests;

  const pricePerHive = base / quote;

  const totalHive =
    vestsToHp(walletData.vestingShares, walletData.hivePerMVests) +
    walletData.balance +
    walletData.savingBalance;

  const totalHbd = walletData.hbdBalance + walletData.savingBalanceHbd;

  walletData.estimatedValue = totalHive * pricePerHive + totalHbd;

  const ppHbd = await getCurrencyTokenRate(userCurrency, 'hbd');
  const ppHive = await getCurrencyTokenRate(userCurrency, 'hive');

  walletData.estimatedHiveValue = (walletData.balance + walletData.savingBalance) * ppHive;
  walletData.estimatedHbdValue = totalHbd * ppHbd;
  walletData.estimatedHpValue =
    vestsToHp(walletData.vestingShares, walletData.hivePerMVests) * ppHive;

  walletData.showPowerDown = userdata.next_vesting_withdrawal !== '1969-12-31T23:59:59';
  const timeDiff = Math.abs(parseDate(userdata.next_vesting_withdrawal) - new Date());
  walletData.nextVestingWithdrawal = Math.round(timeDiff / (1000 * 3600));

  const history = await getAccountHistory(get(user, 'name'));

  const transfers = history.filter((tx) => transferTypes.includes(get(tx[1], 'op[0]', false)));

  transfers.sort(compare);

  walletData.transactions = transfers;
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

export const groomingPointsTransactionData = (transaction) => {
  if (!transaction) {
    return null;
  }
  const result = {
    ...transaction,
  };

  result.details = get(transaction, 'sender')
    ? `from @${get(transaction, 'sender')}`
    : get(transaction, 'receiver') && `to @${get(transaction, 'receiver')}`;

  result.value = `${get(transaction, 'amount')} Points`;

  return result;
};

export const getPointsEstimate = async (amount, userCurrency) => {
  if (!amount) {
    return 0;
  }
  const ppEstm = await getCurrencyTokenRate(userCurrency, 'estm');

  return ppEstm * amount;
};

export const getBtcEstimate = async (amount, userCurrency) => {
  if (!amount) {
    return 0;
  }
  const ppBtc = await getCurrencyTokenRate(userCurrency, 'btc');

  return ppBtc * amount;
};
