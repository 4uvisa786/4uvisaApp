import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllAirTickets, updateAirBookingStatus } from '../../redux/slices/adminSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const AdminAirBookingRequest = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(state => state.admin.airTickets || []);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

const handleUpdateStatus = async (id, newStatus) => {
  try {
    await dispatch(updateAirBookingStatus({ id, status: newStatus })).unwrap();
    setModalVisible(false);
  } catch (err) {
    Alert.alert("Error", err);
  }
};

useEffect(() => {
  setIsLoading(true);
  dispatch(fetchAllAirTickets())
    .finally(() => setIsLoading(false));
}, [dispatch]);



  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert("Error", "Phone number not provided");
  };

  const parseLocation = (str) => {
    if (!str) return { name: 'N/A', code: '???' };
    const match = str.match(/^([^(]+)\s\(([^)]+)\)/);
    return {
      name: match ? match[1].trim() : str,
      code: match ? match[2].trim() : 'VAR',
    };
  };

  const renderPassengerList = (title, list) => {
    if (!list || list.length === 0) return null;
    return (
      <View style={styles.modalSection}>
        <Text style={styles.modalSectionTitle}>{title}</Text>
        {list.map((p, index) => (
          <View key={p._id || index} style={styles.passengerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.passengerName}>{p.name}</Text>
              <Text style={styles.passengerSub}>
                Age: {p.age} {p.phone ? `• ${p.phone}` : ''}
              </Text>
            </View>
            {p.phone && (
              <TouchableOpacity onPress={() => handleCall(p.phone)} style={styles.callBtn}>
                <Icon name="phone" size={18} color="#10B981" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderBookingItem = ({ item }) => {
    const from = parseLocation(item.fromCity);
    const to = parseLocation(item.toCity);
    const leadName = item.passengers?.Adult?.[0]?.name || 'Guest';
    const isRoundTrip = item.travelType === 'RoundTrip';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => { setSelectedBooking(item); setModalVisible(true); }}
      >
        {/* HEADER: User & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{leadName[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookerName}>{leadName}</Text>
            <View style={styles.typeTag}>
              <Icon name={isRoundTrip ? "swap-horizontal" : "arrow-right-thin"} size={14} color="#6366f1" />
              <Text style={styles.typeTagText}>{item.travelType}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: item.status === 'Pending' ? '#FEF3C7' : '#D1FAE5' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Pending' ? '#D97706' : '#059669' }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* ROUTE: From -> To */}
        <View style={styles.routeRow}>
          <View style={styles.cityBlock}>
            <Text style={styles.airportCode}>{from.code}</Text>
            <Text style={styles.cityName} numberOfLines={1}>{from.name}</Text>
          </View>

          <View style={styles.airPathContainer}>
            <Icon name="airplane" size={20} color="#CBD5E1" />
            <View style={styles.dottedLine} />
            {isRoundTrip && <Icon name="airplane" size={20} color="#CBD5E1" style={{ transform: [{ rotate: '180deg' }] }} />}
          </View>

          <View style={[styles.cityBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.airportCode}>{to.code}</Text>
            <Text style={[styles.cityName, { textAlign: 'right' }]} numberOfLines={1}>{to.name}</Text>
          </View>
        </View>

        {/* FOOTER: Dates & Class */}
        <View style={styles.cardFooter}>
          <View style={styles.infoPill}>
            <Icon name="calendar-range" size={14} color="#64748B" />
            <Text style={styles.infoPillText}>
              {new Date(item.departureDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              {isRoundTrip && item.returnDate ? ` - ${new Date(item.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : ''}
            </Text>
          </View>
          <View style={styles.infoPill}>
            <Icon name="shield-check-outline" size={14} color="#64748B" />
            <Text style={styles.infoPillText}>{item.travelClass}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topNav}>
        <Text style={styles.navTitle}>Air Requests</Text>
          <TouchableOpacity style={styles.refreshIcon} onPress={() => {
            setIsLoading(true);
            dispatch(fetchAllAirTickets())
              .finally(() => setIsLoading(false));
          }}>
            <Icon name="refresh" size={22} color="#6366f1" />
          </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBooking && (
                <>
                  <Text style={styles.modalHeading}>Booking Details</Text>
                  
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryMain}>{selectedBooking.travelType} • {selectedBooking.travelClass}</Text>
                    <View style={styles.modalDateRow}>
                       <View>
                          <Text style={styles.dateLabel}>DEPARTURE</Text>
                          <Text style={styles.dateVal}>{new Date(selectedBooking.departureDate).toDateString()}</Text>
                       </View>
                       {selectedBooking.returnDate && (
                         <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.dateLabel}>RETURN</Text>
                            <Text style={styles.dateVal}>{new Date(selectedBooking.returnDate).toDateString()}</Text>
                         </View>
                       )}
                    </View>
                  </View>

                  {renderPassengerList('Adults', selectedBooking.passengers?.Adult)}
                  {renderPassengerList('Children', selectedBooking.passengers?.Child)}
                  {renderPassengerList('Infants', selectedBooking.passengers?.Infant)}

                  <View style={styles.actionContainer}>
                    <Text style={styles.modalSectionTitle}>Update Status</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]} 
                        onPress={() => handleUpdateStatus(selectedBooking._id, 'Booked')}>
                        <Icon name="check-circle" size={20} color="#10B981" />
                        <Text style={[styles.btnText, { color: '#10B981' }]}>Book</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }]} 
                        onPress={() => handleUpdateStatus(selectedBooking._id, 'Cancelled')}>
                        <Icon name="close-circle" size={20} color="#EF4444" />
                        <Text style={[styles.btnText, { color: '#EF4444' }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeBtnText}>Close Window</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  navTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  refreshIcon: { padding: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 3, shadowColor: '#6366f1', shadowOpacity: 0.1 },
  
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bookerName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  typeTagText: { fontSize: 11, color: '#6366f1', fontWeight: '700', textTransform: 'uppercase' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  cityBlock: { flex: 1 },
  airportCode: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  cityName: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  airPathContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  dottedLine: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 1 },

  cardFooter: { flexDirection: 'row', gap: 10, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  infoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  infoPillText: { fontSize: 12, color: '#475569', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeading: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  summaryCard: { backgroundColor: '#F5F7FF', padding: 20, borderRadius: 20, marginBottom: 24 },
  summaryMain: { fontSize: 14, fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', marginBottom: 12 },
  modalDateRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E0E7FF', paddingTop: 12 },
  dateLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', marginBottom: 2 },
  dateVal: { fontSize: 13, fontWeight: '600', color: '#1E293B' },

  modalSectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  passengerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  passengerName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  passengerSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  callBtn: { padding: 8, backgroundColor: '#DCFCE7', borderRadius: 10 },

  actionContainer: { marginTop: 10, paddingVertical: 20 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 16, borderWidth: 1, gap: 8 },
  btnText: { fontSize: 14, fontWeight: '700' },
  closeBtn: { marginTop: 10, padding: 16, alignItems: 'center' },
  closeBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 14 }
});

export default AdminAirBookingRequest;