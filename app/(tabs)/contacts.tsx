import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [])
  );

  async function fetchContacts() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Waxaan soo qaadaynaa macaamiisha iyo dhammaan deyntooda si aan u xisaabino
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        id, 
        contact_name, 
        contact_phone, 
        debts (amount, type)
      `)
      .eq('user_id', user?.id);
    
    if (data) {
      const formatted = data.map(c => {
        let total = 0;
        c.debts?.forEach((d: any) => {
          // Haddii ay tahay kugu_maqan waa (+), haddii ay tahay lagaa_leeyahay waa (-)
          total += d.type === 'kugu_maqan' ? parseFloat(d.amount) : -parseFloat(d.amount);
        });
        return { ...c, totalBalance: total };
      });
      setContacts(formatted);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Liiska</Text>
          <Text style={styles.title}>Macaamiisha</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-contact')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Ma jiro macmiil la keydiyay.</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push({ 
              pathname: "/contact-details", 
              params: { id: item.id, name: item.contact_name, phone: item.contact_phone } 
            })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.contact_name[0].toUpperCase()}</Text>
            </View>
            
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.contactName}>{item.contact_name}</Text>
              <Text style={styles.contactPhone}>{item.contact_phone || 'No phone'}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.balance, { color: item.totalBalance >= 0 ? '#10B981' : '#EF4444' }]}>
                {item.totalBalance >= 0 ? `$${item.totalBalance.toFixed(2)}` : `-$${Math.abs(item.totalBalance).toFixed(2)}`}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' },
  welcomeText: { fontSize: 14, color: '#64748B' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  addBtn: { backgroundColor: '#3B82F6', width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 20 },
  contactName: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  contactPhone: { fontSize: 13, color: '#64748B', marginTop: 2 },
  balance: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  empty: { textAlign: 'center', marginTop: 50, color: '#94A3B8' }
});