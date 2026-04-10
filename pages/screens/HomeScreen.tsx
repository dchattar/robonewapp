import { useContext, useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Dimensions, Button, StatusBar } from "react-native";
import { activeColor, apiUrl, bgColor, imageUrl, themeColor } from "../core/common";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { Chip, Icon } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const numColumns = 4;
const screenWidth = Dimensions.get("window").width;
const itemBusinessWidth = screenWidth / 2 - 12;
const windowWidth = Dimensions.get('window').width;
const itemWidth = windowWidth / numColumns;
const width = Dimensions.get('window').width;
const imageSize = ((windowWidth / 3) - 3);

export default function HomeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation<any>();
  const [adFailed, setAdFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<any[]>([]);
  const [generalEvents, setGeneralEvents] = useState<any[]>([]);
  const [activeDate, setActiveDate] = useState<string>("");
  const progress = useSharedValue<number>(0);
  const [userInfo, setUserInfo] = useState<any>();
  const ref = React.useRef<ICarouselInstance>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem("userInfo");
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          setUserInfo(userInfo);
          const response = await fetch(`${apiUrl}homeData&id=${userInfo?.token}`);
          const result = await response.json();
          if (result.status === "success") {
            setBanners(result.banners);
            setTodayEvents(result.todays);
            const upcomingArray = Object.keys(result.upcoming).map((date) => ({ date, events: result.upcoming[date] })).sort((a, b) => a.date.localeCompare(b.date));
            setUpcomingEvents(upcomingArray);
            if (upcomingArray.length > 0) {
              setActiveDate(upcomingArray[0].date);
            }
            setTrendingEvents(result.trending);
            setGeneralEvents(result.general);
            await AsyncStorage.removeItem("userInfo");
            await AsyncStorage.setItem("userInfo", JSON.stringify(result.userInfo));
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeColor} />
      </View>
    );
  }

  const renderEventList = (events: any[]) => (
    <FlatList
      horizontal
      data={events}
      keyExtractor={(_, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 6 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DesignList", {
              eventId: item.eventId,
              name: item.name,
              callFrom: "Events",
            })
          }
          style={styles.eventCard}>
          <View style={{ width: 120, height: 120 }}>
            <Image
              source={{ uri: imageUrl + item.thumbnail + '?v=1' }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.eventText, { fontFamily: 'Poppins-Regular' }]} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  const renderTrendingList = (events: any[]) => (
    <FlatList
      horizontal
      data={events}
      keyExtractor={(_, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 6 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DesignList", {
              eventId: item.eventId,
              name: item.name,
              callFrom: "Trending",
            })
          }
          style={styles.eventCard}>
          <View style={{ width: 120, height: 120 }}>
            <Image
              source={{ uri: imageUrl + item.thumbnail + '?v=1' }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.eventText, { fontFamily: 'Poppins-Regular' }]} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  const renderGeneralList = (events: any[]) => (
    <FlatList
      horizontal
      data={events}
      keyExtractor={(_, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 6 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DesignList", {
              eventId: item.eventId,
              name: item.name,
              callFrom: "General",
            })
          }
          style={styles.eventCard}>
          <View style={{ width: 120, height: 120 }}>
            <Image
              source={{ uri: imageUrl + item.thumbnail + '?v=1' }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.eventText, { fontFamily: 'Poppins-Regular' }]} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  const CarouselItem = ({ item, animatedValue }: { item: any; animatedValue: any }) => {
    const rotateStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animatedValue.value,
        [-1, 0, 1],
        [0.85, 1, 0.85],
        Extrapolate.CLAMP
      );
      return {
        transform: [{ scale }],
      };
    });

    return (
      <Animated.View style={[styles.card, rotateStyle]}>
        <Image
          source={{
            uri: `${imageUrl}` + item.image,
          }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar backgroundColor={themeColor} barStyle={isDarkMode ? 'dark-content' : 'light-content'} />
      <Carousel
        width={windowWidth - 20}
        height={180}
        style={{ marginLeft: 10 }}
        data={banners}
        autoPlay={true}
        loop
        onProgressChange={progress}
        scrollAnimationDuration={1000}
        renderItem={({ item, animationValue }) => (
          <CarouselItem item={item} animatedValue={animationValue} />
        )}
      />
      <View style={styles.paginationContainer}>
        <Pagination.Basic
          progress={progress}
          data={banners}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          containerStyle={styles.paginationBasic}
          horizontal
          onPress={onPressPagination}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s Highlights</Text>
        {renderEventList(todayEvents)}
      </View>
      <View style={{ marginBottom: 10, }}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: 8 }]}>Coming Up Highlights</Text>
        <FlatList
          horizontal
          data={upcomingEvents}
          keyExtractor={(item) => item.date}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => {
            const dateObj = new Date(item.date);
            const formatted = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
            return (
              <TouchableOpacity
                onPress={() => setActiveDate(item.date)}
                style={[styles.dateChip, activeDate === item.date && styles.dateChipActive]}>
                <Text style={[styles.dateChipText, activeDate === item.date && { color: "#fff" }]}>
                  {formatted}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        <View style={{ paddingHorizontal: 8 }}>
          {renderEventList(
            upcomingEvents.find((i) => i.date === activeDate)?.events || []
          )}
        </View>

      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Highlights</Text>
        {renderTrendingList(trendingEvents)}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        {renderGeneralList(generalEvents)}
      </View>
    </ScrollView>
  );

}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.3)",
      borderRadius: 8,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: bgColor,
    },
    section: {
      paddingLeft: 8,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
      color: activeColor,
    },
    paginationContainer: {
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 10,
    },
    paginationBasic: {
      gap: 10,
    },
    dot: {
      width: 10,
      height: 4,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDot: {
      width: 20,
      height: 4,
      borderRadius: 4,
      backgroundColor: activeColor,
    },
    eventCard: {
      marginRight: 12,
      width: 120,
      alignItems: "center",
    },
    eventImage: {
      width: 120,
      height: 120,
      borderRadius: 10,
      marginBottom: 6,
      borderColor: 'gray',
      borderWidth: 1
    },
    eventText: {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
      color: "#ffffff",
      marginTop: 5
    },
    dateChip: {
      paddingVertical: 4,
      marginLeft: 8,
      paddingHorizontal: 13,
      borderRadius: 5,
      backgroundColor: "#f1f1f1",
      borderColor: themeColor,
      borderWidth: 1
    },
    dateChipActive: {
      backgroundColor: themeColor,
    },
    dateChipText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333",
    },
  });