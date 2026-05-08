import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SyncLoadingScreen from '../screens/SyncLoadingScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { BookingScreen, ExploreScreen } from '../screens/PlaceholderScreens';
import FloatingTabBar from '../components/navigation/FloatingTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      // Dùng custom tab bar để kiểm soát hoàn toàn giao diện
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Tìm kiếm" component={HomeScreen} />
      <Tab.Screen name="Đặt chỗ" component={BookingScreen} />
      <Tab.Screen name="Khám phá" component={ExploreScreen} />
      <Tab.Screen name="Tài khoản" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

import WishlistScreen from '../screens/WishlistScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SyncLoading"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SyncLoading" component={SyncLoadingScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
