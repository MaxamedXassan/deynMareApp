import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// 1. Soo jiid useTheme hook-ga
import { useTheme } from '../context/ThemeContext';

interface Contact {
  id: string;
  contact_name: string;
  contact_phone: string;
  totalBalance: number;
  debts?: any[];
}

export default function DebtsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalAll, setTotalAll] = useState(0);
  const [userName, setUserName] = useState<string | null>('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // 2. Hel theme-ka guud ee App-ka
  const { theme, isDark } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const state = await NetInfo.fetch();
    setIsOffline(!state.isConnected);
    setSearchQuery('');
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
        .select(`id, contact_name, contact_phone, debts (amount, type)`)
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        let overallTotal = 0;
        const formatted: Contact[] = data.map((c: any) => {
          let contactTotal = 0;
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
      console.log("Fetch Error:", e);
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
    if (cachedTotal) setTotalAll(parseFloat(cachedTotal || '0'));
    if (cachedName) setUserName(cachedName);
    
    setLoading(false);
    setRefreshing(false);
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    if (isOffline) {
      Alert.alert("Error", "Macmiilka ma tirtiri kartid adigoo Offline ah.");
      return;
    }

    Alert.alert(
      "Delete",
      `Ma hubtaa inaad tirtirayso ${contactName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from('contacts').delete().eq('id', contactId);
              if (error) throw error;
              fetchFromSupabase();
            } catch (e: any) {
              Alert.alert("Khalad", e.message);
            }
          }
        }
      ]
    );
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const nameMatch = contact.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = contact.contact_phone?.includes(searchQuery);
      return nameMatch || phoneMatch;
    });
  }, [searchQuery, contacts]);

  return (
    // 3. Isticmaal theme.background
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.userGreeting, { color: theme.subText }]}>Ku soo dhawaaw,</Text>
          <Text style={[styles.userNameText, { color: theme.text }]}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="person-circle-outline" size={38} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
        <Text style={styles.heroLabel}>Wadarta Lacagta Maqan</Text>
        <Text style={styles.heroAmount}>${totalAll.toLocaleString()}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.badgeText}>{isOffline ? 'Offline Mode' : 'Online Mode'}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.subText} />
          <TextInput
            placeholder="Raadi macmiil ama lambar..."
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.subText}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.subText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Macaamiisha</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={loadData} 
              colors={[theme.primary]} 
              tintColor={theme.primary} 
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => router.push({ 
                pathname: "/contact-details", 
                params: { id: item.id, name: item.contact_name, phone: item.contact_phone } 
              })}
              onLongPress={() => handleDeleteContact(item.id, item.contact_name)}
            >
              <View style={[styles.avatar, { backgroundColor: isDark ? '#334155' : '#EFF6FF' }]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>{item.contact_name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.contactName, { color: theme.text }]}>{item.contact_name}</Text>
                <Text style={[styles.contactPhone, { color: theme.subText }]}>{item.contact_phone || 'Lambar ma laha'}</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={[styles.contactAmount, { color: item.totalBalance >= 0 ? '#10B981' : '#EF4444' }]}>
                  ${item.totalBalance.toFixed(2)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.subText} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: theme.subText }}>
                {searchQuery ? 'Macmiilkaas lama helin.' : 'Ma jiro macmiil kuu diiwaangashan.'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: isDark ? theme.primary : '#1E293B' }]} 
        onPress={() => router.push('/add-contact')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  userGreeting: { fontSize: 13 },
  userNameText: { fontSize: 20, fontWeight: 'bold' },
  profileBtn: { paddingLeft: 10 },
  heroCard: { marginHorizontal: 20, marginBottom: 15, padding: 25, borderRadius: 30, alignItems: 'center', elevation: 5 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 18, height: 55, borderWidth: 1, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 22, marginBottom: 15 },
  card: { flexDirection: 'row', padding: 15, borderRadius: 20, marginBottom: 12, alignItems: 'center', elevation: 1 },
  avatar: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: 'bold', fontSize: 18 },
  contactName: { fontSize: 16, fontWeight: 'bold' },
  contactPhone: { fontSize: 13 },
  amountContainer: { alignItems: 'flex-end' },
  contactAmount: { fontSize: 16, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8 }
});