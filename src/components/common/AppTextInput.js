import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';

const AppTextInput = (props) => {
  const { style, ...rest } = props;
  
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const isBold = flattenedStyle.fontWeight === 'bold' || flattenedStyle.fontWeight === '700';

  const customStyle = {
    fontFamily: isBold ? 'Quicksand-Bold' : 'Quicksand-Regular',
  };

  return (
    <RNTextInput 
      {...rest} 
      style={[customStyle, style]} 
    />
  );
};

export default AppTextInput;
