import React, { useLayoutEffect, useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  useColorScheme,
  FlatList,
} from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { activeColor, apiUrl, bgColor, imageUrl, themeColor } from "../core/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import FastImage from "react-native-fast-image";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 10;

export default function DesignListScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation<any>();
  const searchdata: any = useRoute().params;
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [columns, setColumns] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  useLayoutEffect(() => {
    if (searchdata.name) {
      navigation.setOptions({ title: searchdata.name });
    }
  }, [navigation, searchdata.name]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}assetsList&callFrom=${searchdata.callFrom}&id=` + searchdata.eventId);
        console.log(`${apiUrl}assetsList&callFrom=${searchdata.callFrom}&id=` + searchdata.eventId)
        const result = await response.json();
        const images = result.images || [];
        const videos = result.videos || [];
        const videoItems = videos.map((item: any, index: number) => ({
          uri: imageUrl + (item.thumbnail || ""),
          type: "video",
          video: item.video || null,
          image_x: null,
          image_y: null,
          text_x: null,
          text_y: null
        }));
        let imageList = [];
        if(searchdata.callFrom == 'Greetings'){
          imageList = result.imagesList.map((item: any) => ({
            uri: imageUrl + item.thumbnail,
            type: "image",
            image_x: item.image_x,
            image_y: item.image_y,
            text_x: item.text_x,
            text_y: item.text_y
          }));
        }
        const imageItems = images.map((img: string) => ({
          uri: imageUrl + img,
          type: "image",
          image_x: null,
          image_y: null,
          text_x: null,
          text_y: null
        }));
        const finalList = [...videoItems, ...imageItems, ...imageList];

        setColumns(finalList);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  if (loading) {
        return <ActivityIndicator size="large" color={activeColor} />;
    }
  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar backgroundColor={themeColor} barStyle={isDarkMode ? 'dark-content' : 'light-content'} />

      <FlatList
        data={columns}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 5 }}
        renderItem={({ item }) => (
          <DesignItem item={item} navigation={navigation} searchdata={searchdata} />
        )}
      />
    </View>
  );
}
const DesignItem = ({ item, navigation, searchdata }: any) => {
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <View style={{ paddingHorizontal: 4, height: COLUMN_WIDTH, width: COLUMN_WIDTH }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate("DesignEdit", {
            image: item.uri,
            name: searchdata.name,
            type: item.type,
            image_x: item.image_x,
            image_y: item.image_y,
            text_x: item.text_x,
            text_y: item.text_y,
            video: item.video,
            callFrom:searchdata.callFrom
          });
        }}
      >

        {imgLoading && <View style={styles.loader}>
          <ActivityIndicator size="large" color={activeColor} />
          </View>}

        <FastImage
          source={{ uri: item.uri }}
          style={styles.image}
          resizeMode="cover"
          onLoadStart={() => setImgLoading(true)}
          onLoadEnd={() => setImgLoading(false)}
        />

        <Image source={require("../../assets/vip.png")} style={styles.vip} />

        {item.type === "video" && (
          <Image source={require("../../assets/video.png")} style={styles.videoIcon} />
        )}
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  loader: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    borderColor: activeColor,
  },

  vip: {
    width: 100,
    height: 100,
    position: "absolute",
    top: 0,
    left: 0,
  },

  videoIcon: {
    width: 150,
    height: 150,
    position: "absolute",
    bottom: 5,
    right: 5,
  },
  container: {
    padding: 5,
    backgroundColor: bgColor,
  },
  row: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginHorizontal: 4
  },
  image: {
    width: "100%",
    height: "100%",
    padding: 5
  },
});