import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import { Modal, Button, RadioButton, IconButton } from "react-native-paper";
import { myfonts } from "../../core/common";

const FontSelectorModal = ({
  visible,
  setVisible,
  selectedFont,
  setSelectedFont,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
}) => {
  const [search, setSearch] = useState("");

  const filteredFonts = myfonts.filter((font) =>
    font.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      onDismiss={() => setVisible(false)}
      contentContainerStyle={styles.modalContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.modalTitle}>Select Font</Text>
        <IconButton icon="close" size={22} onPress={() => setVisible(false)} />
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search font..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* Font List */}
      <RadioButton.Group value={selectedFont} onValueChange={setSelectedFont}>
        <FlatList
          data={filteredFonts}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => {
            const isSelected = selectedFont === item;

            return (
              <TouchableOpacity
                onPress={() => setSelectedFont(item)}
                style={[
                  styles.fontItem,
                  isSelected && styles.selectedFontItem,
                ]}
              >
                <View style={{ flex: 1 }}>
                  {/* Font Name */}
                  <Text style={styles.fontName}>{item}</Text>

                  {/* Preview */}
                  <Text
                    style={[
                      styles.fontPreview,
                      { fontFamily: item },
                    ]}
                  >
                    Aa Bb Cc 123
                  </Text>
                </View>

                <RadioButton value={item} />
              </TouchableOpacity>
            );
          }}
        />
      </RadioButton.Group>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => setVisible(false)}
          style={styles.doneButton}
          contentStyle={{ paddingVertical: 6 }}
        >
          Apply Font
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    height: "90%",
    margin: 16,
    borderRadius: 16,
    paddingTop: 10,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  searchInput: {
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },

  fontItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },

  selectedFontItem: {
    backgroundColor: "#e8f0ff",
    borderWidth: 1,
    borderColor: "#4a90e2",
  },

  fontName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  fontPreview: {
    fontSize: 18,
    marginTop: 4,
    color: "#111",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 0.5,
    borderColor: "#ddd",
  },

  doneButton: {
    borderRadius: 10,
  },
});

export default FontSelectorModal;