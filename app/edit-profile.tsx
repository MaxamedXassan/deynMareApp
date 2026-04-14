import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Aad u muhiim ah
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert("Khalad", "Fadlan geli magacaaga oo buuxa");
      return;
    }

    setLoading(true);
    try {
      // 1. Cusboonaysii Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      });

      if (error) throw error;

      // 2. Cusboonaysii Cache-ka maxalliga ah si boggaga kale u helaan magaca cusub isla markaba
      await AsyncStorage.setItem('cached_user_name', fullName.trim());

      Alert.alert("Guul", "Profile-kaaga waa la cusboonaysiiyay!");
      
      // 3. Dib u laabo - Index page wuxuu hadda arki doonaa magaca cusub
      router.back();
    } catch (error: any) {
      Alert.alert("Khalad", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* Header la mid ah Add Contact */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={26} color="#1E293B" />
              <Text style={styles.headerTitle}>Beddel Profile-ka</Text>
            </TouchableOpacity>
          </View>

          {/* Card-ka Form-ka */}
          <View style={styles.card}>
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <Text style={styles.avatarHint}>Sawirka hadda lama beddeli karo</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Magaca oo Buuxa</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Geli magacaaga"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (Lama beddeli karo)</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
              />
            </View>

            <TouchableOpacity 
              style={[styles.updateBtn, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 30, marginTop: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 12, color: '#1E293B' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 25, elevation: 4 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 85, height: 85, borderRadius: 30, backgroundColor: '#3B82F615', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#3B82F6', fontSize: 32, fontWeight: 'bold' },
  avatarHint: { fontSize: 11, color: '#94A3B8' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#475569' },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  disabledInput: { backgroundColor: '#F8FAFC', color: '#94A3B8', borderColor: '#F1F5F9' },
  updateBtn: { backgroundColor: '#1E293B', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  updateBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});