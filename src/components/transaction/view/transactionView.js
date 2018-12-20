import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';

// Utilities
import { getTransactionData } from '../../../utils/wallet';

// Components
// import { FilterBar } from '../../filterBar';
import { WalletLineItem, Card } from '../../basicUIElements';
import { CollapsibleCard } from '../../collapsibleCard';

class TransactionView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  _handleOnDropdownSelect = () => {};

  render() {
    const {
      walletData: { transactions },
      intl,
      intl: { formatNumber },
      walletData,
    } = this.props;

    return (
      <Fragment>
        {/* this feature not implemented yet */}
        {/* <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={['ALL TRANSACTIONS', 'VOTES', 'REPLIES']}
          defaultText="ALL TRANSACTIONS"
          onDropdownSelect={() => this._handleOnDropdownSelect()}
          rightIconName="ios-lock"
          iconSize={16}
          if (index % 2 === 0) {
        /> */}
        <Card>
          {transactions
            && transactions.map((item, index) => {
              const transactionData = getTransactionData(item, walletData, formatNumber);

              return (
                <CollapsibleCard
                  noBorder
                  noContainer
                  key={index}
                  titleComponent={(
                    <WalletLineItem
                      key={index}
                      index={index}
                      text={intl.formatMessage({
                        id: `wallet.${transactionData.opName}`,
                      })}
                      description={intl.formatRelative(transactionData.transDate)}
                      isCircleIcon
                      isThin
                      circleIconColor="white"
                      isBlackText
                      iconName={transactionData.icon}
                      iconType="MaterialIcons"
                      rightText={transactionData.value}
                    />
)}
                >
                  {(!!transactionData.details || !!transactionData.memo) && (
                    <WalletLineItem
                      key={index}
                      text={!!transactionData.details && transactionData.details}
                      isBlackText
                      isThin
                      description={!!transactionData.memo && transactionData.memo}
                    />
                  )}
                </CollapsibleCard>
              );
            })}
        </Card>
      </Fragment>
    );
  }
}

export default injectIntl(TransactionView);
