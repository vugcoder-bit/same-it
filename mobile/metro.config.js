const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const shimPath = path.resolve(__dirname, 'shims/react-native.js');

const config = getDefaultConfig(__dirname);

// Redirect all `react-native` imports from project source files to our font shim.
// The shim itself is excluded to prevent circular reference.
const originalResolveRequest = config.resolver?.resolveRequest;
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native' &&
    context.originModulePath !== shimPath
  ) {
    return {
      filePath: shimPath,
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });