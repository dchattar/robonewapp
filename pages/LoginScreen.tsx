import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { activeColor, apiUrl, bgColor } from "./core/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen({ navigation }: any) { 
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpSent, setOtpSent] = useState(false);
  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      setErrors({ general: "Enter valid 10 digit mobile number" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setOtpSent(true);
        setErrors({});
        setErrors({ general: data.message });
      } else {
        setErrors({ general: data.message });
      }
    } catch (err) {
      setErrors({ general: "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrors({ general: "Please enter OTP" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}verifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await response.json();
      if (data.status === "success") {
        await AsyncStorage.setItem("userInfo", JSON.stringify(data.userInfo));
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      } else {
        setErrors({ general: data.message });
      }
    } catch (err) {
      setErrors({ general: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
      <KeyboardAvoidingView
        style={{ flex: 1,backgroundColor:bgColor}}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image source={require("../assets/icon.png")} style={styles.logo} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>
            <TextInput
              placeholder="Mobile"
              placeholderTextColor="#ffffff"
              style={[styles.input, { color: '#ffffff' }]}
              value={mobile}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length <= 10) setMobile(cleaned);
              }}
              keyboardType="number-pad"
              autoCapitalize="none"
              editable={!otpSent}
            />
            {otpSent && (
              <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#ffffff"
                style={[styles.input, { color: '#ffffff' }]}
                value={otp}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  if (cleaned.length <= 6) setOtp(cleaned);
                }}
                keyboardType="number-pad"
              />
            )}
            <Text style={{color:activeColor}}>{errors.general}</Text>
            {!otpSent ? (
              <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                <Text style={styles.buttonText}>
                  {loading ? "Sending..." : "Send OTP"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
                <Text style={styles.buttonText}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Text>
              </TouchableOpacity>
            )}
            {otpSent && (
              <TouchableOpacity onPress={handleSendOtp}>
                <Text style={styles.link}>Resend OTP</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation?.navigate("Register")}>
              <Text style={styles.link}>Don’t have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.contentFooter}>For Assistance Please contact +91 7410747201</Text>
        </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contentFooter: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom:10
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 5,
  },
  logo: { width: 150, height: 150, alignSelf: "center", marginBottom: 20 },
  card: {
    borderRadius: 10,
    padding: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color:'white'
  },
  subtitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
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