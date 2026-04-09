import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [totalIn, setTotalIn] = useState(0); // Lacagta kugu maqan
  const [totalOut, setTotalOut] = useState(0); // Lacagta lagaa leeyahay

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserProfile(user.user_metadata);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Soo dhawaaw,</Text>
            <Text style={styles.userName}>{userProfile?.full_name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>Wadarta Guud</Text>
          <Text style={styles.totalAmount}>${totalIn - totalOut}</Text>
          
          <View style={styles.row}>
            <View style={styles.statItem}>
              <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statLabel}>Kugu Maqan</Text>
                <Text style={styles.statAmount}>${totalIn}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Ionicons name="arrow-up-circle" size={20} color="#EF4444" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.statLabel}>Lagaa Leeyahay</Text>
                <Text style={styles.statAmount}>${totalOut}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Deymihii ugu dambeeyay</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Arag dhamaantood</Text>
          </TouchableOpacity>
        </View>

        {/* Liiska wuxuu soo baxayaa markaan dhisno Table-ka Database-ka */}
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={50} color="#CBD5E1" />
          <Text style={styles.emptyText}>Weli wax deyn ah ma diiwaangashan.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 20 
  },
  welcomeText: { fontSize: 14, color: '#64748B' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  notifButton: { backgroundColor: '#fff', padding: 10, borderRadius: 12, elevation: 2 },
  mainCard: { 
    backgroundColor: '#1E293B', 
    margin: 20, 
    borderRadius: 24, 
    padding: 25, 
    elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  cardLabel: { color: '#94A3B8', fontSize: 14, marginBottom: 5 },
  totalAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statLabel: { color: '#94A3B8', fontSize: 12 },
  statAmount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { width: 1, height: 30, backgroundColor: '#334155' },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginTop: 10 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  seeAll: { color: '#3B82F6', fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', marginTop: 10, fontSize: 14 }
});