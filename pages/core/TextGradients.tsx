import React from "react";
import { Text, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

export interface TextGradientProps {
  text: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  fontFamily?: string;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  colors?: string[];
  style?: object;
}

const TextGradients: React.FC<TextGradientProps> = ({
  text,
  fontSize = 24,
  fontFamily,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  colors = ['red', 'yellow'],
  style = {},
}) => {
  return (
    <MaskedView
      style={[styles.maskedView, style]}
      maskElement={
        <Text style={[styles.text, { fontSize, fontFamily }]}>
          {text}
        </Text>
      }
    >
      <LinearGradient start={start} end={end} colors={colors}>
        <Text style={[styles.text, { fontSize, fontFamily, opacity: 0 }]}>
          {text}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  maskedView: {
    width: '100%',
  },
  text: {
    backgroundColor: "transparent",
  },
});

export default TextGradients;