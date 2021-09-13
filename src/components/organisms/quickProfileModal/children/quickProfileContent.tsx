import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { View, Text, ActivityIndicator, Alert } from 'react-native'
import { ProfileStats, StatsData } from './profileStats'
import { MainButton, PercentBar } from '../../..'
import { checkFavorite } from '../../../../providers/ecency/ecency'
import { getFollows, getRelationship, getUser } from '../../../../providers/hive/dhive'
import { getRcPower, getVotingPower } from '../../../../utils/manaBar'
import styles from './quickProfileStyles'
import { ProfileBasic } from './profileBasic'
import { parseReputation } from '../../../../utils/user'
import { default as ROUTES } from '../../../../constants/routeNames';

interface QuickProfileContentProps {
    username:string,
    currentAccountName:string;
    navigation:any;
    onClose:()=>void;
}

export const QuickProfileContent = ({
    currentAccountName,
    username,
    navigation,
    onClose
}:QuickProfileContentProps) => {
    const intl = useIntl();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [follows, setFollows] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);

    const isOwnProfile = currentAccountName === username;

    useEffect(() => {
        if(username) {
            _fetchUser();
            _fetchExtraUserData();
        } else {
            setUser(null);
        }
    }, [username])


    //NETWORK CALLS
    const _fetchUser = async () => {
        setIsLoading(true);
        try {
          const _user = await getUser(username, isOwnProfile);
          setUser(_user)
        } catch (error) {
            setIsLoading(false);
        }
    };


    const _fetchExtraUserData = async () => {
        try {
            if (username) {
                let _isFollowing;
                let _isMuted;
                let _isFavourite;
                let follows;
        
                if (!isOwnProfile) {
                    const res = await getRelationship(currentAccountName, username);
                    _isFollowing = res && res.follows;
                    _isMuted = res && res.ignores;
                    _isFavourite = await checkFavorite(username);
                }
        
                try {
                    follows = await getFollows(username);
                } catch (err) {
                    follows = null;
                }
        
            
                setFollows(follows);
                setIsFollowing(_isFollowing);
                setIsMuted(_isMuted)
                setIsFavourite(_isFavourite)
                setIsLoading(false);
            
            }
        } catch (error) {
            console.warn('Failed to fetch complete profile data', error);
            Alert.alert(
            intl.formatMessage({
                id: 'alert.fail',
            }),
            error.message || error.toString(),
            );
            setIsLoading(false);
        }
    };


    //UI CALLBACKS
    const _openFullProfile = () => {
        let params = {
          username,
          reputation: user ? user.reputation : null
        };
  
        if (isOwnProfile) {
          navigation.navigate(ROUTES.TABBAR.PROFILE);
        } else {
          navigation.navigate({
            routeName: ROUTES.SCREENS.PROFILE,
            params,
            key: username,
          });
        }
        if(onClose){
            onClose();
        }
    }

    //extract prop values
    let _votingPower = '';
    let _resourceCredits = '';
    let _followerCount = 0;
    let _followingCount = 0;
    let _postCount = 0;
    let _avatarUrl = '';
    let _about = '';
    let _reputation = 0;

    if (user && !isLoading) {
      _votingPower = getVotingPower(user).toFixed(1);
      _resourceCredits = getRcPower(user).toFixed(1);
      _postCount = user.post_count || 0;
      _avatarUrl = user.avatar || '';
      _about = user.about?.profile?.about || '';
      _reputation = parseReputation(user.reputation);
      
      if(follows){
        _followerCount = follows.follower_count || 0;
        _followingCount = follows.following_count || 0
       }
    }

    

    const statsData1 = [
        {label:'Follower', value:_followerCount},
        {label:'Following', value:_followingCount},
        {label:'Posts', value:_postCount},
    ] as StatsData[]

    const statsData2 = [
        {label:'Voting Power', value:_votingPower, suffix:'%'},
        {label:'Reputation', value:_reputation},
    ] as StatsData[]

    return (
        <View style={styles.modalStyle}>
            <ProfileBasic 
                username={username} 
                about={_about} 
                avatarUrl={_avatarUrl} 
                resourceCredits={_resourceCredits}
                isLoading={isLoading}
            />
            <ProfileStats 
                data={statsData1}
            />
             <ProfileStats 
                horizontalMargin={16}
                data={statsData2}
            />
            <MainButton
                style={styles.button}
                text='VIEW FULL PROFILE'
                onPress={_openFullProfile}
            />
        </View>
    )
};
