import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';

const Toast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  const slideAnim = useRef(new Animated.Value(-100)).current;

  useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'success') => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);
      
      Animated.spring(slideAnim, {
        toValue: 50,
        useNativeDriver: true,
      }).start();
      
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 3000);
    },
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: type === 'success' ? Colors.success : Colors.danger,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        {type === 'success' ? (
          <CheckCircle2 color={Colors.white} size={20} />
        ) : (
          <AlertCircle color={Colors.white} size={20} />
        )}
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: Typography.spacing.lg,
    right: Typography.spacing.lg,
    padding: Typography.spacing.md,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.medium,
    marginLeft: Typography.spacing.sm,
    flex: 1,
  },
});

export default Toast;
