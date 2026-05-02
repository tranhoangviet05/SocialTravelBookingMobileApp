import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SyncLoadingScreen from '../screens/SyncLoadingScreen';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator: Quản lý luồng đã đăng nhập
 * Màn hình đầu tiên luôn là SyncLoading để đảm bảo dữ liệu đã khớp với Postgres
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SyncLoading"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SyncLoading" component={SyncLoadingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
