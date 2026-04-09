import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6', 
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarStyle: {
          // --- HABKA 2AAD (Floating Tabs) ---
          position: 'absolute',     // Ka dhig mid sabaynaya
          bottom: 20,               // Kor uga qaad gunta hoose (meesha looga laabto)
          left: 20,                 // Boos ka bixi dhinaca bidix
          right: 20,                // Boos ka bixi dhinaca midig
          backgroundColor: '#FFFFFF',
          borderRadius: 20,         // Geesaha u soo wareeji
          height: 65,
          borderTopWidth: 0,        // Xariiqda sare ee caadiga ahayd ka saar
          
          // Shadow si uu u muuqdo mid sare u kacay (Android & iOS)
          elevation: 5, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          // ----------------------------------
          
          // Hubi in padding-ku uusan hoos u dhicin
          paddingBottom: Platform.OS === 'ios' ? 0 : 0, 
        },
        tabBarItemStyle: {
          height: 60, // Si icon-nada ay ugu dhex jiraan baarka dhexdiisa
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Ku Dar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}