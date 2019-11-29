/* eslint-disable radix */
import React from 'react';
import { Dimensions, View } from 'react-native';
import times from 'lodash/times';
import Placeholder from 'rn-placeholder';

import { ThemeContainer } from '../../../../containers';

import styles from './boostPlaceHolderStyles';

const HEIGHT = Dimensions.get('window').height;

const BoostPlaceHolder = () => {
  const ratio = (HEIGHT - 300) / 50 / 1.3;
  const listElements = [];

  times(parseInt(ratio), i => {
    listElements.push(
      <ThemeContainer>
        {({ isDarkTheme }) => {
          const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';
          return (
            <View style={styles.container} key={"ind" + i.toString()}>
              <View style={styles.line}>
                <Placeholder.Box color={color} width={90} height={40} animate="fade" />
                <View style={styles.paragraphWrapper}>
                  <Placeholder.Box
                    color={color}
                    width={140}
                    radius={25}
                    height={50}
                    animate="fade"
                  />
                </View>
                <Placeholder.Box
                  style={styles.rightBox}
                  color={color}
                  width={20}
                  height={10}
                  animate="fade"
                />
              </View>
            </View>
          );
        }}
      </ThemeContainer>,
    );
  });

  return <View style={styles.container}>{listElements}</View>;
};

export default BoostPlaceHolder;
