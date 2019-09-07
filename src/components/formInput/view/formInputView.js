import React, { Component } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Icon } from '../../icon';

// Constants

// Components
import { TextInput } from '../../textInput';
// Styles
import styles from './formInputStyles';

class FormInputView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { string }     placeholder       - Place holder text.
   *   @prop { string }     type              - Input type.
   *   @prop { boolean }    isFirstImage      - Render image from steem.
   *   @prop { boolean }    isEditable        - Can permission edit.
   *   @prop { boolean }    isValid           - This delegate input valit or not.
   *   @prop { boolean }    secureTextEntry   - For hiding password value.
   *
   *
   *
   */
  constructor(props) {
    super(props);

    this.state = {
      value: props.value || '',
      inputBorderColor: '#c1c5c7',
      isValid: true,
    };
  }

  // Component Life Cycles
  componentWillReceiveProps(nextProps) {
    const { isValid } = this.props;

    if (nextProps.isValid !== isValid) {
      this.setState({ isValid: nextProps.isValid });
    }
  }

  // Component Functions
  _handleOnChange = value => {
    const { onChange } = this.props;

    this.setState({ value });
    onChange && onChange(value);
  };

  _handleOnFocus = () => {
    const { inputBorderColor } = this.state;
    if (inputBorderColor !== '#357ce6') {
      this.setState({ inputBorderColor: '#357ce6' });
    }
  };

  render() {
    const { inputBorderColor, isValid, value } = this.state;
    const {
      placeholder,
      type,
      isFirstImage,
      isEditable,
      leftIconName,
      rightIconName,
      secureTextEntry,
      iconType,
      wrapperStyle,
      height,
      inputStyle,
    } = this.props;
    return (
      <View
        style={[
          styles.wrapper,
          {
            borderBottomColor: isValid ? inputBorderColor : 'red',
          },
          wrapperStyle,
        ]}
      >
        {isFirstImage && value && value.length > 2 ? (
          <View style={{ flex: 0.15 }}>
            <FastImage
              style={styles.firstImage}
              source={{
                uri: `https://steemitimages.com/u/${value}/avatar/small`,
                priority: FastImage.priority.high,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
        ) : (
          rightIconName && (
            <Icon iconType={iconType || 'MaterialIcons'} name={rightIconName} style={styles.icon} />
          )
        )}
        <View style={styles.textInput}>
          <TextInput
            style={inputStyle}
            onFocus={() => this._handleOnFocus()}
            autoCapitalize="none"
            secureTextEntry={secureTextEntry}
            height={height}
            placeholder={placeholder}
            editable={isEditable || true}
            textContentType={type}
            onChangeText={val => this._handleOnChange(val)}
            value={value}
          />
        </View>

        {value && value.length > 0 ? (
          <Icon
            iconType={iconType || 'MaterialIcons'}
            onPress={() => this.setState({ value: '' })}
            name={leftIconName}
            style={styles.icon}
          />
        ) : null}
      </View>
    );
  }
}

export default FormInputView;
