const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

module.exports = withUniwindConfig(getDefaultConfig(__dirname), {
  cssEntryFile: './src/global.css',
  dtsFile: './uniwind-types.d.ts', // className 자동완성용. Reusables CLI도 이 파일로 Uniwind를 알아챈다
});
