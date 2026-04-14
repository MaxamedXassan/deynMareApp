import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ku dar kani
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function ContactDetails() {
  const { id, name, phone } = useLocalSearchParams();
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [transactionType, setTransactionType] = useState<'plus' | 'minus'>('plus');
  const router = useRouter();

  const STORAGE_KEY = `debts_${id}`;

  useEffect(() => {
    fetchDebts();
  }, [id]);

  // 1. Akhrinta xogta (Offline & Online)
  const fetchDebts = async () => {
    setLoading(true);
    try {
      // Isku day Supabase
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('contact_id', id)
        .order('created_at', { ascending: false });

      if (data) {
        setDebts(data);
        // Ku keydi taleefanka koobi
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else if (error) {
        throw error;
      }
    } catch (error) {
      // Haddii internet la'aan tahay, ka soo qaad AsyncStorage
      const localData = await AsyncStorage.getItem(STORAGE_KEY);
      if (localData) {
        setDebts(JSON.parse(localData));
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return debts.reduce((acc, curr) => {
      return curr.type === 'kugu_maqan' ? acc + Number(curr.amount) : acc - Number(curr.amount);
    }, 0);
  };

  // 2. Ku darista deynta (Offline Support)
  const handleTransaction = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Khalad", "Fadlan geli lacag sax ah");
      return;
    }

    const newDebt = {
      id: Date.now().toString(), // ID ku meel gaar ah
      contact_id: id,
      amount: parseFloat(amount),
      description: desc || (transactionType === 'plus' ? 'Deyn cusub' : 'Lacag bixin'),
      type: transactionType === 'plus' ? 'kugu_maqan' : 'lagaa_leeyahay',
      created_at: new Date().toISOString(),
      isPending: true // Calaamad muujinaysa inaan weli la dirin
    };

    try {
      // Isla markiiba u muuji user-ka (Optimistic Update)
      const updatedDebts = [newDebt, ...debts];
      setDebts(updatedDebts);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDebts));
      setModalVisible(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Isku day inaad u dirtis Supabase
      const { error } = await supabase.from('debts').insert([{
        user_id: user.id,
        contact_id: id,
        amount: newDebt.amount,
        description: newDebt.description,
        type: newDebt.type,
        status: 'active'
      }]);

      if (error) throw error;

      // Haddii ay u dirtay, refresh garee si ID-ga rasmiga ah loogu soo celiyo
      fetchDebts();

    } catch (error) {
      // Haddii ay dirti weydo (Offline), deyntu taleefanka ayay ku jiri doontaa
      Alert.alert("Offline", "Deynta waa la keydiyay taleefanka, waxaana la diri doonaa markaad internet hesho.");
    } finally {
      setAmount('');
      setDesc('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.nameContainer}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerPhone}>{phone || 'No Phone'}</Text>
          </View>
          <View style={{width: 26}} />
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total lagu leeyahay</Text>
          <Text style={[styles.balanceAmount, { color: calculateTotal() >= 0 ? '#10B981' : '#EF4444' }]}>
            ${calculateTotal().toFixed(2)}
          </Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.miniActionBtn, { backgroundColor: '#EF4444' }]} 
            onPress={() => { setTransactionType('minus'); setModalVisible(true); }}
          >
            <Ionicons name="remove" size={20} color="#fff" />
            <Text style={styles.btnText}>Ka jar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.miniActionBtn, { backgroundColor: '#10B981' }]} 
            onPress={() => { setTransactionType('plus'); setModalVisible(true); }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.btnText}>Ku dar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.debtCard}>
            <View style={[styles.typeIndicator, { backgroundColor: item.type === 'kugu_maqan' ? '#10B981' : '#EF4444' }]} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.debtDesc}>{item.description}</Text>
                {item.isPending && <Ionicons name="cloud-upload-outline" size={14} color="#94A3B8" style={{marginLeft: 5}} />}
              </View>
              <Text style={styles.debtDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.debtAmount, { color: item.type === 'kugu_maqan' ? '#10B981' : '#EF4444' }]}>
              {item.type === 'kugu_maqan' ? `+$${item.amount}` : `-$${item.amount}`}
            </Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{transactionType === 'plus' ? 'Sii Deyn' : 'Ka jar Lacag'}</Text>
            <TextInput placeholder="0.00" keyboardType="numeric" style={styles.input} value={amount} onChangeText={setAmount} autoFocus />
            <TextInput placeholder="Sababta..." style={styles.input} value={desc} onChangeText={setDesc} />
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text>Jooji</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleTransaction} style={[styles.confirmBtn, { backgroundColor: transactionType === 'plus' ? '#10B981' : '#EF4444' }]}><Text style={{color:'#fff', fontWeight:'bold'}}>Xaqiiji</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  nameContainer: { alignItems: 'center' },
  headerName: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  headerPhone: { fontSize: 14, color: '#64748B' },
  balanceCard: { alignItems: 'center', marginVertical: 10 },
  balanceLabel: { fontSize: 13, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmount: { fontSize: 32, fontWeight: '800', marginTop: 5 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  miniActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15, width: '45%', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  debtCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center' },
  typeIndicator: { width: 5, height: 35, borderRadius: 10 },
  debtDesc: { fontSize: 15, fontWeight: '600' },
  debtDate: { fontSize: 12, color: '#94A3B8' },
  debtAmount: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, marginBottom: 15 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, alignItems: 'center', padding: 15 },
  confirmBtn: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 12 }
});