import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button, Modal} from 'react-native-paper';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ColorPicker, {Swatches,OpacitySlider,HueSlider,colorKit,Panel1} from 'reanimated-color-picker';
import type { ColorFormatsObject } from 'reanimated-color-picker';
import { myfonts } from '../../core/common';
import SelectDropdown from 'react-native-select-dropdown';
export const TextEditModal = ({
  visible,
  onDismiss,
  onSave,
  initialData
}: {
  visible: boolean;
  onDismiss: () => void;
  onSave: (newText: any) => void;
  initialData?: any;
}) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(26);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontStyle, setFontStyle] = useState<any>('Poppins-Regular');
  const fontOptions = myfonts.map((font) => ({
    label: font.replace(/-/g, " "),
    value: font,
  }));
  useEffect(() => {
    if (initialData) {
      setText(initialData.text || '');
      setFontSize(initialData.fontSize || 26);
      setFontColor(initialData.fontColor || '#000000');
      setFontStyle(initialData.fontStyle || 'Poppins-Regular');
    } else {
      setText('');
      setFontSize(26);
      setFontColor('#000000');
      setFontStyle('Poppins-Regular');
    }
  }, [initialData]);
  const saveText = () => {
    const newTextData = {
      id: initialData?.id || Date.now(),
      text,
      fontSize,
      fontColor,
      fontStyle,
      translateX: initialData?.translateX || 100,
      translateY: initialData?.translateY || 150,
      type: "text",
      scale: 1,
      flipX: 1,
      flipY: 1,
    };
    onSave(newTextData);
    onDismiss();
  };
  const customSwatches = [
    '#ffffff',
    ...new Array(5).fill(null).map(() => colorKit.randomRgbColor().hex()),
  ];

  const selectedColor = useSharedValue(customSwatches[0]);

  const onColorSelect = (color: ColorFormatsObject) => {
    'worklet';
    selectedColor.value = color.hex;
    runOnJS(setFontColor)(color.hex);
  };
  const onColorPick = (color: ColorFormatsObject) => {
    setFontColor(color.hex);
  };
  return (

    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.containerStyle}
    >

      <View style={{ flex: 1 }}>
        <Text style={styles.heading}>
          {initialData ? 'Edit Text' : 'Add New Text'}
        </Text>
        <View style={styles.previewContainer}>
          <Text
            style={{ fontSize, color: fontColor, fontFamily: fontStyle, textAlign: 'center' }}>
            {text}
          </Text>
        </View>
        <TextInput
          mode="outlined"
          label="Enter Text"
          value={text}
          onChangeText={setText}
          style={styles.input}
          multiline={true}
          numberOfLines={4}
          blurOnSubmit={false}
        />
        <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <TextInput
            mode="outlined"
            label="Enter Size"
            keyboardType="numeric"
            value={fontSize.toString()}
            onChangeText={(val) => setFontSize(Number(val))}
            style={[styles.input, { flex: 0.3 }]}
          />
          <View style={{ flex: 0.7 }}>
            <Text style={styles.label} >Select Font</Text>
            <SelectDropdown
              data={fontOptions}
              onSelect={(selectedItem) => { setFontStyle(selectedItem.value); }}
              renderButton={(selectedItem, isOpen) => {
                const selected = fontOptions.find(f => f.value === fontStyle);
                return (
                  <View style={styles.inputLikeBox}>
                    <Text style={[styles.inputText, { color: selected ? "#000" : "#999", fontFamily: fontStyle, },]}>
                      {selected ? selected.label : "Select Font"}
                    </Text>
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View style={[styles.dropdownItemStyle, isSelected && { backgroundColor: '#eee' }]}>
                    <Text style={[styles.dropdownItemTxtStyle, { fontFamily: item.value }]}>
                      {item.label}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
        <View style={{ flex: 1,marginTop:10 }}>
            <ColorPicker
              value={selectedColor.value}
              sliderThickness={25}
              thumbSize={24}
              thumbShape='circle'
              onChange={onColorSelect}
              onCompleteJS={onColorPick}
              style={styles.picker}
              boundedThumb
            >
              <HueSlider style={styles.sliderStyle} />
              <Panel1 style={styles.panelStyle} />
              <OpacitySlider style={styles.sliderStyle} />
              <Swatches
                style={styles.swatchesContainer}
                swatchStyle={styles.swatchStyle}
                colors={customSwatches}
              />
            </ColorPicker>
        </View>
        <View style={styles.actionButtons}>
          <Button icon="close" mode="outlined" onPress={onDismiss} textColor="red" style={styles.cancelButton}>
            Cancel
          </Button>
          <Button icon="check" mode="outlined" onPress={saveText} textColor="green" style={styles.saveButton}>
            Save
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    width: '96%',
    height: '90%',
    marginBottom: '10%',
    borderRadius: 10,
    marginLeft: '2%'
  },
  dropdownWrapper: {
    flex: 1,
    marginTop: 16,
  },
  label: {
    position: 'absolute',
    left: 12,
    top: 8,
    fontSize: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
    color: '#5c5c5c',
  },
  inputLikeBox: {
    borderWidth: 1,
    borderColor: '#6e6e6e',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 51,
    marginTop: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  inputText: {
    fontSize: 16,
  },

  dropdownItemStyle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dropdownItemTxtStyle: {
    fontSize: 16,
    color: '#000',
  },
  previewContainer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  hueContainer: {
    justifyContent: 'center',
  },
  panelStyle: {
    width: '100%',
    height: 100,
    alignSelf: 'center',
    borderRadius: 16,
  },
  modalContainer: {
    width: '90%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: '5%',
    padding: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    marginVertical: 10,
  },
  fontStyleContainer: {
    marginVertical: 10,
  },
  fontStyleHeading: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fontStyleScroll: {
    marginVertical: 10,
  },
  fontButton: {
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 10,
    width: 'auto'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderColor: 'red',
  },
  saveButton: {
    borderColor: 'green',
  },
  swatchesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flexWrap: 'nowrap',
    gap: 10,
  },
  swatchStyle: {
    borderRadius: 20,
    height: 30,
    width: 30,
    margin: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  picker: {
    gap: 20,
    width:'100%'
  },
  sliderStyle: {
    borderRadius: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});