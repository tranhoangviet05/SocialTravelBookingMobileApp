import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.circle.fill': 'chevron-left',
  'chevron.right': 'chevron-right',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}) {
  return <MaterialIcons color={color} name={MAPPING[name]} size={size} style={style} />;
}
