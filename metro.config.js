// const {getDefaultConfig} = require('expo/metro-config');
// const {mergeConfig} = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://facebook.github.io/metro/docs/configuration
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// const tfjsrnConfig = (() => {
//   const defaultConfig = getDefaultConfig(__dirname);
//   const {assetExts} = defaultConfig.resolver;
//   return {
//     resolver: {
//       // Add bin to assetExts
//       assetExts: [...assetExts, 'json', 'bin'],
//       sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'bin'], //add here
//     },
//   };
// })();

// module.exports = mergeConfig(getDefaultConfig(__dirname), tfjsrnConfig);

// module.exports = (async () => {
//   const defaultConfig = await getDefaultConfig();
//   const {assetExts, sourceExts} = defaultConfig.resolver;
//   return {
//     resolver: {
//       // Add bin to assetExts
//       assetExts: [...assetExts, 'json', 'bin'],
//       sourceExts: [...sourceExts, 'json', 'bin'],
//     },
//   };
// })();

// const {getDefaultConfig} = require('metro-config');
// module.exports = (async () => {
//   const defaultConfig = await getDefaultConfig(__dirname);
//   const {assetExts} = defaultConfig.resolver;
//   return {
//     resolver: {
//       // Add bin to assetExts
//       assetExts: [...assetExts, 'bin'],
//     },
//   };
// })();

const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
