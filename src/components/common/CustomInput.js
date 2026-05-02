import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const CustomInput = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, error }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Typography.spacing.md,
  },
  label: {
    fontSize: Typography.size.caption,
    color: Colors.textSecondary,
    marginBottom: Typography.spacing.xs,
    fontWeight: Typography.weight.medium,
    paddingLeft: 4,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 56, // Chiều cao tối ưu cho Pro Max
    justifyContent: 'center',
    paddingHorizontal: Typography.spacing.xl + 10,
  },
  input: {
    fontSize: Typography.size.body,
    color: Colors.text,
    width: '100%',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: Typography.size.small,
    color: Colors.danger,
    marginTop: Typography.spacing.xs,
    paddingLeft: 4,
  },
});

export default CustomInput;
