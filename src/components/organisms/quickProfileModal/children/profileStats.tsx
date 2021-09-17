import React from 'react'
import { View, Text } from 'react-native'
import styles from './quickProfileStyles'
import * as Animated from 'react-native-animatable'


export interface StatsData {
    label:string,
    value:number|string,
    suffix?:string
}

interface Props {
    data:StatsData[],
    horizontalMargin?:number
}

export const ProfileStats = ({data, horizontalMargin}: Props) => {
    return (
        <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:40, marginHorizontal:horizontalMargin }}>
            {data.map((item)=><StatItem label={item.label} value={item.value && (item.value + (item.suffix || ''))}/>)}
        </View>
    )
}

const StatItem = (props:{label:string, value:number|string}) => (
    <View style={{alignItems:'center', flex:1}}>
        {!!props.value ? (
            <Animated.Text animation='bounceIn' style={styles.statValue}>{props.value}</Animated.Text>
        ):(
            <Text style={styles.statValue}>{'--'}</Text>
        )}
       
        <Text style={styles.statLabel}>{props.label}</Text>
    </View>
)





