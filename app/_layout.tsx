import { Session } from '@supabase/supabase-js';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase'; // Hubi jidka (path) inuu sax yahay

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // 1. Navigation Bar (Android Settings)
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("sticky-swipe");
    }
  }, []);

  // 2. Auth Session Management
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

  // 3. XALKA DHIBKA: Auth Guard (Kani wuxuu xallinayaa inaan Dashboard-ka lagugu tuurin)
  useEffect(() => {
    if (!initialized) return;

    // Waxaan halkan ku qeexaynaa boggaga ka midka ah "Gudaha App-ka"
    const inTabsGroup = segments[0] === '(tabs)';
    const isOutsidePage = [
      'add-contact', 
      'contact-details', 
      'add', 
      'edit-profile'
    ].includes(segments[0]);

    // Haddii uu qofku ku jiro meel ka mid ah App-ka (Tabs ama boggaga bannaanka)
    const isInsideApp = inTabsGroup || isOutsidePage;

    if (!session && isInsideApp) {
      // Haddii uusan Login ahayn, isku dayayana inuu galo gudaha -> u tuur Login-ka
      router.replace('/');
    } else if (session && !isInsideApp) {
      // Haddii uu Login yahay, isku dayayana inuu aado Login/Signup -> u tuur Dashboard-ka
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Boggaga ka hor Login-ka */}
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />

      {/* Bogga ugu weyn (Dashboard) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Boggaga bannaanka yaal (Modal ama Stack) */}
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
          headerShown: false, // Maadaama aan gudaha ku diyaarsanay Header
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
  );
}