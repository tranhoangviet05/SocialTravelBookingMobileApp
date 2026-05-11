import { SymbolView } from 'expo-symbols';
import React from 'react';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}) {
  return (
    <SymbolView
      colors={color}
      name={name}
      size={size}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      type="primary"
    />
  );
}
