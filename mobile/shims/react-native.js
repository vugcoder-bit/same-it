/**
 * react-native shim
 * Re-exports everything from the real react-native but replaces `Text`
 * with a custom version that injects the CoconNextArabic global font.
 */
export * from 'react-native';

import React from 'react';
import { Text as RNText } from 'react-native';

const Text = React.forwardRef(function Text({ style, ...props }, ref) {
  return (
    <RNText
      ref={ref}
      style={[{ fontFamily: 'CoconNextArabic' }, style]}
      {...props}
    />
  );
});

Text.displayName = 'Text';

export { Text };
