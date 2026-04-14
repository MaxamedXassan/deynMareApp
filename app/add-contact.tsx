import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function AddContact() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    // 1. Magaca oo qasab ah
    if (!name.trim()) {
      Alert.alert("Khalad", "Fadlan qor magaca macmiilka");
      return;
    }
    
    // 2. Taleefanka oo hadda qasab laga dhigay
    if (!phone.trim()) {
      Alert.alert("Khalad", "Fadlan qor lambarka taleefanka macmiilka");
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("Fadlan dib u log-in garee.");

      const { error: insertError } = await supabase
        .from('contacts')
        .insert([{ 
          user_id: user.id, 
          contact_name: name.trim(), 
          contact_phone: phone.trim() 
        }]);

      if (insertError) throw insertError;

      Alert.alert("Guul", "Macmiilka waa la keydiyay!");
      router.back();

    } catch (error: any) {
      console.log("Full Error:", error);
      Alert.alert("Khalad Database", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* Header la hagaajiyay oo hal xariiq ah */}
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={26} color="#1E293B" />
              <Text style={styles.headerTitle}>Ku Dar Macmiil</Text>
            </TouchableOpacity>
          </View> */}

          <View style={styles.card}>
            <Text style={styles.label}>Magaca Macmiilka</Text>
            <TextInput 
              placeholder="Magaca oo buuxa" 
              value={name} 
              onChangeText={setName} 
              style={styles.input} 
            />

            <Text style={styles.label}>Taleefanka (Qasab)</Text>
            <TextInput 
              placeholder="61xxxxxxx" 
              value={phone} 
              onChangeText={setPhone} 
              style={styles.input} 
              keyboardType="phone-pad"
            />

            <TouchableOpacity 
              style={[styles.saveBtn, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleSave} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Keydi Macmiilka</Text>
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
  header: { marginBottom: 25, marginTop: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' }, // Arrow-ga iyo Qoraalka isku xir
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 12, color: '#1E293B' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#475569' },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, color: '#1E293B' },
  saveBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});