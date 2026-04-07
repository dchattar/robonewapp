import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, FlatList, Image } from "react-native";
import { apiUrl, imageUrl } from "../core/common";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { Icon } from "react-native-paper";


export default function GreetingsListScreen({ route }: any) {
  const { category } = route.params;
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [imagesList, setImagesList] = useState<any[]>([]);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}greetingsList&category=${category}`);
        const result = await response.json();
        console.log("result",result);
        setImagesList(result);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  const EventCard: React.FC<any> = ({ item, navigation, imageUrl }) => {
    const [loading, setLoading] = useState(true);

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("GreetingEdit", {
            image: item.image.replace(imageUrl, ""),
            name: item.name_marathi,
            accessType: "Greetings",
          })
        }
        style={styles.eventCard}
      >
        <View>
          <Image
            source={{ uri: imageUrl + item.image }}
            style={styles.eventImage}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color="#007bff" />
            </View>
          )}
        </View>

        <Text style={styles.eventText} numberOfLines={2}>
          {item.name_marathi}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View>
      <FlatList
        data={imagesList}
        numColumns={2}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item }) => (
          <EventCard item={item} navigation={navigation} imageUrl={imageUrl} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    flex: 1,                 // row मध्ये equal जागा घेईल
    marginHorizontal: 8,               // spacing
    alignItems: "center",
  },
  eventImage: {
    width: "100%",           // parent flex नुसार width घेईल
    aspectRatio: 1,          // square ठेवण्यासाठी
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
  },
  eventText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    color: "#444",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
  },
});