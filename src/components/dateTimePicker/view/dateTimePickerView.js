import React, { useState, useRef, forwardRef } from 'react';
import { Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { FormattedDate, useIntl } from 'react-intl';

import useCombinedRefs from '../../../customHooks/useCombinedRefs';

// Component
import { Icon } from '../../icon';

// Utils
import getLocale from '../../../utils/getLocale';

// Styles
import styles from './dateTimePickerStyles';

const DateTimePickerView = React.forwardRef(({ type, iconName, disabled, onChanged }, ref) => {
  const [date, setDate] = useState(new Date());

  const _setDate = (_date) => {
    if (_date) {
      const formattedDate = moment(_date).format();

      setDate(_date);
      onChanged(formattedDate);
    }
  };

  return (
    <DatePicker
      textColor={styles.datePickerText.color}
      date={date}
      onDateChange={_setDate}
      style={styles.picker}
      minimumDate={new Date()}
      androidVariant="iosClone"
      is24hourSource="device"
      locale={getLocale()}
    />
  );
});

export default DateTimePickerView;
