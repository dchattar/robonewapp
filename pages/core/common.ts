import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";

export const themeColor = '#08439c';
export const lightthemeColor = '#1c67d6';
export const bgColor = '#082146';
export const activeColor = "#fff700"
export const merchantId = "";
export const whatsappNumber = "917410747201";
export const imageUrl = 'https://roboapp.itraindia.org/server/';
export const apiUrl = 'https://roboapp.itraindia.org/api/';
export const myfonts = [
  "Akshar-Bold",
  "Akshar-Light",
  "Akshar-Medium",
  "Akshar-Regular",
  "Akshar-SemiBold",
  "Akshar-VariableFont_wght",
  "Amita-Bold",
  "Amita-Regular",
  "AntDesign",
  "Arya-Bold",
  "Arya-Regular",
  "Baloo2-Bold",
  "Baloo2-ExtraBold",
  "Baloo2-Medium",
  "Baloo2-SemiBold",
  "Entypo",
  "EvilIcons",
  "Feather",
  "FontAwesome",
  "FontAwesome5_Brands",
  "FontAwesome5_Regular",
  "FontAwesome5_Solid",
  "FontAwesome6_Brands",
  "FontAwesome6_Regular",
  "FontAwesome6_Solid",
  "Fontisto",
  "Foundation",
  "GajrajOne-Regular",
  "GoogleSans_17pt-Bold",
  "GoogleSans-Bold",
  "GoogleSans-Italic-VariableFont_GRAD,opsz,wght",
  "GoogleSans-SemiBold",
  "GoogleSans-VariableFont_GRAD,opsz,wght",
  "Hind-Bold",
  "Hind-Light",
  "Hind-Medium",
  "Hind-Regular",
  "Hind-SemiBold",
  "Ionicons",
  "JainiPurva-Regular",
  "Jaini-Regular",
  "Kalam-Bold",
  "Kalam-Light",
  "Kalam-Regular",
  "Khand-Bold",
  "Khand-Light",
  "Khand-Medium",
  "Khand-Regular",
  "Khand-SemiBold",
  "Laila-Bold",
  "Laila-Light",
  "Laila-Medium",
  "Laila-Regular",
  "Laila-SemiBold",
  "Modak-Regular",
  "Octicons",
  "PalanquinDark-Bold",
  "PalanquinDark-Medium",
  "PalanquinDark-Regular",
  "PalanquinDark-SemiBold",
  "PlaypenSansDeva-Bold",
  "PlaypenSansDeva-ExtraBold",
  "PlaypenSansDeva-Medium",
  "PlaypenSansDeva-SemiBold",
  "PlaypenSansDeva-VariableFont_wght",
  "Poppins-Black",
  "Poppins-BlackItalic",
  "Poppins-Bold",
  "Poppins-BoldItalic",
  "Poppins-ExtraBold",
  "Poppins-ExtraBoldItalic",
  "Poppins-ExtraLight",
  "Poppins-ExtraLightItalic",
  "Poppins-Italic",
  "Poppins-Light",
  "Poppins-LightItalic",
  "Poppins-Medium",
  "Poppins-MediumItalic",
  "Poppins-Regular",
  "Poppins-SemiBold",
  "Poppins-SemiBoldItalic",
  "Poppins-Thin",
  "Ranga-Bold",
  "Ranga-Regular",
  "RozhaOne-Regular",
  "SimpleLineIcons",
  "Tillana-Bold",
  "Tillana-ExtraBold",
  "Tillana-Medium",
  "Tillana-Regular",
  "Tillana-SemiBold",
  "Zocial"
];

export async function requestStoragePermissions() {
  if (Platform.OS === 'android') {
      const apiLevel = Platform.OS === 'android' ? Platform.constants?.Version : null;
      if (apiLevel && apiLevel <= 29) {
        try {
          const writeGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to save PDF files',
              buttonPositive: 'OK',
            }
          );
          if (
            writeGranted === PermissionsAndroid.RESULTS.GRANTED
          ) {
            return true;
          } else {
            Alert.alert(
              'Permission Required',
              'Please enable storage permissions in Settings to download files.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
            return false;
          }
        } catch (err) {
          return false;
        }
      }
      return true;
    }
    return true;
}