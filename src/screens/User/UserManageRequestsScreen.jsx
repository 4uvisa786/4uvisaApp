// screens/UserManageRequestsScreen.js
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { getMyRequests } from '../../redux/slices/adminSlice';
import Colors from '../../themes/color';

// --- Color/Icon utility functions (No changes needed here) ---
const getStatusColor = status => {
  switch (status.toLowerCase()) {
    case 'pending': return Colors.warning;
    case 'processing': return Colors.accent;
    case 'completed': return Colors.success;
    case 'rejected':
    case 'cancelled': return Colors.error;
    default: return Colors.textMuted;
  }
};

const getStatusIcon = status => {
  switch (status.toLowerCase()) {
    case 'pending': return 'schedule';
    case 'processing': return 'sync';
    case 'completed': return 'check-circle';
    case 'rejected': return 'cancel';
    case 'cancelled': return 'close';
    default: return 'info';
  }
};

const getPriorityColor = priority => {
  switch (priority?.toLowerCase()) {
    case 'high': return Colors.error;
    case 'medium': return Colors.secondary;
    case 'low': return Colors.textMuted;
    default: return Colors.textSecondary;
  }
};

const RequestListItem = ({ item, onPress }) => {
    if (!item?.service) return null;

    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.leftIndicator, { backgroundColor: getStatusColor(item.status) }]} />

            <View style={styles.itemContent}>
                <View style={styles.topRow}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                        {item?.service?.name || 'Unknown Service'}
                        {item?.subServiceName ? ` | ${item.subServiceName}` : ''}
                        
                    </Text>
                    {item.priority && (
                        <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(item.priority)}15` }]}>
                            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                                {item.priority.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.requestId}>ID: {item._id.slice(-8)}</Text>

                <View style={styles.bottomRow}>
                    <View style={styles.dateContainer}>
                        <MaterialIcons name="event" size={14} color={Colors.textSecondary} style={styles.dateIcon} />
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <MaterialIcons name={getStatusIcon(item.status)} size={12} color={Colors.textLight} style={styles.statusIcon} />
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} style={styles.chevron} />
        </TouchableOpacity>
    );
};


// Main Screen
export default function UserManageRequestsScreen({ navigation }) {
    const dispatch = useDispatch();
    const { myRequests, loading, error } = useSelector(state => state.admin);

    const [filter, setFilter] = useState('current'); // 'current' | 'completed'

    useEffect(() => {
        dispatch(getMyRequests());
    }, [dispatch]);

    const handleItemPress = request => {
        navigation.navigate('UserRequestDetailed', { request });
    };

    const handleRefresh = () => {
        dispatch(getMyRequests());
    };

    const filteredRequests = myRequests?.filter(r => {
        if (filter === 'current') return ['pending', 'processing'].includes(r.status.toLowerCase());
        if (filter === 'completed') return r.status.toLowerCase() === 'completed';
        return true;
    });

    // Case 1: Initial full-screen loading (when myRequests is null/empty AND loading)
    if (loading && (!myRequests || myRequests.length === 0)) return (
        <SafeAreaView style={[styles.safeAreaFull, styles.center]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your requests...</Text>
        </SafeAreaView>
    );

    // Case 2: Empty state (after loading finishes and no requests found)
    if (!myRequests || myRequests.length === 0) return (
        <SafeAreaView style={[styles.safeAreaFull, styles.center]}>
            <MaterialIcons name="assignment-turned-in" size={80} color={Colors.primary} />
            <Text style={styles.emptyText}>You haven't submitted any requests yet.</Text>
            <TouchableOpacity style={styles.primaryButton}>
                <MaterialIcons name="add" size={20} color={Colors.textLight} />
                <Text style={styles.primaryButtonText}>New Request</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );

    // Case 3: Main Content Display
    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>My Requests</Text>
                        <Text style={styles.headerSubtitle}>
                            {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} in {filter === 'current' ? 'progress' : 'completed'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} activeOpacity={0.7}>
                        <MaterialIcons name="refresh" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Filter Bar */}
            <View style={styles.filterBar}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'current' && styles.filterButtonActive]}
                    onPress={() => setFilter('current')}
                >
                    <Text style={[styles.filterText, filter === 'current' && styles.filterTextActive]}>Current</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Completed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterButton, filter === 'Air Bookings' && styles.filterButtonActive]}
                    onPress={() => navigation.navigate('MyAirBookings')}
                >
                    <Text style={[styles.filterText, filter === 'Air Bookings' && styles.filterTextActive]}>Air Bookings</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={filteredRequests}
                keyExtractor={item => item._id}
                renderItem={({ item }) => <RequestListItem item={item} onPress={handleItemPress} />}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
            
            {/* Conditional Loading Overlay Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={loading}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.textLight} />
                        <Text style={styles.loaderText}>Refreshing requests...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    // Full screen safe area for initial loading/empty state
    safeAreaFull: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Safe Area for header background
    safeArea: { 
        backgroundColor: Colors.primary 
    },
    center: { height: '100%', justifyContent: 'center', alignItems: 'center' },

    // UPDATED: Header background to primary color, text to white
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        backgroundColor: Colors.primary, // THEME COLOR
    },
    headerTitle: { 
        fontSize: 26, 
        fontWeight: '800', 
        color: Colors.textLight, // White text
        letterSpacing: -0.5 
    },
    headerSubtitle: { 
        fontSize: 14, 
        color: Colors.textLight, // White text
        marginTop: 2, 
        fontWeight: '500' 
    },
    // UPDATED: Refresh button color for contrast
    refreshButton: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light tint of white/light
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    loadingText: { marginTop: 16, fontSize: 16, color: Colors.primary, fontWeight: '600' },
    errorText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 16 },
    retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 8 },
    retryButtonText: { color: Colors.textLight, fontSize: 16, fontWeight: '700' },

    emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginVertical: 16 },
    primaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, gap: 8 },
    primaryButtonText: { color: Colors.textLight, fontSize: 16, fontWeight: '700' },

    filterBar: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, backgroundColor: Colors.cardBg },
    filterButton: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.border, marginHorizontal: 8 },
    filterButtonActive: { backgroundColor: Colors.primary },
    filterText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    filterTextActive: { color: Colors.textLight },

    listContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    listItem: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    leftIndicator: { width: 4 },
    itemContent: { flex: 1, padding: 16 },
    chevron: { alignSelf: 'center', marginRight: 8 },

    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    serviceName: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3, marginRight: 8 },
    priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    priorityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    requestId: { fontSize: 13, color: Colors.textMuted, marginBottom: 10, fontWeight: '500' },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateContainer: { flexDirection: 'row', alignItems: 'center' },
    dateIcon: { marginRight: 4 },
    dateText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
    statusIcon: { marginRight: 2 },
    statusText: { color: Colors.textLight, fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },

    // --- NEW MODAL OVERLAY STYLES ---
    modalOverlay: {
        flex: 1,
        // Semi-transparent black for the blur effect
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        // A slightly dimmer background for the loader itself for better visibility
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 150,
    },
    loaderText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textLight,
    }
});