import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { HeaderView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class HeaderContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _handleOpenDrawer = () => {
    const { navigation } = this.props;

    navigation.openDrawer();
  };

  render() {
    return <HeaderView handleOpenDrawer={this._handleOpenDrawer} {...this.props} />;
  }
}

export default withNavigation(HeaderContainer);
