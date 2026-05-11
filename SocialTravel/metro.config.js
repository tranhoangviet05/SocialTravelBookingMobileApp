// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Thêm resolver cho alias @/ -> thư mục gốc
config.resolver.alias = {
  '@': __dirname,
};

module.exports = config;
