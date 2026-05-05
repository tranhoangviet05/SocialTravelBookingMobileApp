import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Calendar, Compass, User } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

const TAB_HEIGHT = 68;
const INNER_HEIGHT = 56; // Chiều cao thực của mỗi nút bên trong

const TABS = [
  { name: 'Tìm kiếm', Icon: Search },
  { name: 'Đặt chỗ', Icon: Calendar },
  { name: 'Khám phá', Icon: Compass },
  { name: 'Tài khoản', Icon: User },
];

// Màu active: nền xanh nhạt, chữ/icon xanh đậm
const ACTIVE_BG = Colors.primary + '22';   // ~13% opacity
const ACTIVE_COLOR = Colors.primary;        // Xanh đậm

const FloatingTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 20;

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]}>
      {/* Khung floating trắng */}
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { Icon } = TABS[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabButton,
                isFocused && styles.tabButtonActive,
              ]}
            >
              <Icon
                color={isFocused ? ACTIVE_COLOR : Colors.textSecondary}
                size={22}
              />
              <Text style={[
                styles.label,
                { color: isFocused ? ACTIVE_COLOR : Colors.textSecondary }
              ]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 15,
    right: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  container: {
    height: TAB_HEIGHT,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 34,
    padding: 6,          // Padding bên trong để nút không dính mép
    gap: 4,              // Khoảng cách giữa các nút
  },
  tabButton: {
    flex: 1,
    height: INNER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,    // Bo góc TẤT CẢ các nút
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: ACTIVE_BG, // Nền xanh nhạt
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '700',
  },
});

export default FloatingTabBar;
