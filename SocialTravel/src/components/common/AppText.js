import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Typography } from '../../constants/theme';

const AppText = ({ 
  children, 
  style, 
  numberOfLines, 
  weight = 'regular' 
}) => {
  const getFontFamily = () => {
    switch (weight) {
      case 'medium': return Typography.fontFamily.medium;
      case 'semiBold': return Typography.fontFamily.semiBold;
      case 'bold': return Typography.fontFamily.bold;
      default: return Typography.fontFamily.regular;
    }
  };

  // Bảo vệ chống lỗi "Objects are not valid as a React child"
  const renderChildren = () => {
    // Nếu là React Element hoặc Array thì để React tự xử lý
    if (React.isValidElement(children) || Array.isArray(children)) {
      return children;
    }

    // Nếu là Object (dữ liệu) thì trích xuất chuỗi
    if (typeof children === 'object' && children !== null) {
      return children.name || children.display_name || children.title || String(children);
    }
    
    return children;
  };

  return (
    <Text 
      style={[styles.text, { fontFamily: getFontFamily() }, style]}
      numberOfLines={numberOfLines}
    >
      {renderChildren()}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: Typography.fontSize.base,
    color: '#0F172A', // Slate 900
  },
});

export default AppText;
