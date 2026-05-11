import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 430;

export function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// Đồng bộ với ứng dụng Booking
export const Colors = {
  primary: '#00AEEF',      // Xanh Cyan - màu chủ đạo
  secondary: '#FF8C00',    // Cam - màu phụ
  tertiary: '#EA8C21',     // Cam đậm

  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',

  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  neutral: '#F2F4F5',
  input: '#F2F4F5',

  text: '#1C1C1E',
  textSecondary: '#4B5563',
  placeholder: '#9CA3AF',

  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Translucent
  primaryLight: 'rgba(0, 174, 239, 0.1)',
  secondaryLight: 'rgba(255, 140, 0, 0.1)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Typography = {
  fontFamily: {
    regular: 'Quicksand-Regular',
    medium: 'Quicksand-Medium',
    semiBold: 'Quicksand-SemiBold',
    bold: 'Quicksand-Bold',
  },
  fontSize: {
    xs: normalize(12),
    sm: normalize(14),
    base: normalize(16),
    lg: normalize(18),
    xl: normalize(20),
    xxl: normalize(24),
    huge: normalize(32),
    h1: normalize(34),
    h2: normalize(28),
    h3: normalize(22),
    body: normalize(17),
    caption: normalize(15),
    small: normalize(13),
  },
};

export const Shadow = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
};
