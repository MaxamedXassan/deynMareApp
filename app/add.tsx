import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AddDebt() {
  const { contactId, contactName } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('kugu_maqan');
  const [description, setDescription] = useState('');
  const router = useRouter();

  async function save() {
    if (!amount) return Alert.alert("Error", "Gali lacagta");
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('debts').insert([{ user_id: user?.id, contact_id: contactId, amount: parseFloat(amount), type, description }]);
    router.back();
  }

  return (
    <View style={{ flex: 1, padding: 30, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Deyn bixinta: <Text style={{fontWeight:'bold'}}>{contactName}</Text></Text>
      <TextInput placeholder="Lacagta ($)" keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />
      <TextInput placeholder="Maxay ku saabsan tahay?" value={description} onChangeText={setDescription} style={styles.input} />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => setType('kugu_maqan')} style={[styles.typeBtn, type === 'kugu_maqan' && { backgroundColor: '#10B981' }]}><Text style={{ color: '#fff' }}>Kugu Maqan</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setType('lagaa_leeyahay')} style={[styles.typeBtn, type === 'lagaa_leeyahay' && { backgroundColor: '#EF4444' }]}><Text style={{ color: '#fff' }}>Lagaa Leeyahay</Text></TouchableOpacity>
      </View>
      <TouchableOpacity onPress={save} style={styles.saveBtn}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Keydi Deynta</Text></TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, marginBottom: 10 },
  typeBtn: { flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#94A3B8', alignItems: 'center' },
  saveBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 12, alignItems: 'center' }
});