import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const CustomButton = ({ title, onPress, type = 'primary', style, textStyle }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'secondary': return Colors.secondary;
      case 'outline': return 'transparent';
      default: return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (type === 'outline') return Colors.primary;
    return Colors.white;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor() },
        type === 'outline' && styles.outlineBorder,
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Typography.spacing.md,
    paddingHorizontal: Typography.spacing.lg,
    borderRadius: 12, // Bo góc hiện đại
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Chiều cao tối ưu cho iPhone Pro Max
    width: '100%',
    marginVertical: Typography.spacing.sm,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
  },
});

export default CustomButton;
