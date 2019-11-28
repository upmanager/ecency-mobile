import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../icon';

// External Components
import { DropdownButton } from '../../dropdownButton';

// Components
import { LineBreak, Tag } from '../../basicUIElements';

// Styles
import styles from './filterBarStyles';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

const FilterBarView = ({
  defaultText,
  dropdownIconName,
  iconSize,
  isHide,
  onDropdownSelect,
  onRightIconPress,
  options,
  rightIconName,
  rightIconType,
  selectedOptionIndex,
}) => (
    <View style={styles.container}>
      {!isHide && (
        <LineBreak height={38}>
          <View style={styles.filterBarWrapper}>
            <View style={styles.dropdownWrapper}>
              {options.map((item, index) => <Tag value={item} isFilter isPin={index == selectedOptionIndex} onPress={() => onDropdownSelect(index)} />)}
            </View>
            {rightIconName && (
              <TouchableOpacity
                onPress={() => onRightIconPress && onRightIconPress()}
                style={styles.rightIconWrapper}
              >
                <Icon
                  style={styles.rightIcon}
                  size={iconSize || 28}
                  iconType={rightIconType}
                  name={rightIconName}
                />
              </TouchableOpacity>
            )}
          </View>
        </LineBreak>
      )}
    </View>
  );

export default FilterBarView;
