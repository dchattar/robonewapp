import { useContext, useEffect, useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Platform, Linking, Alert, StatusBar, useColorScheme, Modal, Pressable, } from 'react-native';
import DeviceInfo from "react-native-device-info";
import { Avatar, Icon, IconButton } from "react-native-paper";
import { activeColor, apiUrl, bgColor, imageUrl, lightthemeColor, themeColor, whatsappNumber } from "../core/common";
import { AppContext } from "../core/AppContext";
import moment from 'moment';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNIap from 'react-native-iap';
import Toast from "react-native-toast-message";
const productId: any = ['visionayu.app.iosplan'];
export default function ProfileScreen({ navigation }: any) {
    const appVersion = DeviceInfo.getVersion();
    const [userInfo, setUserInfo] = useState<any>();
    const rating = { "rating": 4.5, "count": 87 };
    const [loadingLogout, setLoadingLogout] = useState(false);
    const isDarkMode = useColorScheme() === 'dark';
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [purchased, setPurchased] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const logoutUser = async () => {
        await AsyncStorage.clear();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };
    useEffect(() => {
        const loadData = async () => {
            try {
                const userInfoString = await AsyncStorage.getItem("userInfo");

                if (userInfoString) {
                    const userInfo = JSON.parse(userInfoString);
                    console.log("userInfo", userInfo)
                    setUserInfo(userInfo);
                }
            } catch (error) {
                console.error("Error loading user info:", error);
            }
        };

        loadData();
    }, []);
    const restorePurchase = async () => {
        setMessage('');
        setLoading(true);
        try {
            const restoredPurchases = await RNIap.getAvailablePurchases();
            const isRestored = restoredPurchases.some(p => p.productId === productId[0]);

            if (isRestored) {
                setPurchased(true);
                await AsyncStorage.setItem('isPremium', 'true');
                setMessage('✅ Purchase restored successfully');
            } else {
                setMessage('No previous purchase found to restore.');
            }
        } catch (err: any) {
            console.error('Restore purchase error:', err);
            setMessage(err.message || 'Restore failed');
        } finally {
            setLoading(false);
        }
    };
    const openWhatsApp = () => {
        const message = "Hi, ";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
        )}`;
        Linking.openURL(url).catch(() =>
            Alert.alert("Make sure WhatsApp is installed on your device")
        );
    };
    const getInitials = (name?: string) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        const first = parts[0]?.[0] || "";
        const second = parts[1]?.[0] || "";
        return (first + second).toUpperCase();
    };
    const renderStars = (ratingold: any) => {
        let rating = parseFloat(ratingold);
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Icon key={`full-${i}`} source="star" size={22} color="#f5c518" />);
        }
        if (halfStar) {
            stars.push(<Icon key="half" source="star-half-full" size={22} color="#f5c518" />);
        }
        while (stars.length < 5) {
            stars.push(<Icon key={`empty-${stars.length}`} source="star-outline" size={22} color="#f5c518" />);
        }
        return stars;
    };
    const handleDelete = async () => {
        setModalVisible(false);
        navigation.replace('Login');
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${apiUrl}deleteUser&token=${token}`);
            const data = await response.json();
            if (data.status === 'success') {
                Toast.show({
                    type: 'success',
                    text1: 'Will delete your account soon',
                });
                AsyncStorage.clear();
                navigation.navigate('Login');
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Logout failed',
                    text2: data.message,
                });
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong. Please try again.' });
        }
    };
    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <StatusBar backgroundColor={themeColor} barStyle={isDarkMode ? 'dark-content' : 'light-content'} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.section, { paddingTop: 4 }]}>
                    <View style={styles.sectionBody}>
                        <TouchableOpacity
                            onPress={() => { }}
                            style={styles.profile}>
                            <Avatar.Text size={60} label={getInitials(userInfo?.name)} style={styles.avatar} />
                            <View style={styles.profileBody}>
                                <Text style={styles.profileName}>{userInfo?.name}</Text>
                                <Text style={styles.profileHandle}>{userInfo?.mobile}</Text>
                            </View>
                            <View style={{ alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                <IconButton iconColor="white" icon="location-exit" size={30} onPress={() => logoutUser()} />
                                <Text style={{ marginTop: -10, color: 'white', fontWeight: 'bold', fontSize: 15 }}>Logout</Text>
                            </View>

                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.sectionBody}>
                        <View style={[styles.rowWrapper, styles.rowFirst]}>
                            <TouchableOpacity
                                onPress={() => { navigation.navigate('BusinessProfile') }}
                                style={styles.row}>
                                <Icon color={activeColor} size={24} source="store-settings"></Icon>
                                <Text style={styles.rowLabel}>Business Profile</Text>
                                <View style={styles.rowSpacer} />
                                <Text style={styles.rowValue}>{userInfo?.business?.name}</Text>
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rowWrapper, styles.rowFirst]}>
                            <TouchableOpacity
                                onPress={() => { navigation.navigate('BusinessProfile') }}
                                style={styles.row}>
                                <Icon color={activeColor} size={24} source="image-frame"></Icon>
                                <Text style={styles.rowLabel}>Frames</Text>
                                <View style={styles.rowSpacer} />
                                <Text style={styles.rowValue}>{userInfo?.business?.name}</Text>
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rowWrapper, styles.rowLast]}>
                            <View style={styles.row}>
                                <Icon color={activeColor} size={24} source="update"></Icon>
                                <Text style={styles.rowLabel}>Subscription Validity</Text>
                                <View style={styles.rowSpacer} />
                                <Text style={styles.rowValue}>{moment(userInfo?.validity).format('DD-MMM-YYYY')}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resources</Text>
                    <View style={styles.sectionBody}>
                        <View style={[styles.rowWrapper, styles.rowFirst]}>
                            <TouchableOpacity
                                onPress={() => { openWhatsApp() }}
                                style={styles.row}>
                                <Text style={styles.rowLabel}>Contact Us</Text>
                                <View style={styles.rowSpacer} />
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rowWrapper]}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("WebViewScreen", {
                                    url: `${imageUrl}/pages/about.html`,
                                    title: "About ITRA ROBO"
                                })}
                                style={styles.row}>
                                <Text style={styles.rowLabel}>How To Use App</Text>
                                <View style={styles.rowSpacer} />
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.rowWrapper, styles.rowLast]}>
                            <TouchableOpacity
                                onPress={() => {
                                    Linking.openURL("https://play.google.com/store/apps/details?id=org.itraindia.roboapp");
                                }}
                                style={styles.row}>
                                <Text style={styles.rowLabel}>Rate in Play Store</Text>
                                <View style={styles.rowSpacer} />
                                {rating && (
                                    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 8 }}>
                                        {renderStars(rating.rating)}
                                        <Text style={{ color: "#ffffff", marginLeft: 4 }}>({rating.count})</Text>
                                    </View>
                                )}
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Policies</Text>
                    <View style={styles.sectionBody}>
                        <View style={[styles.rowWrapper, styles.rowFirst]}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("WebViewScreen", {
                                    url: `${imageUrl}/pages/terms_app.html`,
                                    title: "Terms and Conditions"
                                })}
                                style={styles.row}>
                                <Text style={styles.rowLabel}>Terms and Conditions</Text>
                                <View style={styles.rowSpacer} />
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.rowWrapper]}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("WebViewScreen", {
                                    url: `${imageUrl}pages/refund_app.html`,
                                    title: "Refund/Cancellation Policy"
                                })}
                                style={styles.row}>
                                <Text style={styles.rowLabel}>Refund/Cancellation Policy</Text>
                                <View style={styles.rowSpacer} />
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.rowWrapper, styles.rowLast]}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("WebViewScreen", {
                                    url: `${imageUrl}/pages/policy_app.html`,
                                    title: "Privacy Policy"
                                })}
                                style={styles.row}>
                                <Text style={styles.rowLabel}>Privacy Policy</Text>
                                <View style={styles.rowSpacer} />
                                <Icon color="#ffffff" source="chevron-right" size={19} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <Text style={styles.contentFooter}>App Version {appVersion} | © 2026 ITRA PVT LTD</Text>
                </View>
                {Platform.OS === 'ios' && (
                    <View>
                        <TouchableOpacity onPress={restorePurchase}>
                            <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Restore Purchase</Text>
                        </TouchableOpacity>
                        <Text style={styles.deleteText} onPress={() => setModalVisible(true)}>
                            Delete Account
                        </Text>
                        <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalText}>Do you really want to delete your account?</Text>
                                    <View style={styles.buttonContainer}>
                                        <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                            <Text style={styles.buttonText}>Cancel</Text>
                                        </Pressable>
                                        <Pressable style={styles.deleteButton} onPress={handleDelete}>
                                            <Text style={styles.buttonText}>Delete</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                )}
            </ScrollView>
        </View>

    )
}
const styles = StyleSheet.create({
    deleteText: { color: 'red', fontSize: 18, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
        flex: 1,
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 5,
        flex: 1,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    gradient: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    avatar: {
        marginRight: 16,
        backgroundColor: themeColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
    },
    headerAction: {
        width: 40,
        height: 40,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: '600',
        color: '#000',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        textAlign: 'center',
    },
    content: {
        padding: 8,
    },
    contentFooter: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        color: '#ffffff',
    },
    section: {
        paddingVertical: 2,
    },
    sectionTitle: {
        margin: 8,
        fontSize: 13,
        letterSpacing: 0.33,
        fontWeight: '500',
        color: '#ffffff',
        textTransform: 'uppercase',
    },
    sectionBody: {
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    profile: {
        padding: 12,
        backgroundColor: lightthemeColor,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderColor: '#000',
        borderWidth: 2,
        borderRadius: 9999,
        marginRight: 12,
    },
    profileBody: {
        marginRight: 'auto',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    profileHandle: {
        marginTop: 2,
        fontSize: 16,
        fontWeight: '400',
        color: '#ffffff',
    },
    row: {
        height: 44,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingRight: 12,
    },
    rowWrapper: {
        paddingLeft: 16,
        backgroundColor: lightthemeColor,
        borderTopWidth: 1,
        borderColor: themeColor,
    },
    rowFirst: {
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    rowLabel: {
        fontSize: 16,
        marginLeft: 5,
        letterSpacing: 0.24,
        color: '#ffffff',
    },
    rowSpacer: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    rowValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        marginRight: 4,
    },
    rowLast: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },
    rowLabelLogout: {
        width: '100%',
        textAlign: 'center',
        fontWeight: '600',
        color: themeColor,
    },
});