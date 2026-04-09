import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getInitialData();
  }, []);

  async function getInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }

  async function handleUpdate() {
    setLoading(true);
    
    // 1. Diyaarinta xogta isbeddelaysa
    const updateData: any = {
      data: { full_name: fullName }
    };

    if (email !== '') updateData.email = email.trim();
    if (password !== '') updateData.password = password;

    // 2. Ku diridda Supabase
    const { error } = await supabase.auth.updateUser(updateData);

    if (error) {
      Alert.alert("Khalad", error.message);
    } else {
      Alert.alert("Guul", "Xogtaada waa la cusboonaysiiyay!");
      // Haddii email la beddelay, Supabase waxay u baahan kartaa xaqiijin email
      router.back();
    }
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beddel Profile-ka</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Magaca oo buuxa</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#64748B" />
          <TextInput 
            value={fullName} 
            onChangeText={setFullName} 
            style={styles.input} 
          />
        </View>

        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#64748B" />
          <TextInput 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input} 
          />
        </View>

        <Text style={styles.label}>Password Cusub (Haddii aad rabto)</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
          <TextInput 
            placeholder="Geli password cusub"
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            style={styles.input} 
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && { opacity: 0.7 }]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Cusboonaysii Profile</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, backgroundColor: '#fff', paddingTop: 50 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 15 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15 
  },
  input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16, color: '#1E293B' },
  saveButton: { 
    backgroundColor: '#1E293B', padding: 16, borderRadius: 12, 
    alignItems: 'center', marginTop: 30, elevation: 2 
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});