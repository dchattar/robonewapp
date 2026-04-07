/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from "react-native-paper";
enableScreens();
const MainApp = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
      <App />
  </GestureHandlerRootView>
    
);

AppRegistry.registerComponent(appName, () => MainApp);
