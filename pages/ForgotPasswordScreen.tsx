import { useState } from "react";
import { View, StyleSheet, Image, Linking, Alert } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { apiUrl, themeColor } from "./core/common";
import LinearGradient from "react-native-linear-gradient";

export default function ForgotPasswordScreen({ navigation }: any) {
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState<"email" | "reset">("email");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateMobile = (mobile: string) => /^[0-9]{10}$/.test(mobile);

    const validatePassword = (password: string) => {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return pattern.test(password);
    };
    const handleRequestOtp = async () => {
        if (!validateMobile(mobile)) {
            setErrors({ mobile: "Enter a valid mobile number" });
            return;
        }
        setErrors({});
        setLoading(true);

        try {
            const res = await fetch(`${apiUrl}forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile }),
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                setStep("reset");
            } else {
                setErrors({ general: data.message || "Failed to send OTP" });
            }
        } catch (err: any) {
            setErrors({ general: err.message || "Server error" });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const newErrors: any = {};
        if (!otp.trim()) newErrors.otp = "Enter OTP";
        if (!password.trim()) newErrors.password = "Enter new password";
        else if (!validatePassword(password))
            newErrors.password = "Password must be at least 6 characters, include uppercase, lowercase, number & special character";

        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const res = await fetch(`${apiUrl}reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, otp, password }),
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                Alert.alert("Success", "Password reset successful", [
                    { text: "OK", onPress: () => navigation.navigate("Login") },
                ]);
            } else {
                setErrors({ general: data.message || "Password reset failed" });
            }
        } catch (err: any) {
            setErrors({ general: err.message || "Server error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.scrollContainer}>
                <Image source={require("../assets/icon.png")} style={styles.logo} />
                <Text variant="headlineMedium" style={styles.title}>
                    Forgot Password
                </Text>

                {step === "email" ? (
                    <>
                        <TextInput
                            label="Mobile"
                            value={mobile}
                            mode="outlined"
                            onChangeText={setMobile}
                            keyboardType="numeric"
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="phone" />}
                        />
                        <Text style={styles.errorText}>{errors.mobile}</Text>
                        <LinearGradient
                            colors={['#0e3c81ff', '#5183d2ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.registerButtonGradient}
                        >
                            <Button
                                mode="text"
                                onPress={handleRequestOtp}
                                loading={loading}
                                contentStyle={{ height: 50 }} // fill the gradient
                                labelStyle={{ color: 'white', fontSize: 18 }}
                                style={{ backgroundColor: 'transparent' }} // important for gradient
                            >
                                Send OTP
                            </Button>
                        </LinearGradient>
                    </>
                ) : (
                    <>
                        <TextInput
                            label="Enter OTP"
                            value={otp}
                            mode="outlined"
                            onChangeText={setOtp}
                            keyboardType="numeric"
                        />
                        <Text style={styles.errorText}>{errors.otp}</Text>

                        <TextInput
                            label="New Password"
                            value={password}
                            mode="outlined"
                            onChangeText={setPassword}
                            secureTextEntry
                            left={<TextInput.Icon icon="lock" />}
                        />
                        <Text style={styles.errorText}>{errors.password}</Text>

                        <TextInput
                            label="Confirm Password"
                            value={confirmPassword}
                            mode="outlined"
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            left={<TextInput.Icon icon="lock-check" />}
                        />
                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>

                        <LinearGradient
                            colors={['#0e3c81ff', '#5183d2ff']} // gradient colors
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.registerButtonGradient}
                        >
                            <Button
                                mode="text"
                                onPress={handleResetPassword}
                                loading={loading}
                                contentStyle={{ height: 50 }} // makes the button fill the gradient
                                labelStyle={{ color: 'white', fontSize: 18 }}
                                style={{ backgroundColor: 'transparent' }} // important for gradient effect
                            >
                                Reset Password
                            </Button>
                        </LinearGradient>
                    </>
                )}

                <Text style={styles.errorText}>{errors.general}</Text>
                <Button onPress={() => navigation.goBack()} style={styles.registerLink}>
                    <Text style={styles.registerText}>Back To Login</Text>
                </Button>
            </View>
            <Button
                mode="text"
                onPress={() => {
                    const url = `https://wa.me/918482947301?text=${encodeURIComponent(
                        "Hello, I need support with my BrandBook account."
                    )}`;
                    Linking.openURL(url).catch(() => {
                        Alert.alert("Make sure WhatsApp is installed");
                    });
                }}
                style={styles.supportBtn}
            >
               For assistance, WhatsApp us at 8482947301
            </Button>

            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 BrandBook</Text>
                <Text style={styles.footerText}>Design & Developed by SparkBit Technologies</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 16 },
    logo: { width: 100, height: 100, alignSelf: "center", marginBottom: 20 },
    container: { flex: 1, backgroundColor: "white", justifyContent: "center" },
    title: { textAlign: "center", marginBottom: 20, color: "black" },
    button: { marginTop: 12, backgroundColor: themeColor },
    errorText: { color: "red", marginTop: 4, fontSize: 14 },
    supportBtn: { marginTop: 20 },
    footer: { alignItems: "center", paddingVertical: 8, backgroundColor: "#f8f8f8" },
    footerText: { fontSize: 12, textAlign: "center", color: "#888" },
    registerLink: { marginTop: 10 },
    registerText: { color: themeColor, fontSize: 18 },
    loginButton: { marginTop: 10, borderRadius: 8, backgroundColor: "#e94e3c", paddingVertical: 6 },
    registerButtonGradient: {
        borderRadius: 8,
        overflow: 'hidden', // Important for rounded corners
        marginTop: 10,
    },
});