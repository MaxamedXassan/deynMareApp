import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// 1. Soo jiid useTheme hook-ga
import { useTheme } from '../context/ThemeContext';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    kuguMaqan: 0,
    lagaaLeeyahay: 0,
    totalTransactions: 0,
    activeCustomers: 0
  });

  // 2. Hel theme-ka guud ee App-ka
  const { theme, isDark } = useTheme();

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: debts, error: debtError } = await supabase
        .from('debts')
        .select('amount, type')
        .eq('user_id', user.id);

      const { count: customerCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (debts) {
        let maqan = 0;
        let leeyahay = 0;

        debts.forEach(d => {
          if (d.type === 'kugu_maqan') maqan += parseFloat(d.amount);
          else leeyahay += parseFloat(d.amount);
        });

        setStats({
          kuguMaqan: maqan,
          lagaaLeeyahay: leeyahay,
          totalTransactions: debts.length,
          activeCustomers: customerCount || 0
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  const netBalance = stats.kuguMaqan - stats.lagaaLeeyahay;

  return (
    // 3. Isticmaal theme.background
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Warbixinta Guud</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.primary} 
            colors={[theme.primary]} 
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Main Balance Card (Midabkiisu wuu isbeddelaa hadba dhibicda lacagta) */}
            <View style={[styles.mainCard, { backgroundColor: netBalance >= 0 ? theme.primary : '#EF4444' }]}>
              <Text style={styles.mainLabel}>Deynta Kaa Maqan (Net)</Text>
              <Text style={styles.mainAmount}>${netBalance.toLocaleString()}</Text>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Macaamiisha</Text>
                  <Text style={styles.statValue}>{stats.activeCustomers}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Dhaqdhaqaaqa</Text>
                  <Text style={styles.statValue}>{stats.totalTransactions}</Text>
                </View>
              </View>
            </View>

            {/* Split Cards */}
            <View style={styles.splitRow}>
              <View style={[styles.splitCard, styles.greenCard, { backgroundColor: theme.card }]}>
                <Ionicons name="arrow-down-circle" size={24} color="#10B981" />
                <Text style={[styles.splitLabel, { color: theme.subText }]}>Kaa Maqan</Text>
                <Text style={styles.greenAmount}>${stats.kuguMaqan.toLocaleString()}</Text>
              </View>

              <View style={[styles.splitCard, styles.redCard, { backgroundColor: theme.card }]}>
                <Ionicons name="arrow-up-circle" size={24} color="#EF4444" />
                <Text style={[styles.splitLabel, { color: theme.subText }]}>Labixiyay</Text>
                <Text style={styles.redAmount}>${stats.lagaaLeeyahay.toLocaleString()}</Text>
              </View>
            </View>

            {/* Advice Section */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.subText} />
              <Text style={[styles.infoText, { color: theme.subText }]}>
                Xogtan waxaa laga soo xigtay dhammaan macaamiishaada iyo deynta u diiwaangashan.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  mainCard: { padding: 25, borderRadius: 30, elevation: 5, marginBottom: 20 },
  mainLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' },
  mainAmount: { color: '#fff', fontSize: 38, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  splitCard: { flex: 0.48, padding: 20, borderRadius: 20, elevation: 2, alignItems: 'center' },
  greenCard: { borderTopWidth: 4, borderTopColor: '#10B981' },
  redCard: { borderTopWidth: 4, borderTopColor: '#EF4444' },
  splitLabel: { fontSize: 12, marginTop: 10 },
  greenAmount: { fontSize: 18, fontWeight: 'bold', color: '#10B981', marginTop: 5 },
  redAmount: { fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginTop: 5 },
  infoBox: { flexDirection: 'row', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 10, fontSize: 12, lineHeight: 18 }
});