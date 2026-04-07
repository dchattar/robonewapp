import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { apiUrl, bgColor, imageUrl, themeColor } from "../core/common";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 50) / 3;

export default function BusinessScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}businessDesignList&token=`);
        const result = await response.json();
        console.log("result",result)
        setTodayEvents(result);
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

  const EventCard: React.FC<any> = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("DesignList", {
          eventId: item.eventId,
          name: item.name,
          callFrom: "Business",
        })
      }
      style={styles.eventCard}>
      <Image source={{ uri: imageUrl + item.thumbnail }} style={styles.eventImage} resizeMode="cover" />
      <Text style={styles.eventText} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <FlatList
          data={todayEvents}
          numColumns={3}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <EventCard item={item} />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:bgColor,
    paddingHorizontal: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingVertical: 6,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  eventCard: {
    width: COLUMN_WIDTH,
    alignItems: "center",
  },
  eventImage: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "gray",
  },
  eventText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#ffffff",
  },
});
