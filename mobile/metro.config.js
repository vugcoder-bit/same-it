const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const shimPath = path.resolve(__dirname, 'shims/react-native.js');

const config = getSentryExpoConfig(__dirname);

// Redirect all `react-native` imports from project source files to our font shim.
// The shim itself is excluded to prevent circular reference.
const originalResolveRequest = config.resolver?.resolveRequest;
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isShim = context.originModulePath && context.originModulePath.match(/[\\/]shims[\\/]react-native\.js$/i);
  
  if (
    moduleName === 'react-native' &&
    !isShim
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