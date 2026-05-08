import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

const AppText = (props) => {
  const { style, children, ...rest } = props;
  
  // Phân tích style để tìm fontWeight
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const isBold = flattenedStyle.fontWeight === 'bold' || flattenedStyle.fontWeight === '700' || flattenedStyle.fontWeight === '800';
  const isSemiBold = flattenedStyle.fontWeight === '600' || flattenedStyle.fontWeight === '500';

  const customStyle = {
    fontFamily: isBold ? 'Quicksand-Bold' : (isSemiBold ? 'Quicksand-SemiBold' : 'Quicksand-Regular'),
  };

  // Loại bỏ fontWeight để tránh xung đột trên Android
  const finalStyle = [customStyle, style];
  if (isBold || isSemiBold) {
    // Nếu truyền mảng style, chúng ta cần handle việc xóa fontWeight cẩn thận hơn
    // Nhưng đơn giản nhất là ghi đè fontFamily lên trên cùng
  }

  return (
    <RNText {...rest} style={finalStyle}>
      {children}
    </RNText>
  );
};

export default AppText;
