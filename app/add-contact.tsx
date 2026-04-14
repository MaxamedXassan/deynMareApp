import { Ionicons } from '@expo/vector-icons';
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
// Kani waa SafeArea-ga saxda ah
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function AddContact() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Khalad", "Fadlan qor magaca macmiilka");
      return;
    }

    setLoading(true);
    try {
      // Isticmaalka getUser() waa midka ugu badbaadada badan
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ku Dar Macmiil</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Magaca Macmiilka</Text>
            <TextInput 
              placeholder="Magaca oo buuxa" 
              value={name} 
              onChangeText={setName} 
              style={styles.input} 
            />

            <Text style={styles.label}>Taleefanka</Text>
            <TextInput 
              placeholder="61xxxxxxx" 
              value={phone} 
              onChangeText={setPhone} 
              style={styles.input} 
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Keydi Macmiilka</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 3 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#475569' },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16 },
  saveBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});