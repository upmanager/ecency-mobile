import React, { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useIntl } from 'react-intl';
import { debounce } from 'lodash';

// Components
import { SearchInput, TabBar, IconButton } from '../../../components';
import Communities from './tabs/communities/view/communitiesResults';
import PostsResults from './tabs/best/view/postsResults';
import TopicsResults from './tabs/topics/view/topicsResults';
import PeopleResults from './tabs/people/view/peopleResults';

// Styles
import styles from './searchResultStyles';
import globalStyles from '../../../globalStyles';

const SearchResultScreen = ({ navigation }) => {
  const [searchValue, setSearchValue] = useState('');
  const intl = useIntl();

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  const _renderTabbar = () => (
    <TabBar
      style={styles.tabbar}
      tabUnderlineDefaultWidth={80}
      tabUnderlineScaleX={2}
      tabBarPosition="overlayTop"
      textStyle={styles.tabBarText}
    />
  );

  const _handleChangeText = debounce((value) => {
    setSearchValue(value);
  }, 1000);

  return (
    <View style={styles.container}>
      <SearchInput
        showClearButton={true}
        placeholder={intl.formatMessage({ id: 'header.search' })}
        onChangeText={_handleChangeText}
        value={searchValue}
        backEnabled={true}
        onBackPress={_navigationGoBack}
      />

      <ScrollableTabView
        style={globalStyles.tabView}
        renderTabBar={_renderTabbar}
        prerenderingSiblingsNumber={Infinity}
      >
        <View
          tabLabel={intl.formatMessage({ id: 'search_result.best.title' })}
          style={styles.tabbarItem}
        >
          <PostsResults searchValue={searchValue} />
        </View>
        <View
          tabLabel={intl.formatMessage({ id: 'search_result.people.title' })}
          style={styles.tabbarItem}
        >
          <PeopleResults searchValue={searchValue} />
        </View>
        <View
          tabLabel={intl.formatMessage({ id: 'search_result.topics.title' })}
          style={styles.tabbarItem}
        >
          <TopicsResults searchValue={searchValue} />
        </View>
        <View
          tabLabel={intl.formatMessage({ id: 'search_result.communities.title' })}
          style={styles.tabbarItem}
        >
          <Communities searchValue={searchValue} />
        </View>
      </ScrollableTabView>
    </View>
  );
};

export default SearchResultScreen;
