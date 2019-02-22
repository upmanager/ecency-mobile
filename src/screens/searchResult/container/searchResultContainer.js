import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Component
import SearchResultScreen from '../screen/searchResultScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class SearchResultContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { currentAccount, navigation } = this.props;

    const tag = navigation.getParam('tag', 'esteem');

    return <SearchResultScreen currentAccount={currentAccount} tag={tag} />;
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(SearchResultContainer);
