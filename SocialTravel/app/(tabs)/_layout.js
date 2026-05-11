import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react-native';
import { Colors } from '@/src/constants/theme';
import { View, DeviceEventEmitter } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import CreatePostSheet from '@/src/components/social/CreatePostSheet';

export default function TabLayout() {
  const { user } = useAuth();
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('OPEN_CREATE_POST', () => {
      bottomSheetRef.current?.expand();
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.black,
          tabBarInactiveTintColor: '#BBBBBB',
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            height: 75,
            paddingTop: 10,
            paddingBottom: 25,
            backgroundColor: Colors.white,
            borderTopWidth: 0.5,
            borderTopColor: '#EEEEEE',
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Home size={28} color={color} fill={focused ? color : 'transparent'} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            tabBarIcon: ({ color }) => (
              <Search size={28} color={color} strokeWidth={2.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            tabBarIcon: ({ color }) => (
              <View style={{
                width: 72,
                height: 48,
                backgroundColor: '#F2F2F2',
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <PlusSquare size={35} color={color} strokeWidth={2} />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              bottomSheetRef.current?.expand();
            },
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Heart size={28} color={color} fill={focused ? color : 'transparent'} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <User size={28} color={color} fill={focused ? color : 'transparent'} />
            ),
          }}
        />
      </Tabs>

      <CreatePostSheet 
        innerRef={bottomSheetRef} 
        user={user} 
        onPost={() => DeviceEventEmitter.emit('REFRESH_FEED')} 
      />
    </View>
  );
}
