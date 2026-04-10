import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, Dimensions, ActivityIndicator, Alert, Linking, Pressable, TextInput, Image } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { apiUrl, bgColor, imageUrl, merchantId, themeColor } from "../core/common";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
const { width } = Dimensions.get('window');
import RazorpayCheckout from "react-native-razorpay";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SubscriptionScreen() {
    const [plansList, setPlans] = useState<any[]>([]);
    const [userInfo, setUserInfo] = useState<any>();
    const navigation = useNavigation<any>();
    const BANNER_RATIO = 9 / 16;
    const ref = React.useRef<ICarouselInstance>(null);
    const progress = useSharedValue<number>(0);
    const [progressStatus, setProgressStatus] = useState("");
    useEffect(() => {
        const loadData = async () => {
            try {
                const userInfoString = await AsyncStorage.getItem("userInfo");
                if (userInfoString) {
                    const userInfo = JSON.parse(userInfoString);
                    setUserInfo(userInfo);
                }
            } catch (error) {
                console.error("Error loading user info:", error);
            }
        };

        loadData();
        const fetchPlans = async () => {
            try {
                const response = await fetch(`${apiUrl}planList`);
                const data = await response.json();
                console.log("data", data)
                setPlans(data);
            } catch (e) {
                console.error("Plans fetch error", e);
            }
        };

        fetchPlans();
    }, []);

    if (plansList.length == 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={themeColor} />
            </View>
        );
    }
    const handleBuyNow = async (item: any) => {
        let amountFinal = (item.amount * 1)
        const response = await fetch(`${apiUrl}createOrderRazorpay`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `amount=${Number(amountFinal)}`,
        });
        const order = await response.json();
        let options = {
            description: "Subscription for ITRA ROBO",
            image: "https://roboapp.itraindia.org/assets/icon.png",
            currency: "INR",
            key: "rzp_live_SSGJyJgWNtQvH6",
            amount: Number(amountFinal) * 100,
            name: "ITRA ROBO",
            prefill: {
                email: userInfo?.email,
                contact: userInfo?.mobile,
                name: userInfo?.name,
            },
            theme: { color: "#316FF6" },
            order_id: order.id,
        };

        RazorpayCheckout.open(options).then(async (data) => {
            Toast.show({
                type: "success",
                position: "top",
                text1: "Payment Success",
                text2: `Payment ID: ${data.razorpay_payment_id}`,
            });
            setProgressStatus("Payment Processing...");

            try {
                const response = await fetch(`${apiUrl}savePayment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token: userInfo.token,
                        planId: item.planId,
                        amount: amountFinal,
                        paymentId: data.razorpay_payment_id
                    }),
                });

                const result = await response.json();
                if (response.ok && result.status === "success") {
                    if (result.userInfo) {
                        await AsyncStorage.removeItem("userInfo");
                        await AsyncStorage.setItem("userInfo", JSON.stringify(result.userInfo));
                    }
                    Alert.alert("Success", "Subscription Plan Activated Successfully");
                    navigation.dispatch(
                        CommonActions.reset({ index: 0, routes: [{ name: "Main" }] })
                    );
                } else {
                    Alert.alert("Error", result.message || "Something went wrong updating subscription.");
                }
            } catch (error) {
                Alert.alert(
                    "Network Error",
                    "Could not update subscription. Please try again."
                );
            } finally {
                setProgressStatus("");
            }
        })
            .catch((error) => {
                setProgressStatus("");
                Toast.show({
                    type: "error",
                    position: "top",
                    text1: "Payment Failed",
                    text2: error?.description || "An error occurred",
                });
            });
    };
    return (
        <View style={styles.container}>
            <Carousel
                width={width}
                height={width * 1.8}
                data={plansList}
                loop
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.8,
                    parallaxAdjacentItemScale: 0.8,
                    parallaxScrollingOffset: 80 // 🔥 gap = peek visible
                }}

                style={{
                    alignSelf: 'center' // center align carousel
                }}

                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleBuyNow(item)}>
                        <Image
                            source={{ uri: imageUrl + item.image }}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 20,
                            }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: bgColor,
    },
    gradientBorder: {
        borderRadius: 8,
        padding: 1,
    },
    cardInner: {
        borderRadius: 7,
        minHeight: 100,
        borderWidth: 0.5,
        borderColor: themeColor,
        justifyContent: 'center',
        backgroundColor: '#fff',
        overflow: 'hidden'
    },
    bestBadge: {
        backgroundColor: '#1E3C72',
        zIndex: 10,
        padding: 5
    },
    bestText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    titleRow: {
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    planPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: themeColor,
    },
    featureText: {
        fontSize: 14,
        color: '#1d54a5',
        fontWeight: '600',
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 5,
    },
    optionBox: {
        width: '24%',
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 10,
        paddingVertical: 4,
        alignItems: 'center',
        marginBottom: 1,
    },
    optionLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    optionPrice: {
        fontSize: 12,
    },
    ctaWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 5,
        backgroundColor: '#fff',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    ctaTouchable: {
        width: '100%',
    },
    ctaButton: {
        width: '100%',
        height: 45,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        fontWeight: '800',
        fontSize: 16,
        color: '#fff',
    },
    offerText: {
        marginBottom: 5,
        fontSize: 14,
        color: 'green',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
    },
    closeText: {
        color: '#000',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 8,
    },

    // Plan Card
    planCard: {
        backgroundColor: "#ffffff",
        borderRadius: 15,
        padding: 18,
        borderWidth: 1,
        borderColor: "#eaeaea",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    label: { fontSize: 14, color: "#555", marginTop: 8 },
    value: { fontSize: 18, fontWeight: "bold", color: "#000" },

    priceDetails: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: "#ddd" },
    row: { fontSize: 14, color: "#444", marginTop: 3 },
    strike: { textDecorationLine: 'line-through', color: "#888" },
    total: { fontSize: 16, fontWeight: "bold", color: "#28a745", marginTop: 5 },
    benefitItem: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    benefitText: { marginLeft: 6, fontSize: 15, color: "#444" },
    couponBox: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    couponInput: { flex: 1, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, height: 45, borderWidth: 1, borderColor: "#ddd" },
    applyButton: {
        backgroundColor: "#007aff",
        marginLeft: 8,
        paddingHorizontal: 18,
        height: 45,
        justifyContent: "center",
        borderRadius: 8,
    },
    applyButtonText: { color: "#fff", fontWeight: "600" },

    // Secure Badge
    secureBox: { flexDirection: "row", justifyContent: "center", marginTop: 5 },
    secureText: { marginLeft: 6, color: "#007aff", fontWeight: "600" },

    // Pay Button Fixed
    payButton: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#28a745",
        paddingVertical: 15,
        alignItems: "center",
        elevation: 10,
    },
    payButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center", width: "75%" },
    processingText: { marginTop: 10, fontSize: 16, fontWeight: "bold" },
});
