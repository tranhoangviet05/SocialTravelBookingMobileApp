import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Eye, EyeOff } from 'lucide-react-native';

const CustomInput = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, error }) => {
  const inputContainerRef = useRef(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => {
    if (inputContainerRef.current) {
      inputContainerRef.current.setNativeProps({
        style: { borderColor: Colors.primary, shadowOpacity: 0.1 }
      });
    }
  };

  const handleBlur = () => {
    if (inputContainerRef.current) {
      inputContainerRef.current.setNativeProps({
        style: { borderColor: error ? Colors.danger : Colors.border, shadowOpacity: 0 }
      });
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        ref={inputContainerRef}
        style={[styles.inputContainer, error && styles.inputError]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          // Nếu là password thì dùng state để toggle
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {/* Nút Hiển thị mật khẩu */}
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
            {isPasswordVisible ? (
              <EyeOff size={20} color={Colors.textSecondary} />
            ) : (
              <Eye size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 56,
    paddingHorizontal: Typography.spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0,
    elevation: 0,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.body,
    color: Colors.text,
    height: '100%',
  },
  iconContainer: {
    padding: 8,
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
