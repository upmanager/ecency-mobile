import React from 'react';
import { View, Text, Picker } from 'react-native';
import GrayWrapper from '../grayWrapper/grayWrapperView';

import { Icon } from '../../../icon';
import { DropdownButton } from '../../../dropdownButton';

import styles from './walletLineItemStyles';

const WalletLineItem = ({
  circleIconColor,
  description,
  fitContent,
  iconName,
  iconType,
  isBlackText,
  isBoldText,
  isCircleIcon,
  isThin,
  rightText,
  rightTextColor,
  text,
  textColor,
  index,
  style,
  dropdown,
  dropdownOptions,
  onDropdownSelect,
}) => (
  <GrayWrapper isGray={index && index % 2 !== 0}>
    <View style={[styles.container, fitContent && styles.fitContent, style]}>
      <View style={styles.iconTextWrapper}>
        {iconName && (
          <View
            style={[
              styles.iconWrapper,
              isCircleIcon && styles.circleIcon,
              circleIconColor && { backgroundColor: circleIconColor },
            ]}
          >
            <Icon style={styles.icon} name={iconName} iconType={iconType} />
          </View>
        )}
        <View>
          {text && (
            <View>
              <Text
                style={[
                  styles.text,
                  !iconName && styles.onlyText,
                  rightText && styles.longText,
                  isBlackText && styles.blackText,
                  textColor && { color: textColor },
                  isBoldText && { fontWeight: 'bold' },
                  isThin && styles.thinText,
                ]}
              >
                {text}
              </Text>
            </View>
          )}
          {!!description && (
            <Text style={[styles.description, !iconName && styles.onlyText]}>{description}</Text>
          )}
        </View>
      </View>
      {rightText && (
        <View style={styles.rightTextWrapper}>
          <Text
            style={[
              styles.rightText,
              rightTextColor ? { color: rightTextColor } : !text && styles.onlyRightText,
            ]}
          >
            {rightText}
          </Text>
        </View>
      )}
      {dropdown && (
        <View style={styles.test}>
          <DropdownButton
            isHasChildIcon
            iconName="arrow-drop-down"
            options={dropdownOptions}
            noHighlight
            onSelect={onDropdownSelect}
          />
        </View>
      )}
    </View>
  </GrayWrapper>
);

export default WalletLineItem;
