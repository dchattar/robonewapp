import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert, Platform, Text, Linking, PanResponder, TouchableWithoutFeedback, Pressable } from "react-native";
import RNFS from "react-native-fs";
import ViewShot from "react-native-view-shot";
import { activeColor, apiUrl, bgColor, imageUrl } from "../core/common";
import { ActivityIndicator, Button, Icon, PaperProvider, Portal } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import Share from "react-native-share";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import ImagePicker from 'react-native-image-crop-picker';
import { TextEditModal } from "./components/TextEditModal";
import FontSelectorModal from "./components/FontSelectorModal";
import Video from "react-native-video";
import { Gesture, GestureDetector, PanGestureHandler, ScrollView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
const screenWidth = Dimensions.get("window").width;
import { pick, types } from '@react-native-documents/picker';
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from "react-native-fast-image";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

export default function DesignEditScreen() {
    const navigation = useNavigation<any>();
    const route: any = useRoute();
    const searchdata = route.params;
    const [visible, setVisible] = useState(false);
    const viewShotRef = useRef<any>(null);
    const [selectedFrame, setSelectedFrame] = useState<any>();
    const [imageHeight, setImageHeight] = useState(screenWidth);
    const [frames, setFrames] = useState<any[]>([]);
    const [validity, setValidity] = useState<any>(null);
    const [planType, setPlanType] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFont, setSelectedFont] = useState("Roboto");
    const [logoVisible, setLogoVisible] = useState(true);
    const [frameVisible, setFrameVisible] = useState(true);
    const [watermark, setWatermark] = useState("Yes");
    const [elements, setElements] = useState<any[]>([]);
    const [activeId, setActiveId] = useState<any>(null);
    const [businessData, setBusinessData] = useState<any>();
    const [editData, setEditData] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [hideMedia, setHideMedia] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const actions = [
        { label: "Add Text", icon: "format-text", action: () => handleAction(), color: "#FF5733" },
        { label: "Add Image", icon: "image", action: () => handleImagesAction(), color: "#FF9733" },
        { label: "Choose Font", icon: "format-font", action: () => setVisible(true), color: "#4285F4" },
        { label: "Logo", icon: logoVisible ? "alpha-a-circle-outline" : "alpha-a-circle", action: () => setLogoVisible(!logoVisible), color: "#F4B400" },
        { label: "Frame", icon: frameVisible ? "image-frame" : "image-filter-frames", action: () => setFrameVisible(!frameVisible), color: "#00ACC1" },
    ];
    const restrictedTypes = ['Business', 'Custom', 'Greetings'];

    useLayoutEffect(() => {
        navigation.setOptions({
            title: searchdata?.name ?? "Design",
            headerRight: () => (<Button icon="file-download-outline" mode="outlined" textColor="white" onPress={captureImage} style={{ borderColor: "white", height: 32, justifyContent: "center" }} labelStyle={{ fontSize: 14, textTransform: "none", lineHeight: 13 }} contentStyle={{ height: 32, alignItems: "center" }}> Download </Button>),
        });
    }, [navigation, validity]);

    useEffect(() => {
        const uri = searchdata.image || (imageUrl + searchdata.image);
        Image.getSize(uri, (w, h) => setImageHeight((screenWidth * h) / w), () => setImageHeight(300));
        fetchFrames();
    }, []);

    const fetchFrames = async () => {
        try {
            const userInfo: any = await AsyncStorage.getItem("userInfo");
            if (!userInfo) return;
            const data = JSON.parse(userInfo);
            const response = await fetch(`${apiUrl}framesList&token=${data.token}`);
            const result = await response.json();
            setValidity(result.validity);
            setPlanType(result.planStatus);
            setWatermark(result.watermark);
            setFrames(result.frames ?? []);
            setSelectedFrame(result.frames[0]);
            setBusinessData(result.businessInfo);
        } catch (e) {
            console.log("Frame fetch error", e);
        }
    };
    const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const captureImage = async () => {
        if (!isPlanValid()) return;
        if (!hasAccess()) return;
        try {
            if (searchdata.type === 'image') {
                await handleImageCapture();
            } else {
                await handleVideoProcess();
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };
    const isPlanValid = () => {
        const expiry = moment(validity, "YYYY-MM-DD");
        if (!expiry.isValid() || expiry.isBefore(moment(), "day")) {
            Alert.alert(
                "Validity Expired",
                "Your plan has expired. Please renew to continue.",
                [{ text: "OK" }],
                { cancelable: false }
            );
            return false;
        }
        return true;
    };
    const hasAccess = () => {
        if (planType === 'Demo' && restrictedTypes.includes(searchdata.callFrom)) {
            Alert.alert(
                "Access Denied",
                "You have not subscribed yet. Please subscribe to enjoy unlimited access.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Subscribe", onPress: () => navigation.navigate("SubscriptionScreen") }
                ]
            );
            return false;
        }
        return true;
    };
    const handleImageCapture = async () => {
        setIsCapturing(true);
        const uri = await viewShotRef.current?.capture();
        if (!uri) return;
        await CameraRoll.save(uri, { type: 'photo' });
        setIsCapturing(false);
        Alert.alert("Saved", "Image saved to Gallery", [
            {
                text: "Share",
                onPress: () =>
                    Share.open({
                        url: uri,
                        type: "image/jpeg",
                        failOnCancel: false,
                    }),
            },
            { text: "OK" },
        ]);
    };
    const handleVideoProcess = async () => {
        try {
            setHideMedia(true);
            await delay(100);
            const uri = await viewShotRef.current?.capture();
            if (!uri) return;
            setHideMedia(false);
            setDownloading(true);
            setProgress(0);
            setStatus("Preparing your video...");
            const fileUrl = await uploadOverlay(uri);
            const localPath = await downloadVideo(fileUrl);
            await saveVideoToGallery(localPath);
        } catch (e) {
            console.log(e);
            setStatus("Something went wrong ❌");
        } finally {
            setDownloading(false);
        }
    };

    const uploadOverlay = async (uri: string) => {
        const formData = new FormData();
        formData.append("overlay", { uri, name: "overlay.png", type: "image/png" } as any);
        formData.append("frame", selectedFrame.frame);
        formData.append("videoId", searchdata.video);
        const response = await fetch(`${apiUrl}downloadVideo`, {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        const result = await response.json();
        if (result.status !== "success") {
            throw new Error(result.message);
        }
        return imageUrl + "exported_videos/" + result.output_file;
    };
    const downloadVideo = async (fileUrl: string) => {
        setStatus("Downloading...");
        const localPath = `${RNFS.DownloadDirectoryPath}/video_${Date.now()}.mp4`;
        const download = RNFS.downloadFile({
            fromUrl: fileUrl,
            toFile: localPath,
            progress: (res) => {
                const percent = res.contentLength
                    ? (res.bytesWritten / res.contentLength) * 100
                    : 0;
                setProgress(Math.floor(percent));
            },
            progressDivider: 1,
        });

        const result = await download.promise;

        if (result.statusCode !== 200) {
            throw new Error("Download failed");
        }

        setStatus("Saving to gallery...");

        return localPath;
    };

    const saveVideoToGallery = async (localPath: string) => {
        const fileUri = Platform.OS === "android" ? "file://" + localPath : localPath;
        await CameraRoll.save(fileUri, { type: "video" });
        setStatus("Completed ✅");
        Alert.alert("Saved", "Video saved to Gallery", [
            {
                text: "Share",
                onPress: () =>
                    Share.open({
                        url: fileUri,
                        type: "video/mp4",
                        failOnCancel: false,
                    }),
            },
            { text: "OK" },
        ]);
    };

    const handleSaveText = (newTextItem: any) => {
        if (editData) {
            setElements((prev: any) => prev.map((t: any) => (t.id === newTextItem.id ? newTextItem : t)));
        } else {
            setElements((prev: any) => [...prev, newTextItem]);
        }
    };

    const handleAction = () => {
        setEditData(null);
        setModalVisible(true);
    };
    const handleImagesAction = async () => {
        try {
            const image: any = await ImagePicker.openPicker({
                cropping: true,
                cropperCircleOverlay: false,
                freeStyleCropEnabled: true,
                showCropFrame: true,
            });
            if (image.size && image.size > 5 * 1024 * 1024) {
                Toast.show({
                    type: 'error',
                    text1: 'File too large',
                    text2: 'File size should be less than 5MB',
                });
                return;
            }
            const newImage = {
                id: Date.now(),
                type: "image",
                path: image.path,
                width: image.width,
                height: image.height,
                translateX: 50,
                translateY: 50,
                scale: 1,
                flipX: 1,
                flipY: 1,
            };
            setElements((prev) => [...prev, newImage]);
        } catch (err: any) {
            if (err.isCancel) {
                console.log('User canceled the picker');
            } else {
                console.error('Error picking document:', err);
            }
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditData(null);
    };

    const DefaultFrameOverlay = ({ selectedFrame }: { selectedFrame: any }) => {
        if (!selectedFrame || selectedFrame.type !== 'default') return null;

        return (
            <View style={{ position: 'absolute', width: '100%', height: "100%" }}>
                <Text
                    style={{
                        position: 'absolute', width: '100%',
                        color: selectedFrame.name.color || 'white',
                        left: `${parseInt(selectedFrame?.name.left)}%`,
                        top: `${parseInt(selectedFrame?.name.top)}%`,
                        textAlign: selectedFrame?.name.align,
                        padding: 2, fontSize: 18,
                        fontFamily: selectedFont
                    }}
                >
                    {businessData?.business_name}
                </Text>
                <Text
                    style={{
                        position: 'absolute',
                        width: '100%',
                        color: selectedFrame.email.color || 'white',
                        left: `${parseInt(selectedFrame?.email.left)}%`,
                        top: `${parseInt(selectedFrame?.email.top)}%`,
                        textAlign: selectedFrame?.email.align,
                        padding: 4,
                        fontFamily: selectedFont
                    }}
                >{businessData?.business_email}</Text>
                <Text
                    style={{
                        position: 'absolute',
                        width: '100%',
                        color: selectedFrame?.mobile.color || 'white',
                        left: `${parseInt(selectedFrame?.mobile.left)}%`,
                        top: `${parseInt(selectedFrame?.mobile.top)}%`,
                        textAlign: selectedFrame?.mobile.align,
                        padding: 4,
                        fontFamily: selectedFont
                    }}
                >{businessData?.business_mobile}</Text>
                <Text
                    style={{
                        position: 'absolute', width: '100%',
                        color: selectedFrame?.address.color || 'white',
                        left: `${parseInt(selectedFrame?.address.left)}%`,
                        top: `${parseInt(selectedFrame?.address.top)}%`,
                        textAlign: selectedFrame?.address.align, padding: 2, fontFamily: selectedFont
                    }}
                >
                    {businessData?.business_address}
                </Text>
                <Text
                    style={{
                        position: 'absolute', width: '100%',
                        color: selectedFrame?.details.color || 'white',
                        left: `${parseInt(selectedFrame?.details.left)}%`,
                        top: `${parseInt(selectedFrame?.details.top)}%`,
                        textAlign: selectedFrame?.details.align, padding: 2, fontFamily: selectedFont
                    }}
                >
                    {businessData?.business_details}
                </Text>
            </View>
        );
    };
    const [isLoaded, setIsLoaded] = useState(false);
    const videoUri = imageUrl + searchdata.video;
    return (
        <PaperProvider>
            <Portal>
                <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
                    <ScrollView style={{ backgroundColor: bgColor }}>
                        <View style={{ flex: 1 }}>
                            <ViewShot
                                ref={viewShotRef}
                                options={{ format: "png", quality: 1 }}
                                style={[styles.viewShot, { height: imageHeight, backgroundColor: "transparent", overflow: 'hidden' }]}
                            >
                                {searchdata.callFrom === 'Greetings' && (
                                    <DraggableImage image_x={searchdata.image_x} image_y={searchdata.image_y} isCapturing={isCapturing} />
                                )}
                                <View pointerEvents="none" style={{ backgroundColor: "transparent" }}>
                                    {searchdata.type === 'image' ? (
                                        <Image
                                            source={{ uri: searchdata.image }}
                                            style={{ height: imageHeight, width: '100%' }}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <>
                                            {!isLoaded && (
                                                <View style={{
                                                    position: 'absolute',
                                                    height: imageHeight,
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    zIndex: 1
                                                }}>
                                                    <ActivityIndicator size="large" />
                                                </View>
                                            )}
                                            <Video
                                                source={{ uri: videoUri }}
                                                style={{ height: imageHeight, width: '100%', opacity: hideMedia ? 0 : (isLoaded ? 1 : 0) }}
                                                resizeMode="contain"
                                                controls={false}
                                                paused={!isLoaded} // 👈 important
                                                onLoad={() => setIsLoaded(true)}
                                                bufferConfig={{
                                                    minBufferMs: 10000,
                                                    maxBufferMs: 30000,
                                                    bufferForPlaybackMs: 1500,
                                                    bufferForPlaybackAfterRebufferMs: 3000,
                                                }}

                                                repeat={true}
                                            />
                                        </>
                                    )}
                                    {frameVisible && (
                                        <>
                                            <Image
                                                source={{ uri: imageUrl + selectedFrame?.frame }}
                                                style={styles.frameOverlay}
                                                resizeMode="contain"
                                            />
                                            {selectedFrame?.type === "default" && (
                                                <DefaultFrameOverlay selectedFrame={selectedFrame} />
                                            )}
                                        </>
                                    )}
                                    {searchdata.callFrom != 'Custom' && watermark == 'Yes' && (
                                        <Image
                                            source={require('../../assets/watermark.png')}
                                            style={styles.frameOverlay}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>
                                {logoVisible && (
                                    <DraggableLogo
                                        item={businessData?.business_image}
                                        isCapturing={isCapturing}
                                    />
                                )}
                                {elements.map((item) => (
                                    <DraggableElement
                                        key={item.id}
                                        item={item}
                                        isActive={activeId === item.id}
                                        isCapturing={isCapturing}
                                        onSelect={() => setActiveId(item.id)}
                                        onDelete={() =>
                                            setElements((prev) =>
                                                prev.filter((i) => i.id !== item.id)
                                            )
                                        }
                                        onEdit={(item: any) => {
                                            setEditData(item);     // 👈 existing data set
                                            setModalVisible(true); // 👈 modal open
                                        }}
                                    />
                                ))}
                            </ViewShot>
                            <View style={{ padding: 10, backgroundColor: '#fffffff0', marginTop: 10 }}>
                                {downloading && (
                                    <View style={styles.loaderContainer}>
                                        <View style={styles.loaderBox}>
                                            <Text style={styles.loaderText}>
                                                <Text>{status}</Text>
                                                {status === "Downloading..." && (
                                                    <Text>{progress}%</Text>
                                                )}
                                            </Text>

                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${progress}%` },
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}
                                <FlatList
                                    data={frames}
                                    horizontal
                                    keyExtractor={(item, i) => i.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.framePreview,
                                                selectedFrame === item &&
                                                styles.frameSelected,
                                            ]}
                                            onPress={() => setSelectedFrame(item)}>
                                            <Image
                                                source={{ uri: imageUrl + item.frame }}
                                                style={styles.previewImage}
                                            />
                                        </TouchableOpacity>
                                    )}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 10 }}>
                                {actions.map((item, index) => (
                                    <View style={{ alignItems: 'center' }}>
                                        <TouchableOpacity
                                            key={index}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                backgroundColor: item.color,
                                                borderRadius: 5,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                elevation: 3,
                                                shadowColor: "#000",
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 3,
                                            }}
                                            onPress={item.action}
                                        >
                                            <Icon source={item.icon} size={24} color="#FFF" />
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 14, textAlign: "center", fontWeight: 'bold', marginTop: 5, color: "#ffffff" }}>
                                            {item.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.footerRow}>
                        <TouchableOpacity
                            onPress={() => Linking.openURL("whatsapp://send?phone=917410747201&text=Hi, I want to add frames.")} style={styles.whatsappBtn}>
                            <Text style={{ color: activeColor }}>Contact us on WhatsApp for custom frames</Text>
                        </TouchableOpacity>
                    </View>
                    <FontSelectorModal visible={visible} setVisible={setVisible} selectedFont={selectedFont} setSelectedFont={setSelectedFont} />
                    <TextEditModal
                        visible={modalVisible}
                        onDismiss={() => setModalVisible(false)}
                        onSave={(newData) => {
                            handleSaveText(newData);
                            closeModal();
                        }}
                        initialData={editData}
                    />
                </SafeAreaView>
            </Portal>
        </PaperProvider>
    );
}

const DraggableElement = ({ item, isActive, isCapturing, onSelect, onDelete, onEdit }: any) => {
    const PADDING = 10;
    const translateX = useSharedValue(item.translateX || 0);
    const translateY = useSharedValue(item.translateY || 0);
    const scale = useSharedValue(item.scale || 1);

    const flipX = useSharedValue(item.flipX || 1);
    const flipY = useSharedValue(item.flipY || 1);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const baseScale = useSharedValue(1);

    const [size, setSize] = useState(120);
    const [showControls, setShowControls] = useState(false);
    const timerRef = useRef<any>(null);
    const handleShowControls = () => {
        setShowControls(true);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);
    const pan = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
            startY.value = translateY.value;
        })
        .onUpdate((e) => {
            const newX = startX.value + e.translationX;
            const newY = startY.value + e.translationY;
            const maxX = screenWidth - (size * scale.value) / 2 - PADDING;
            const minX = -maxX;
            const maxY = screenWidth - (size * scale.value) / 2 - PADDING;
            const minY = -maxY;
            translateX.value = Math.min(Math.max(newX, minX), maxX);
            translateY.value = Math.min(Math.max(newY, minY), maxY);
        });

    const pinch = Gesture.Pinch()
        .onStart(() => { baseScale.value = scale.value; })
        .onUpdate((e) => { scale.value = Math.max(0.5, Math.min(baseScale.value * e.scale, 4)) });
    const tap = Gesture.Tap().onEnd(() => {
        runOnJS(handleShowControls)();
    });
    const composed = Gesture.Simultaneous(pan, pinch, tap);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const contentStyle = useAnimatedStyle(() => ({
        transform: [
            { scaleX: flipX.value },
            { scaleY: flipY.value },
        ],
    }));

    return (
        <GestureDetector gesture={composed}>
            <Animated.View style={[styles.element, containerStyle]}>

                <TouchableOpacity activeOpacity={1} onPress={onSelect} onLongPress={() => {
                    if (item.type === "text") {
                        onEdit(item);
                    }
                }}>
                    <Animated.View
                        style={[styles.touchWrapper, contentStyle]}
                        onLayout={(e) => {
                            setSize(e.nativeEvent.layout.width);
                        }}
                    >
                        {item.type === "image" ? (
                            <Image
                                source={{ uri: item.path }}
                                style={{ width: 120, height: 120 }}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text
                                style={{
                                    fontSize: item.fontSize,
                                    color: item.fontColor,
                                    fontFamily: item.fontStyle
                                }}
                            >
                                {item.text}
                            </Text>
                        )}
                    </Animated.View>
                </TouchableOpacity>

                {showControls && isActive && !isCapturing && (
                    <View style={styles.selection}>
                        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                            <Icon source="close" size={16} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.flipHBtn}
                            onPress={() => (flipX.value *= -1)}
                        >
                            <Icon source="swap-horizontal" size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.flipVBtn}
                            onPress={() => (flipY.value *= -1)}
                        >
                            <Icon source="swap-vertical" size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.zoomOutBtn}
                            onPress={() => {
                                scale.value = withSpring(Math.max(0.3, scale.value - 0.2));
                            }}
                        >
                            <Icon source="minus" size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.zoomInBtn}
                            onPress={() => {
                                scale.value = withSpring(Math.min(4, scale.value + 0.2));
                            }}
                        >
                            <Icon source="plus" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </GestureDetector>
    );
};
const DraggableLogo = ({ item, isCapturing }: any) => {
    const PADDING = 10;

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const flipX = useSharedValue(1);
    const flipY = useSharedValue(1);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const baseScale = useSharedValue(1);

    const [logoSize, setLogoSize] = useState(100);

    const [showControls, setShowControls] = useState(false);
    const timerRef = useRef<any>(null);
    const handleShowControls = () => {
        setShowControls(true);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const pan = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
            startY.value = translateY.value;
        })
        .onUpdate((e) => {
            const newX = startX.value + e.translationX;
            const newY = startY.value + e.translationY;

            const maxX = screenWidth - (logoSize * scale.value) / 2 - PADDING;
            const minX = -maxX;

            const maxY = screenWidth - (logoSize * scale.value) / 2 - PADDING;
            const minY = -maxY;

            translateX.value = Math.min(Math.max(newX, minX), maxX);
            translateY.value = Math.min(Math.max(newY, minY), maxY);
        });

    const pinch = Gesture.Pinch()
        .onStart(() => {
            baseScale.value = scale.value;
        })
        .onUpdate((e) => {
            scale.value = Math.max(0.5, Math.min(baseScale.value * e.scale, 4));
        });

    const tap = Gesture.Tap().onEnd(() => {
        runOnJS(handleShowControls)();
    });

    const composed = Gesture.Simultaneous(pan, pinch, tap);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const contentStyle = useAnimatedStyle(() => ({
        transform: [
            { scaleX: flipX.value },
            { scaleY: flipY.value },
        ],
    }));

    return (
        <GestureDetector gesture={composed}>
            <Animated.View style={[styles.overlayImageContainer, containerStyle]}>

                <Animated.View style={contentStyle} onLayout={(e) => setLogoSize(e.nativeEvent.layout.width)}>
                    <FastImage
                        source={{
                            uri: imageUrl + item,
                            priority: FastImage.priority.normal,
                            cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.overlayLogoImage}
                    />
                </Animated.View>
                {showControls && !isCapturing && (
                    <View style={styles.selection}>
                        <TouchableOpacity style={styles.flipHBtn} onPress={() => (flipX.value *= -1)}>
                            <Icon source="swap-horizontal" size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.flipVLogoBtn} onPress={() => (flipY.value *= -1)}>
                            <Icon source="swap-vertical" size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.zoomOutBtn}
                            onPress={() => {
                                scale.value = withSpring(Math.max(0.3, scale.value - 0.2));
                            }}
                        >
                            <Icon source="minus" size={14} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.zoomInBtn}
                            onPress={() => {
                                scale.value = withSpring(Math.min(4, scale.value + 0.2));
                            }}
                        >
                            <Icon source="plus" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </GestureDetector>
    );
};

const DraggableImage = ({ image_x, image_y, isCapturing }: any) => {
    const { width, height } = Dimensions.get('window');
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const pickImage = async () => {
        try {
            const [file] = await pick({ type: [types.images] });
            if (file.size && file.size < 5 * 1024 * 1024) {
                setSelectedImage(file.uri)
            }
        } catch (err) {
            console.warn('Document Picker Error:', err);
        }
    };
    const translateX = useSharedValue((Number(image_x) / 100) * width);
    const translateY = useSharedValue((Number(image_y) / 100) * width);
    const scale = useSharedValue(1);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const baseScale = useSharedValue(1);
    const timerRef = useRef<any>(null);


    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const pan = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
            startY.value = translateY.value;
        })
        .onUpdate((e) => {
            const newX = startX.value + e.translationX;
            const newY = startY.value + e.translationY;
            translateX.value = Math.min(Math.max(newX));
            translateY.value = Math.min(Math.max(newY));
        });

    const pinch = Gesture.Pinch()
        .onStart(() => {
            baseScale.value = scale.value;
        })
        .onUpdate((e) => {
            scale.value = Math.max(0.5, Math.min(baseScale.value * e.scale, 4));
        });

    const composed = Gesture.Simultaneous(pan, pinch);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));
    return (
        <GestureDetector gesture={composed}>
            <Animated.View style={[styles.greetingImageContainer, containerStyle]}>
                <Image
                    source={selectedImage ? { uri: selectedImage } : require('../../assets/upload.png')}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain',
                        position: 'absolute',
                        zIndex: -1, // ✅ only image is behind
                    }}
                />

                <TouchableOpacity
                    onPress={pickImage}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        zIndex: 1, // ✅ stays clickable
                    }}
                />
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    zoomButtonsContainer: {
        position: "absolute",
        bottom: -15,
        left: -15,
        flexDirection: "row",
        gap: 70,
    },
    zoomButton: {
        backgroundColor: "rgba(0,0,0,0.7)",
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    zoomText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },

    overlayLogoImage: {
        top: 0,
        left: 0,
        width: 100,
        height: 100,
    },
    overlayImageContainer: {
        position: "absolute",
        backgroundColor: "transparent",
        zIndex: 3,
        width: 100,
        height: 100,
    },
    greetingImageContainer: {
        position: "absolute",
        backgroundColor: "transparent",
        width: 100,
        height: 100,
    },
    loaderContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },

    loaderBox: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
    },

    loaderText: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },

    progressBar: {
        height: 8,
        backgroundColor: "#eee",
        borderRadius: 10,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        backgroundColor: "#4caf50",
    },
    element: {
        position: "absolute",
    },
    touchWrapper: {
        justifyContent: "center",
        alignItems: "center",
    },
    selection: {
        position: "absolute",
        borderWidth: 2,
        borderColor: "#00AEEF",
        width: "100%",
        height: "100%",
    },
    deleteBtn: {
        position: "absolute",
        top: -12,
        right: -12,
        backgroundColor: "red",
        borderRadius: 12,
        padding: 4,
    },
    flipHBtn: {
        position: "absolute",
        top: -12,
        left: -12,
        backgroundColor: "#00AEEF",
        borderRadius: 12,
        padding: 4,
    },
    flipVBtn: {
        position: "absolute",
        top: -12,
        left: 30,
        backgroundColor: "#00AEEF",
        borderRadius: 12,
        padding: 4,
    },
    flipVLogoBtn: {
        position: "absolute",
        top: -12,
        right: -12,
        backgroundColor: "#00AEEF",
        borderRadius: 12,
        padding: 4,
    },
    zoomOutBtn: {
        position: "absolute",
        bottom: -12,
        left: -12,
        backgroundColor: "#00AEEF",
        borderRadius: 12,
        padding: 4,
    },
    zoomInBtn: {
        position: "absolute",
        bottom: -12,
        right: -12,
        backgroundColor: "#00AEEF",
        borderRadius: 12,
        padding: 4,
    },
    viewShot: {
        width: "100%",
        backgroundColor: "#000",
    },
    frameOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: screenWidth,
    },
    framePreview: {
        width: 83,
        height: 83,
        marginRight: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#aaaaaa",
        overflow: "hidden",
    },
    frameSelected: {
        borderColor: activeColor,
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    footerRow: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        alignItems: 'center', // centers horizontally
    },

    whatsappBtn: {
        paddingHorizontal: 5,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '90%',
    },
    gridItem: {
        width: "32%",
        aspectRatio: 1,
        borderRadius: 6,
        marginBottom: 10,
        backgroundColor: "#f2f2f2",
        overflow: "hidden",
    },
    gridImage: {
        width: "100%",
        height: "100%",
    },
});
