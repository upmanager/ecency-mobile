import React, { Component } from 'react';
import { View } from 'react-native';
// Constants

// Components
import { Chip } from '../../../basicUIElements';
// Styles
import styles from './tagAreaStyles';
import globalStyles from '../../../../globalStyles';

export default class TagAreaView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      currentText: '',
      chips: props.draftChips || [' '],
      chipsCount: props.chipsCount || 5,
      activeChip: 0,
    };
  }

  // Component Life Cycles
  componentWillReceiveProps(nextProps) {
    const { draftChips } = this.props;

    if (nextProps.draftChips && nextProps.draftChips !== draftChips) {
      const _chips = [...nextProps.draftChips, ' '];
      this.setState({
        chips: _chips,
      });
    }
  }

  // Component Functions
  _handleOnChange = (text, i) => {
    this.setState({ currentText: text.replace(/\s/g, '').toLowerCase() });

    if (text.indexOf(' ') > 0 && text) {
      this._handleTagAdded();
    }
    if (!text) {
      this._handleTagRemove(i);
    }
  };

  _handleOnBlur = (i) => {
    this._handleTagAdded(i);
  };

  _handleTagAdded = (i = null, text = null) => {
    const { currentText, chips, chipsCount } = this.state;
    const { handleTagChanged } = this.props;
    const _currentText = (currentText && currentText.trim()) || text;

    if (_currentText && chips && chips.length < chipsCount) {
      this.setState({
        chips: [...chips, _currentText],
        currentText: '',
      });
    }

    if (handleTagChanged && chips.length < chipsCount + 1) {
      handleTagChanged([...chips, _currentText]);
    }
  };

  _handleTagRemove = (i) => {
    const { chips } = this.state;
    const { handleTagChanged } = this.props;

    this.setState({
      chips: chips.filter((_, _i) => _i !== i),
    });

    if (handleTagChanged) {
      handleTagChanged(chips.filter((_, _i) => _i !== i));
    }
  };

  render() {
    const { isPreviewActive } = this.props;
    const { chips, activeChip, currentText } = this.state;

    return (
      <View style={globalStyles.containerHorizontal16}>
        <View style={styles.tagWrapper}>
          {chips.map(
            (chip, i) => i < 5 && (
            <Chip
              key={i}
              refs={(input) => {
                this.inputs[i] = input;
              }}
              isPin={i === 0 && chips[1]}
              placeholderTextColor="#fff"
              editable={!isPreviewActive}
              maxLength={50}
              placeholder="tags"
              autoFocus={i !== 0 && chips.length - 1 === i}
              multiline={false}
              handleOnChange={text => this._handleOnChange(text, i)}
              handleOnBlur={() => this._handleOnBlur(i)}
              blurOnSubmit
              value={
                    activeChip === i
                      ? currentText || chip.replace(/\s/g, '')
                      : chip.replace(/\s/g, '')
                  }
              autoCapitalize="none"
              onFocus={() => this.setState({ activeChip: i })}
              {...this.props}
            />
            ),
          )}
        </View>
      </View>
    );
  }
}
