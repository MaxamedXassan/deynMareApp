import { Session } from '@supabase/supabase-js';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationBarBehavior } from 'expo-navigation-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// 1. Soo jiid ThemeProvider-ka aad hadda samaysay
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Navigation Bar (Android Settings)
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync('sticky-swipe' as NavigationBarBehavior);
    }
  }, []);

  // Auth Session Management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Auth Guard
  useEffect(() => {
    if (!initialized) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const isOutsidePage = [
      'add-contact', 
      'contact-details', 
      'add', 
      'edit-profile'
    ].includes(segments[0]);

    const isInsideApp = inTabsGroup || isOutsidePage;

    if (!session && isInsideApp) {
      router.replace('/');
    } else if (session && !isInsideApp) {
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return (
    // 2. Ku duub ThemeProvider dhammaan Stack-ka
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Boggaga ka hor Login-ka */}
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />

        {/* Bogga ugu weyn (Dashboard) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Boggaga bannaanka yaal (Modals & Stacks) */}
        <Stack.Screen 
          name="add-contact" 
          options={{ 
            presentation: 'modal', 
            headerShown: true, 
            title: 'Ku Dar Macmiil' 
          }} 
        />
        
        <Stack.Screen 
          name="contact-details" 
          options={{ 
            headerShown: false, 
            title: 'Xogta Macmiilka' 
          }} 
        />

        <Stack.Screen 
          name="add" 
          options={{ 
            presentation: 'modal', 
            headerShown: true, 
            title: 'Deyn Cusub' 
          }} 
        />

        <Stack.Screen 
          name="edit-profile" 
          options={{ 
            headerShown: true, 
            title: 'Beddel Profile' 
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}