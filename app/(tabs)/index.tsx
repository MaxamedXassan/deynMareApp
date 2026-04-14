import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react'; // Waxaan ku daray useMemo
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput // Waxaan ku daray TextInput
  ,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function DebtsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // State-ka baaritaanka
  const [totalAll, setTotalAll] = useState(0);
  const [userName, setUserName] = useState<string | null>('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const state = await NetInfo.fetch();
    setIsOffline(!state.isConnected);

    if (state.isConnected) {
      fetchFromSupabase();
    } else {
      loadFromCache();
    }
  };

  const fetchFromSupabase = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0];
        setUserName(fullName);
      }

      const { data, error } = await supabase
        .from('contacts')
        .select(`id, contact_name, contact_phone, debts (amount, type)`) // Ku dar 'type' si xisaabtu u saxanto
        .eq('user_id', user?.id);

      if (data) {
        let overallTotal = 0;
        const formatted = data.map(c => {
          let contactTotal = 0;
          // Halkan waxaan ku saxay xisaabta (Plus/Minus)
          c.debts?.forEach((d: any) => {
             if(d.type === 'kugu_maqan') contactTotal += parseFloat(d.amount);
             else contactTotal -= parseFloat(d.amount);
          });
          overallTotal += contactTotal;
          return { ...c, totalBalance: contactTotal };
        });

        setContacts(formatted);
        setTotalAll(overallTotal);

        await AsyncStorage.setItem('cached_contacts', JSON.stringify(formatted));
        await AsyncStorage.setItem('cached_total_sum', overallTotal.toString());
        await AsyncStorage.setItem('cached_user_name', userName || '');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFromCache = async () => {
    const cachedData = await AsyncStorage.getItem('cached_contacts');
    const cachedTotal = await AsyncStorage.getItem('cached_total_sum');
    const cachedName = await AsyncStorage.getItem('cached_user_name');

    if (cachedData) setContacts(JSON.parse(cachedData));
    if (cachedTotal) setTotalAll(parseFloat(cachedTotal));
    if (cachedName) setUserName(cachedName);
    
    setLoading(false);
    setRefreshing(false);
  };

  // Habka baaritaanka (Loo sifeeyay Magac iyo Lambar)
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const nameMatch = contact.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = contact.contact_phone?.includes(searchQuery);
      return nameMatch || phoneMatch;
    });
  }, [searchQuery, contacts]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.userGreeting}>Ku soo dhawaaw,</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="person-circle-outline" size={38} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Wadarta Lacagta Maqan</Text>
        <Text style={styles.heroAmount}>${totalAll.toLocaleString()}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.badgeText}>{isOffline ? 'Offline Mode' : 'Online Mode'}</Text>
        </View>
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Raadi macmiil ama lambar..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Macaamiisha</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredContacts} // Waxaan isticmaalnay liiska la sifeeyay
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} color="#3B82F6" />
          }
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
              <View style={styles.amountContainer}>
                <Text style={[styles.contactAmount, { color: item.totalBalance >= 0 ? '#10B981' : '#EF4444' }]}>
                  ${item.totalBalance.toFixed(2)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#94A3B8' }}>Lama helin macmiil waafaqsan raadintaada.</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/add-contact')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  userGreeting: { fontSize: 13, color: '#64748B' },
  userNameText: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  profileBtn: { paddingLeft: 10 },
  heroCard: { backgroundColor: '#3B82F6', marginHorizontal: 20, marginBottom: 15, padding: 25, borderRadius: 30, alignItems: 'center', elevation: 5 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  
  // Search Styles
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    borderRadius: 18, 
    height: 55,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginLeft: 22, marginBottom: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12, alignItems: 'center', elevation: 1 },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 18 },
  contactName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  contactPhone: { fontSize: 13, color: '#64748B' },
  amountContainer: { alignItems: 'flex-end' },
  contactAmount: { fontSize: 16, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#1E293B', width: 65, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8 }
});