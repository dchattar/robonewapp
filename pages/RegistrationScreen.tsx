import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
  useColorScheme,
} from "react-native";
import { activeColor, apiUrl, bgColor, themeColor } from "./core/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-paper-dropdown";
import { PaperProvider } from "react-native-paper";

export default function RegisterScreen({ navigation }: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState<any>("");
  const [cityList, setCityList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}cityList`);
        const result = await response.json();
        setCityList(result);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  const handleRegister = async () => {
    const newErrors: any = {};

    if (!name.trim()) newErrors.name = "Name is required";
    else if (!/^[a-zA-Z ]+$/.test(name)) newErrors.name = "Name can only contain letters";

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }
    if (!email.trim()) newErrors.email = "Email Id is required";
    if (!city.trim()) newErrors.city = "City is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, city }),
      });

      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        await AsyncStorage.setItem("userInfo", JSON.stringify(data.userInfo));
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      }
      else {
        setErrors({ general: data.message || "Registration failed" });
      }
    } catch (err: any) {
      setErrors({ general: err.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };
  const renderError = (field: string) =>
    errors[field as keyof typeof errors] ? (
      <>{errors[field as keyof typeof errors]}</>
    ) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bgColor }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PaperProvider>
        <StatusBar backgroundColor={themeColor} barStyle={isDarkMode ? 'dark-content' : 'light-content'} />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Image source={require("../assets/icon.png")} style={styles.logo} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
            <View style={{ flex: 1, marginBottom: 5 }}>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#ffffff"
                style={[styles.input, { color: '#ffffff' }]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors({ ...errors, name: "" });
                }}
              />
              <Text style={styles.errorText}>{renderError("name")}</Text>
            </View>
            <View style={{ flex: 1, marginBottom: 5 }}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#ffffff"
                style={[styles.input, { color: '#ffffff' }]}
                value={email}
                onChangeText={(text) => {
                  const cleanedText = text.trimEnd();
                  setEmail(cleanedText);
                  setErrors({ ...errors, email: "" });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.errorText}>{renderError("email")}</Text>
            </View>
            <View style={{ flex: 1, marginBottom: 5 }}>
              <TextInput
                placeholder="Mobile"
                placeholderTextColor="#ffffff"
                style={[styles.input, { color: '#ffffff' }]}
                value={mobile}
                onChangeText={(text) => {
                  const cleanedText = text.trimEnd();
                  setMobile(cleanedText);
                  setErrors({ ...errors, mobile: "" });
                }}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <Text style={styles.errorText}>{renderError("mobile")}</Text>
            </View>

            <View style={{ flex: 1, marginBottom: 5 }}>
              <Dropdown
                mode="outlined"
                placeholder="Select City"
                options={cityList}
                value={city}
                onSelect={setCity}
                CustomDropdownInput={(props) => {
                  const selectedItem = cityList.find(
                    (item:any) => item.value === city
                  );
                  return (
                    <TextInput
                      {...props}
                      value={selectedItem ? selectedItem.label : ""}
                      style={[styles.input, { color: "#fff" }]}
                      placeholderTextColor="#ffffff"
                    />
                  );
                }}
              />
              <Text style={styles.errorText}>{renderError("city")}</Text>
            </View>
            <Text style={{ color: activeColor }}>{errors.general}</Text>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation?.navigate("Login")}>
              <Text style={styles.link}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.contentFooter}>For Assistance Please contact +91 7410747201</Text>
        </View>
      </PaperProvider>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  errorText: { color: activeColor, fontSize: 12, height: 15 },
  contentFooter: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 10
  },
  logo: { width: 150, height: 150, alignSelf: "center", marginBottom: 20 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 5,
  },
  card: {
    borderRadius: 10,
    padding: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: 'white',
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
});
