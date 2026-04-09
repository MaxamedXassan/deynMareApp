import { Session } from '@supabase/supabase-js';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Hubi halka uu ku jiro supabase.ts

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Markuu app-ku bilowdo, soo qaado session-ka hadda jira
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // 2. La soco isbeddel kasta (Login, Logout, ama Session expired)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth State Changed:", _event);
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // Segment[0] wuxuu kuu sheegayaa galka aad ku jirto (tusaale: (tabs))
    const inAuthGroup = segments[0] === '(tabs)';

    if (!session && inAuthGroup) {
      // Haddii qofku uusan Login ahayn, kuna jiro Tabs-ka -> u tuur Login-ka
      router.replace('/');
    } else if (session && !inAuthGroup) {
      // Haddii qofku Login yahay, balse uu joogo Login/Signup -> u tuur Dashboard-ka
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Edit Profile oo ka baxsan Tabs-ka */}
      <Stack.Screen name="edit-profile" options={{ title: 'Beddel Profile', headerShown: true }} />
    </Stack>
  );
}