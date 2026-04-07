import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Text, Icon, TextInput } from "react-native-paper";
import { launchImageLibrary } from "react-native-image-picker";
import { activeColor, apiUrl, bgColor, imageUrl, themeColor } from "../core/common";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BusinessProfile() {
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    try {
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (!userInfo) return;

      const { token: userToken } = JSON.parse(userInfo);
      setToken(userToken);

      const res = await fetch(`${apiUrl}businessInfo&token=${userToken}`);
      const result = await res.json();

      setProfile(result?.businessInfo || {});
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessProfile = async () => {
    if (!profile?.business_name) {
      return Alert.alert("Validation", "Business name is required");
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (profile?.logo && profile.logo.startsWith("file")) {
        const filename = profile.logo.split("/").pop();
        const ext = filename?.split(".").pop();
        formData.append("image", {
          uri: Platform.OS === "android" ? profile.logo : profile.logo.replace("file://", ""),
          name: filename || `logo.${ext}`,
          type: `image/${ext || "jpeg"}`,
        } as any);
      }

      formData.append("businessName", profile.business_name || "");
      formData.append("businessMobile", profile.business_mobile || "");
      formData.append("businessAddress", profile.business_address || "");
      formData.append("businessEmail", profile.business_email || "");
      formData.append("businessDetails", profile.business_details || "");
      formData.append("token", token);

      const res = await fetch(`${apiUrl}updateBusinessProfile`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result?.status === "success") {
        Alert.alert("Success", "Profile updated successfully ✅");
      } else {
        Alert.alert("Error", result?.message || "Update failed");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.7 },
      (res: any) => {
        if (res?.assets?.length > 0) {
          setProfile((prev: any) => ({
            ...prev,
            business_image: res.assets[0].uri,
          }));
        }
      }
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>Loading...</Text>
      </View>
    );
  }
  const getImageUri = () => {
    if (!profile?.business_image) return null;
    if (profile.business_image.startsWith("http") || profile.business_image.startsWith("file")) {
      return profile.business_image;
    }
    return imageUrl + profile.business_image;
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bgColor }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage}>
            {profile?.business_image ? (
              <Image source={{ uri: getImageUri() }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Icon source="camera" size={30} color="#aaa" />
              </View>
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.businessName}>
              {profile?.business_name || "Your Business"}
            </Text>
            <Text style={styles.subText}>Tap to change logo</Text>
          </View>
        </View>

        {/* 🔷 Inputs */}
        {renderInput("Business Name", profile.business_name, (t: any) =>
          setProfile((p: any) => ({ ...p, business_name: t }))
        )}

        {renderInput("Mobile", profile.business_mobile, (t: any) =>
          setProfile((p: any) => ({ ...p, business_mobile: t }))
        )}

        {renderInput("Email", profile.business_email, (t: any) =>
          setProfile((p: any) => ({ ...p, business_email: t }))
        )}

        {renderInput("Details", profile.business_details, (t: any) =>
          setProfile((p: any) => ({ ...p, business_details: t }))
        )}

        {renderInput("Address", profile.business_address, (t: any) =>
          setProfile((p: any) => ({ ...p, business_address: t }))
        )}
        <TouchableOpacity
          style={[
            styles.bottomBtn,
            submitting && { opacity: 0.6 } // 👈 disabled look
          ]}
          onPress={saveBusinessProfile}
          disabled={submitting} // 👈 prevent multiple clicks
        >
          <Text style={styles.btnText}>
            {submitting ? "Submitting... Please wait" : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* 🔷 Reusable Input */
const renderInput = (label: string, value: any, onChange: any, multiline = false) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      mode="outlined"
      multiline={multiline}
      textColor="#fff"
      outlineColor="#444"
      activeOutlineColor={activeColor}
      style={styles.input}
      onChangeText={onChange}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 120,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: bgColor
  },

  profileSection: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    marginBottom: 20,
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  logoPlaceholder: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  businessName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  subText: {
    fontSize: 12,
    color: "#888",
  },

  inputBlock: {
    marginBottom: 12,
  },

  label: {
    color: "#aaa",
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#1e1e1e",
  },

  bottomBtn: {
    backgroundColor: themeColor,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});