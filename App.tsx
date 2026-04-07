import { StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegistrationScreen';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import { activeColor, bgColor, imageUrl, themeColor } from './pages/core/common';
import { Icon, PaperProvider } from 'react-native-paper';
import HomeScreen from './pages/screens/HomeScreen';
import BusinessScreen from './pages/screens/BusinessScreen';
import ProfileScreen from './pages/screens/ProfileScreen';
import GreetingsScreen from './pages/screens/GreetingsScreen';
import SplashScreen from './pages/SplashScreen';
import DesignListScreen from './pages/features/DesignListScreen';
import DesignEditScreen from './pages/features/DesignEditScreen';
import SubscriptionScreen from './pages/features/Subscription';
import CustomScreen from './pages/screens/CustomScreen';
import BusinessProfile from './pages/features/BusinessProfile';
import PoliticalProfile from './pages/features/PoliticalProfile';
import HeaderButton from './pages/features/components/HeaderButton';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ initialHomeData }: any) {
  const navigation = useNavigation<any>();
  const [isActivePlan, setIsActivePlan] = useState<any>(false);
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColor },
        headerTintColor: '#fff',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12, paddingBottom: 5 },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#ffffffe1',
        tabBarStyle: {
          backgroundColor: themeColor,
          height: 55
        },
        headerRight: () => (
          <HeaderButton isActivePlan={isActivePlan} />
        ),
      }}
    >
      <Tab.Screen
        name="ITRA ROBO" component={HomeScreen}
        initialParams={{ initialData: initialHomeData }}
        options={{
          headerStyle: { backgroundColor: themeColor },
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon source='home' color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="Greetings" component={GreetingsScreen}
        options={{
          headerStyle: { backgroundColor: themeColor },
          tabBarLabel: 'Greetings',
          tabBarIcon: ({ color, size }) => (
            <Icon source='puzzle-star' color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="Business Designs" component={BusinessScreen}
        options={{
          headerStyle: { backgroundColor: themeColor },
          tabBarLabel: 'Business',
          tabBarIcon: ({ color, size }) => (
            <Icon source='store' color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="Custom Designs" component={CustomScreen}
        options={{
          headerStyle: { backgroundColor: themeColor },
          tabBarLabel: 'Custom',
          tabBarIcon: ({ color, size }) => (
            <Icon source='creation' color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerStyle: { backgroundColor: themeColor },
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon source='account' color={color} size={size} />
          )
        }}
      />

    </Tab.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    const initFCM = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL
      if (enabled) {
        const token = await messaging().getToken();
      }
    }
    initFCM();
    const unsubscribe = messaging().onMessage(async remoteMessage => {

    })
    messaging().setBackgroundMessageHandler(async remoteMessage => {

    })
    return unsubscribe;
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:bgColor }} edges={['left', 'right', 'bottom']}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'SplashScreen'} screenOptions={{ headerStyle: { backgroundColor: themeColor }, headerTintColor: '#fff' }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgetPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }}  />
          <Stack.Screen name="DesignList" component={DesignListScreen} options={{ headerShown: true, headerStyle: { backgroundColor: themeColor }, title: 'Design List' }} />
          <Stack.Screen name="DesignEdit" component={DesignEditScreen} options={{ headerShown: true, title: 'Design Edit' }} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, headerStyle: { backgroundColor: themeColor }, title: 'Subscribe' }} />
          <Stack.Screen name="BusinessProfile" component={BusinessProfile} options={{ headerShown: true, title: 'Business Profile' }} />
          <Stack.Screen name="PoliticalProfile" component={PoliticalProfile} options={{ headerShown: true, title: 'Political Profile' }} />
        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaView>
  );
}

export default App;
