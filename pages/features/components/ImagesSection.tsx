import React, { useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Icon, Button } from "react-native-paper";
import ImagePicker from "react-native-image-crop-picker";

const screenWidth = Dimensions.get("window").width;

export default function CanvaLikeScreen() {
  const viewShotRef = useRef<any>(null);
  const hideTimeout = useRef<any>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<any>(null);
    
  const addImage = async () => {
    const img: any = await ImagePicker.openPicker({ cropping: true });

    const newItem = {
      id: Date.now(),
      type: "image",
      path: img.path,
      text: "",
      translateX: 50,
      translateY: 50,
      scale: 1,
      flipX: 1,
      flipY: 1,
    };

    setElements((prev) => [...prev, newItem]);
  };

  const addText = () => {
    const newItem = {
      id: Date.now(),
      type: "text",
      text: "Edit Me",
      translateX: 50,
      translateY: 50,
      scale: 1,
      flipX: 1,
      flipY: 1,
      fontSize: 26,
      fontColor: "#000",
    };

    setElements((prev) => [...prev, newItem]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ViewShot ref={viewShotRef} style={styles.canvas}>
        <Image
          source={{ uri: "https://picsum.photos/600/800" }}
          style={{ width: "100%", height: "100%" }}
        />
        {elements.map((item) => (
          <DraggableElement
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onSelect={() => setActiveId(item.id)}
            onDelete={() =>
              setElements((prev) =>
                prev.filter((i) => i.id !== item.id)
              )
            }
          />
        ))}
      </ViewShot>
      <View style={styles.actions}>
        <Button mode="contained" onPress={addText}>Text</Button>
        <Button mode="contained" onPress={addImage}>Image</Button>
      </View>
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////

const DraggableElement = ({ item, isActive, onSelect, onDelete }: any) => {
  const translateX = useSharedValue(item.translateX);
  const translateY = useSharedValue(item.translateY);
  const scale = useSharedValue(item.scale);

  const flipX = useSharedValue(item.flipX || 1);
  const flipY = useSharedValue(item.flipY || 1);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const baseScale = useSharedValue(1);

  // Drag
  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  // Pinch
  const pinch = Gesture.Pinch()
    .onStart(() => {
      baseScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(baseScale.value * e.scale, 4));
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  // 🔹 Parent (NO FLIP HERE)
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // 🔥 ONLY CONTENT WILL FLIP
  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: flipX.value },
      { scaleY: flipY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.element, containerStyle]}>
        
        <TouchableOpacity activeOpacity={1} onPress={onSelect}>
          
          {/* 👇 APPLY FLIP ONLY HERE */}
          <Animated.View style={[styles.touchWrapper, contentStyle]}>
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
                }}
              >
                {item.text}
              </Text>
            )}
          </Animated.View>

        </TouchableOpacity>

        {/* ✅ CONTROLS (NOT FLIPPED) */}
        {isActive && (
          <View style={styles.selection}>
            
            {/* ❌ Delete */}
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Icon source="close" size={16} color="#fff" />
            </TouchableOpacity>

            {/* 🔄 Flip H */}
            <TouchableOpacity
              style={styles.flipHBtn}
              onPress={() => {
                flipX.value = flipX.value === 1 ? -1 : 1;
              }}
            >
              <Icon source="swap-horizontal" size={14} color="#fff" />
            </TouchableOpacity>

            {/* 🔄 Flip V */}
            <TouchableOpacity
              style={styles.flipVBtn}
              onPress={() => {
                flipY.value = flipY.value === 1 ? -1 : 1;
              }}
            >
              <Icon source="swap-vertical" size={14} color="#fff" />
            </TouchableOpacity>

            {/* ➖ Zoom OUT */}
            <TouchableOpacity
              style={styles.zoomOutBtn}
              onPress={() => {
                scale.value = withSpring(Math.max(0.3, scale.value - 0.2));
              }}
            >
              <Icon source="minus" size={14} color="#fff" />
            </TouchableOpacity>

            {/* ➕ Zoom IN */}
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

///////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    height: screenWidth * 1.5,
    backgroundColor: "#222",
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
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#111",
  },
});