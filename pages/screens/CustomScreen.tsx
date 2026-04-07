import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";
import { bgColor } from "../core/common";
import { pick, types } from "@react-native-documents/picker";
import RNFS from 'react-native-fs';
import { useNavigation } from "@react-navigation/native";

export default function CustomScreen() {
   const navigation = useNavigation<any>();
  const selectFile = async (fileType: "image" | "video") => {
        try {
            const [file] = await pick({
                type: fileType === "image" ? [types.images] : [types.video],
            });

            if (file.size && file.size < 15 * 1024 * 1024) {
                console.log("file",file);
                let destPath = "";
                if(fileType != 'image'){
                  const fileName = `video_${Date.now()}.mp4`;
                  destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
                  await RNFS.copyFile(file.uri, destPath);
                  console.log('Stored video path:', destPath);
                }else{
                  destPath = file.uri
                }
                navigation.navigate("DesignEdit", {
                    image: destPath,
                    type: fileType,
                    callFrom:'Custom'
                });
            }
        } catch (err) {
            console.warn("Picker Error:", err);
        }
    };


  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.card} onPress={() => selectFile("image")}>
        <View style={styles.iconBox}>
          <Icon source="image-outline" size={28} color="#fff" />
        </View>

        <Text style={styles.title}>Photo Post</Text>
        <Text style={styles.subtitle}>Create design in few min.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => selectFile("video")}>
        <View style={[styles.iconBox, { backgroundColor: "#ff6b6b" }]}>
          <Icon source="video-outline" size={28} color="#fff" />
        </View>

        <Text style={styles.title}>Video Post</Text>
        <Text style={styles.subtitle}>Create design in few min.</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:bgColor,
  },

  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
    marginBottom: 18,
    elevation: 3,
    alignItems: "center",
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#4a6cf7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },
});