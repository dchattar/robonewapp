import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = () => {
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        navigation.replace("Main");
      } else {
        navigation.replace('Login');
      }
    };

    if (isVideoFinished) {
      checkLoginStatus();
    }
  }, [isVideoFinished, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#ffffff'} barStyle="light-content" />
      <Video
        source={require('../assets/intro.mp4')}
        style={styles.video}
        resizeMode="contain"
        onEnd={() => setIsVideoFinished(true)}
        onError={(error:any) => console.log('Error playing video:', error)}
        repeat={false}
        controls={false}
        muted={true}
        playInBackground={true}
        playWhenInactive={true}
        ignoreSilentSwitch="ignore"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding:10,
    backgroundColor: '#ffffff',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
