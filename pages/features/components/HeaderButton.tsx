import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Chip, Icon } from 'react-native-paper';
import { activeColor } from '../../core/common';

const HeaderButton = ({ isActivePlan }:{ isActivePlan:any }) => {
  const navigation = useNavigation<any>();
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', 'orange'],
  });

  return (
    <View style={styles.container}>
      {!isActivePlan && (
        <Pressable onPress={() => navigation.navigate('Subscription')}>
          <Animated.View
            style={[
              styles.chipWrapper,
              {
                borderColor,
                borderWidth: 3,
                borderRadius: 18,
                borderStyle: 'solid',
              },
            ]}
          >
            <Chip
              icon={() => (
                <Icon
                  source="checkbox-multiple-marked-circle-outline"
                  size={16}
                  color="white"
                />
              )}
              rippleColor={'white'}
              style={styles.chip}
              textStyle={styles.text}
            >
              UPGRADE PLAN
            </Chip>
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 10,
  },
  chipWrapper: {
    margin: 5,
    alignSelf: 'flex-start',
  },
  chip: {
    backgroundColor: '#cc001f',
    color:activeColor,
    borderColor: 'skyblue',
    borderWidth: 1,
    borderRadius: 15,
    height: 30,
    elevation: 4,
    shadowColor: '#6200ea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  text: {
    color: activeColor,
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 3,
  },
});

export default HeaderButton;