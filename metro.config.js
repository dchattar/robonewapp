const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const defautConfig = getDefaultConfig(__dirname);
const customConfig = {};
const config = mergeConfig(defautConfig, customConfig);

module.exports = wrapWithReanimatedMetroConfig(config)