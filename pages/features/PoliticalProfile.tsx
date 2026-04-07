import React, { useEffect, useState } from "react";
import { 
  View, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform, TextInput as RNInput 
} from "react-native";
import { Button, Text, HelperText, Icon, TextInput } from "react-native-paper";
import { launchImageLibrary } from "react-native-image-picker";
import { apiUrl, themeColor } from "../core/common";

export default function PoliticalProfile() {
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBusinessProfile = async () => {
      try {
        const userInfo = "" //await AsyncStorage.getItem("userInfo");
        if (!userInfo) {
          setLoading(false);
          return;
        }
        const { token: userToken } = JSON.parse(userInfo);
        setToken(userToken);

        const response = await fetch(`${apiUrl}framesList&token=${userToken}`);
        const result = await response.json();

        if (result && result.business) {
          setProfile(result.business);
        } else {
          setProfile({});
        }
      } catch (err) {
        console.log("Error loading business profile:", err);
        setProfile({});
      } finally {
        setLoading(false);
      }
    };

    loadBusinessProfile();
  }, []);

  const saveBusinessProfile = async () => {
    try {
      const formData = new FormData();
      if (profile?.logo) {
        const filename = profile?.logo.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("logo", {
          uri: Platform.OS === "android" ? profile?.logo : profile?.logo.replace("file://", ""),
          name: filename,
          type,
        } as any);
      }
      formData.append("businessName", profile?.name);
      formData.append("businessMobile", profile?.mobile);
      formData.append("businessAddress", profile?.address);
      formData.append("businessEmail", profile?.email);
      formData.append("businessSlogan", profile?.slogan);
      formData.append("businessCategory", profile?.category);
      formData.append("token", token);
      formData.append("timestamp", new Date().toISOString());

      const response = await fetch(`${apiUrl}updateBusinessProfile`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        console.log("Server error:", result);
        Alert.alert("Error", result.message || "Failed to update profile on server");
      } else {
        if (result.status === "success") {
          //await AsyncStorage.setItem("businessProfile", JSON.stringify(profile));
          Alert.alert("Success", "Business profile updated successfully ✅");
        } else {
          Alert.alert("Error", result.message || "Failed to update profile on server");
        }
      }
    } catch (err) {
      console.log("Error saving profile:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.7, selectionLimit: 1 },
      (response:any) => {
        if (response.assets && response.assets.length > 0) {
          setProfile((prev:any) => ({ ...prev, logo: response.assets[0].uri || null }));
        }
      }
    );
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.logoContainer} onPress={pickImage}>
          {profile?.logo ? (
            <Image source={{ uri: profile?.logo }} style={{ width: 100, height: 100, borderRadius: 5 }} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Icon size={50} source="camera" />
            </View>
          )}
        </TouchableOpacity>
        <HelperText type="info" style={{ textAlign: "center" }}>Tap to upload logo</HelperText>
        <TextInput style={{ backgroundColor: 'white' }} label="Name" value={profile?.name} mode="outlined" autoCapitalize="words"
          onChangeText={(text) => { setProfile((p:any) => ({ ...p, name: text })) }}
          left={<TextInput.Icon icon="domain" />}
        />
        <TextInput mode="outlined" autoCapitalize="none" keyboardType="number-pad" style={{ backgroundColor: 'white',marginTop:5 }} label="Mobile" value={profile?.mobile}
          onChangeText={(text) => { setProfile((p:any) => ({ ...p, mobile: text })) }}
          left={<TextInput.Icon icon="cellphone" />}
        />
        <TextInput mode="outlined" autoCapitalize="none" style={{ backgroundColor: 'white',marginTop:5 }} label="Email" value={profile?.email}
          onChangeText={(text) => { setProfile((p:any) => ({ ...p, email: text })) }}
          left={<TextInput.Icon icon="email-outline" />}
        />
        <TextInput mode="outlined" autoCapitalize="none" style={{ backgroundColor: 'white',marginTop:5 }} label="Slogan / Tagline" value={profile?.slogan}
          onChangeText={(text) => { setProfile((p:any) => ({ ...p, slogan: text })) }}
          left={<TextInput.Icon icon="tag-text-outline" />}
        />
        <TextInput mode="outlined" autoCapitalize="none" style={{ backgroundColor: 'white',marginTop:5 }} label="Party" value={profile?.category}
          onChangeText={(text) => { setProfile((p:any) => ({ ...p, category: text })) }}
          left={<TextInput.Icon icon="storefront-outline" />}
        />
        <TextInput mode="outlined" autoCapitalize="none" style={{ backgroundColor: 'white',marginTop:5 }} label="Address" value={profile?.address}
          onChangeText={(text) => { setProfile((p:any) => ({ ...p, address: text })) }}
          left={<TextInput.Icon icon="map-marker-radius-outline" />}
        />
      </ScrollView>
      <Button mode="contained" buttonColor={themeColor} style={styles.saveButton} onPress={saveBusinessProfile}>
        UPDATE BUSINESS DETAILS
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  logoContainer: {
    alignSelf: "center",
    marginBottom: 10,
  },
  logoPlaceholder: {
    width: 100, height: 100, borderColor: "gray", borderWidth: 1,
    borderRadius: 5, alignItems: "center", justifyContent: "center"
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#444",
  },
  nativeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 16
  },
  saveButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    margin: 5,
    paddingVertical: 5,
    borderRadius: 5,
  },
});