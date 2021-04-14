import React from 'react';
import { useIntl } from 'react-intl';
import { Text, Image, View, SafeAreaView } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { Icon, MainButton } from '../../../components';

import styles from './welcomeStyles';

const WelcomeScreen = ({ handleButtonPress }) => {
  const intl = useIntl();

  const _renderInfo = (iconName, headingIntlId, bodyIntlId) => (
    <View style={styles.sectionRow}>
      <Icon
        iconType="SimpleLineIcons"
        name={iconName}
        color={EStyleSheet.value('$primaryBlue')}
        size={30}
      />
      <View>
        <Text style={styles.sectionTitle}>{intl.formatMessage({ id: headingIntlId })}</Text>
        <Text style={styles.sectionText}>{intl.formatMessage({ id: bodyIntlId })}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        style={styles.mascot}
        resizeMode="contain"
        source={require('../../../assets/love_mascot.png')}
      />
      <View style={styles.topText}>
        <Text style={styles.welcomeText}>{intl.formatMessage({ id: 'welcome.label' })}</Text>
        <Text style={styles.ecencyText}>{intl.formatMessage({ id: 'welcome.title' })}</Text>
      </View>
      <View>
        {_renderInfo('question', 'welcome.line1_heading', 'welcome.line1_body')}
        {_renderInfo('emotsmile', 'welcome.line2_heading', 'welcome.line2_body')}
        {_renderInfo('people', 'welcome.line3_heading', 'welcome.line3_body')}
      </View>

      <MainButton
        onPress={handleButtonPress}
        style={{ alignSelf: 'center', paddingHorizontal: 30 }}
        text="Get started!"
      />
    </View>
  );
};

export default WelcomeScreen;
