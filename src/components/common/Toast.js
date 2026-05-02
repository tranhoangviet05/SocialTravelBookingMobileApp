import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const Toast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success'); // 'success' | 'error'

  useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'success') => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    },
  }));

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 50 }}
          exit={{ opacity: 0, translateY: -50 }}
          style={[
            styles.container,
            { backgroundColor: type === 'success' ? Colors.success : Colors.danger }
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
        </MotiView>
      )}
    </AnimatePresence>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
