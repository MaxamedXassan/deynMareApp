import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getUserData();
  }, []);

  async function getUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    }
  }

  async function handleLogout() {
    Alert.alert(
      "Ka Bax",
      "Ma hubaal madaa inay aad rabto inaad ka baxdo app-ka?",
      [
        { text: "Iska daa", style: "cancel" },
        { 
          text: "Haa, ka bax", 
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Khalad', error.message);
            } else {
              router.replace('/');
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.user_metadata?.full_name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>XULASHADA</Text>

        {/* Menu Items */}
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="person-outline" size={22} color="#1E293B" />
              <Text style={styles.menuText} onPress={() => router.push('/edit-profile')}>Beddel Profile-ka</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#1E293B" />
              <Text style={styles.menuText}>Amniga (Security)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={22} color="#1E293B" />
              <Text style={styles.menuText}>Ogeysiisyada (Notifications)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Ka Bax App-ka</Text>
        </TouchableOpacity>

        <Text style={styles.version}>DeynMaare v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 20 },
  profileCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    padding: 20, borderRadius: 20, marginBottom: 30, elevation: 2 
  },
  avatar: { 
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E293B', 
    justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  profileInfo: { marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  userEmail: { fontSize: 14, color: '#64748B', marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginBottom: 10, marginLeft: 5 },
  menuGroup: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 16, color: '#1E293B', marginLeft: 12 },
  logoutButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#fff', padding: 16, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#FEE2E2' 
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  version: { textAlign: 'center', color: '#CBD5E1', marginTop: 30, fontSize: 12 }
});