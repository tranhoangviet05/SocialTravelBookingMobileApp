import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tỉ lệ scale dựa trên iPhone 15 Pro Max (width ~430) 
// để tối ưu cho các dòng 6.7 inch.
const scale = SCREEN_WIDTH / 430;

export function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'Quicksand-Regular',
    medium: 'Quicksand-Medium',
    semibold: 'Quicksand-SemiBold',
    bold: 'Quicksand-Bold',
  },
  // Font Sizes - Được normalize để tự động to ra trên màn hình lớn
  size: {
    h1: normalize(34),    // Tiêu đề lớn
    h2: normalize(28),
    h3: normalize(22),
    body: normalize(17),  // Cỡ chữ chuẩn iOS cho màn hình lớn
    caption: normalize(15),
    small: normalize(13),
  },
  
  // Font Weights
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Spacing (Padding/Margin) hữu ích cho layout Pro Max
  spacing: {
    xs: normalize(4),
    sm: normalize(8),
    md: normalize(16),
    lg: normalize(24),
    xl: normalize(32),
  },
  getFont: (weight = 'regular') => {
    const fonts = {
      regular: 'Quicksand-Regular',
      medium: 'Quicksand-Medium',
      semibold: 'Quicksand-SemiBold',
      bold: 'Quicksand-Bold',
    };
    return { fontFamily: fonts[weight] || fonts.regular };
  }
};
