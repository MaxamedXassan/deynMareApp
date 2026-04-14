import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// 1. Soo jiid useTheme hook-ga
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const [userName, setUserName] = useState<string | null>('');
  const [userEmail, setUserEmail] = useState<string | null>('');
  const router = useRouter();

  // 2. Hel theme-ka iyo function-ka beddelaya
  const { isDark, theme, toggleTheme } = useTheme();

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.full_name || 'User');
      setUserEmail(user.email || '');
    }
  };

  // 3. Shaqada Help Center (WhatsApp)
  const openHelpCenter = () => {
    const phoneNumber = "+252612642905"; // Geli lambarkaaga saxda ah
    const message = "Asc DeynMaare, waxaan u baahnahay caawinaad.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Khalad", "WhatsApp kuma rakibna telefoonkaaga.");
      }
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      "Ka Bax",
      "Ma hubtaa inaad rabto inaad ka baxdo App-ka?",
      [
        { text: "Jooji", style: "cancel" },
        { 
          text: "Haa, Ka bax", 
          style: "destructive", 
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#1E293B", showArrow = true }: any) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        {/* Isticmaal theme.text */}
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.itemSubtitle, { color: theme.subText }]}>{subtitle}</Text>}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={18} color={theme.subText} />}
    </TouchableOpacity>
  );

  return (
    // SafeAreaView hadda waxay qaadanaysaa background-ka theme-ka
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={[styles.avatarLarge, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarTextLarge}>{userName?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>{userName}</Text>
          <Text style={[styles.profileEmail, { color: theme.subText }]}>{userEmail}</Text>
          <TouchableOpacity 
            style={[styles.editBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} 
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={[styles.editBtnText, { color: theme.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={[styles.sectionLabel, { color: theme.subText }]}>PREFERENCES</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.item}>
            <View style={[styles.iconContainer, { backgroundColor: '#3B82F615' }]}>
              <Ionicons name="moon-outline" size={22} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme} // Waxay beddelaysaa theme-ka App-ka oo dhan
              trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingItem 
            icon="globe-outline" 
            title="Language" 
            subtitle="Somali (Default)"
            color="#3B82F6"
            onPress={() => {}}
          />
        </View>

        {/* Support Section */}
        <Text style={[styles.sectionLabel, { color: theme.subText }]}>SUPPORT</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <SettingItem 
            icon="help-circle-outline" 
            title="Help Center" 
            subtitle="Nala soo xiriir WhatsApp"
            color="#10B981"
            onPress={openHelpCenter}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingItem 
            icon="star-outline" 
            title="Rate the App" 
            color="#F59E0B"
            onPress={() => {}}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: isDark ? '#450a0a' : '#FEF2F2' }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.subText }]}>Version 1.0.2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  profileCard: { padding: 25, borderRadius: 25, alignItems: 'center', marginBottom: 30, elevation: 2 },
  avatarLarge: { width: 80, height: 80, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarTextLarge: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  profileName: { fontSize: 20, fontWeight: 'bold' },
  profileEmail: { fontSize: 14, marginTop: 5 },
  editBtn: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  editBtnText: { fontWeight: '600', fontSize: 14 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', marginLeft: 10, marginBottom: 10, letterSpacing: 1 },
  sectionCard: { borderRadius: 20, marginBottom: 25, paddingVertical: 5, elevation: 1 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, marginTop: 10 },
  logoutText: { color: '#EF4444', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  versionText: { textAlign: 'center', fontSize: 12, marginTop: 30, marginBottom: 50 }
});