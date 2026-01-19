import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRequests } from '../../redux/slices/adminSlice';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color'; // Adjust path as needed

// Enhanced status styling
const getStatusConfig = status => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return {
        backgroundColor: `${Colors.warning}15`,
        color: Colors.warning,
        icon: 'schedule',
      };
    case 'processing':
      return {
        backgroundColor: `${Colors.accent}15`,
        color: Colors.accent,
        icon: 'sync',
      };
    case 'completed':
      return {
        backgroundColor: `${Colors.success}15`,
        color: Colors.success,
        icon: 'check-circle',
      };
    case 'rejected':
      return {
        backgroundColor: `${Colors.error}15`,
        color: Colors.error,
        icon: 'error',
      };
    case 'cancelled':
      return {
        backgroundColor: `${Colors.error}15`,
        color: Colors.error,
        icon: 'cancel',
      };
    default:
      return {
        backgroundColor: `${Colors.textMuted}15`,
        color: Colors.textMuted,
        icon: 'info',
      };
  }
};

// Filter Tab Component
const FilterTab = ({ label, count, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterTab, isActive && styles.filterTabActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
      {label}
    </Text>
    {count > 0 && (
      <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
        <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// Request Card Component
const RequestCard = ({ item, onPress }) => {
  const statusConfig = getStatusConfig(item.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.serviceIcon, { backgroundColor: `${Colors.primary}15` }]}>
            <MaterialIcons name="business-center" size={20} color={Colors.primary} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.service?.name || 'Service Request'}
            </Text>
            <Text style={styles.requestId}>ID: {item._id?.slice(-8)}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.user?.firstName || item.user?.email || 'Unknown User'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="email" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.user?.email || 'No email'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="calendar-today" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          {item.country && (
            <View style={styles.infoItem}>
              <MaterialIcons name="public" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{item.country}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <MaterialIcons
            name={statusConfig.icon}
            size={14}
            color={statusConfig.color}
          />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {item.status}
          </Text>
        </View>

        {item.priority && (
          <View style={styles.priorityBadge}>
            <MaterialIcons
              name="flag"
              size={12}
              color={
                item.priority === 'high'
                  ? Colors.error
                  : item.priority === 'medium'
                  ? Colors.warning
                  : Colors.textMuted
              }
            />
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function AdminServiceRequestScreen() {
  const navigation = useNavigation();
  const { requests, loading } = useSelector(state => state.admin);
  const dispatch = useDispatch();

  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllRequests());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchAllRequests()).finally(() => setRefreshing(false));
  }, [dispatch]);

  // Filter requests
  const filteredRequests = React.useMemo(() => {
    if (!requests) return [];
    if (activeFilter === 'all') return requests;
    return requests.filter(
      req => req.status?.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [requests, activeFilter]);

  // Get counts for each status
  const statusCounts = React.useMemo(() => {
    if (!requests) return {};
    return {
      all: requests.length,
      pending: requests.filter(r => r.status?.toLowerCase() === 'pending').length,
      processing: requests.filter(r => r.status?.toLowerCase() === 'processing').length,
      completed: requests.filter(r => r.status?.toLowerCase() === 'completed').length,
    };
  }, [requests]);

  const handleCardPress = item => {
    navigation.navigate('AdminServiceRequestDetails', { request: item });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Service Requests</Text>
            <Text style={styles.headerSubtitle}>
              {requests?.length || 0} total request{requests?.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.7}
            onPress={() => {
              /* Add search functionality */
            }}
          >
            <MaterialIcons name="search" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <FilterTab
              label="All"
              count={statusCounts.all}
              isActive={activeFilter === 'all'}
              onPress={() => setActiveFilter('all')}
            />
            <FilterTab
              label="Pending"
              count={statusCounts.pending}
              isActive={activeFilter === 'pending'}
              onPress={() => setActiveFilter('pending')}
            />
            <FilterTab
              label="Processing"
              count={statusCounts.processing}
              isActive={activeFilter === 'processing'}
              onPress={() => setActiveFilter('processing')}
            />
            <FilterTab
              label="Completed"
              count={statusCounts.completed}
              isActive={activeFilter === 'completed'}
              onPress={() => setActiveFilter('completed')}
            />
          </ScrollView>
        </View>

        {/* Requests List */}
        {filteredRequests?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons
                name="assignment-turned-in"
                size={64}
                color={Colors.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all'
                ? 'No Requests Yet'
                : `No ${activeFilter} Requests`}
            </Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'all'
                ? 'Service requests will appear here when users submit them'
                : `No requests with ${activeFilter} status at the moment`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <RequestCard item={item} onPress={handleCardPress} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filters
  filtersContainer: {
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.textLight,
  },
  filterBadge: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: Colors.textLight,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  filterBadgeTextActive: {
    color: Colors.primary,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  requestId: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.textMuted}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
