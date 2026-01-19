import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../redux/slices/adminSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color'; // Adjust path as needed

// Enhanced management links with Material icons
const MANAGEMENT_LINKS = [
  {
    id: 'a',
    title: 'Manage Services',
    subtitle: 'Add, edit, or deactivate visa services',
    icon: 'settings',
    color: Colors.primary,
    screen: 'Admin Services',
  },
  {
    id: 'b',
    title: 'User Management',
    subtitle: 'Control user access and permissions',
    icon: 'people',
    color: Colors.accent,
    screen: 'User Management',
  },
  {
    id: 'c',
    title: 'Document Verification',
    subtitle: 'Review and approve documents',
    icon: 'verified',
    color: Colors.warning,
    screen: 'AdminDocumentVerification',
  },
  {
    id: 'd',
    title: 'Support Tickets',
    subtitle: 'Manage customer support requests',
    icon: 'support-agent',
    color: Colors.secondary,
    screen: 'AdminSupportTickets',
  },
];

// Enhanced KPI Card Component
const KPICard = ({ item, onPress }) => (
  <TouchableOpacity 
    onPress={() => onPress(item.screen)} 
    style={kpiStyles.card}
    activeOpacity={0.7}
  >
    <View style={[kpiStyles.iconContainer, { backgroundColor: `${item.color}15` }]}>
      <MaterialIcons name={item.icon} size={28} color={item.color} />
    </View>
    <Text style={kpiStyles.value}>{item.value || '0'}</Text>
    <Text style={kpiStyles.title}>{item.title}</Text>
    <View style={[kpiStyles.indicator, { backgroundColor: item.color }]} />
  </TouchableOpacity>
);

const kpiStyles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -1,
  },
  title: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});

// Enhanced Management Link Component
const ManagementLink = ({ item, onPress }) => (
  <TouchableOpacity
    style={linkStyles.container}
    onPress={() => onPress(item.screen)}
    activeOpacity={0.7}
  >
    <View style={[linkStyles.iconContainer, { backgroundColor: `${item.color}15` }]}>
      <MaterialIcons name={item.icon} size={24} color={item.color} />
    </View>
    <View style={linkStyles.textContainer}>
      <Text style={linkStyles.title}>{item.title}</Text>
      <Text style={linkStyles.subtitle}>{item.subtitle}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
  </TouchableOpacity>
);

const linkStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

// Quick Action Button Component
const QuickActionButton = ({ icon, label, onPress, color }) => (
  <TouchableOpacity 
    style={quickActionStyles.button} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[quickActionStyles.iconContainer, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon} size={22} color={color} />
    </View>
    <Text style={quickActionStyles.label}>{label}</Text>
  </TouchableOpacity>
);

const quickActionStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    width: '23%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// Main Admin Dashboard Screen
export default function AdminDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(state => state.admin);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchStats()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleNavigate = screenName => {
    navigation.navigate(screenName);
  };

  const kpiData = [
    { 
      id: '1', 
      title: 'Total Services', 
      value: stats?.totalServices?.toString() || '0', 
      icon: 'business-center', 
      color: Colors.primary, 
      screen: 'Admin Services' 
    },
    { 
      id: '2', 
      title: 'Active Services', 
      value: stats?.activeServices?.toString() || '0', 
      icon: 'check-circle', 
      color: Colors.success, 
      screen: 'Admin Services' 
    },
    { 
      id: '3', 
      title: 'Pending Requests', 
      value: stats?.pendingRequests?.toString() || '0', 
      icon: 'pending', 
      color: Colors.warning, 
      screen: 'Service Request' 
    },
    { 
      id: '4', 
      title: 'Completed', 
      value: stats?.completedRequests?.toString() || '0', 
      icon: 'done-all', 
      color: Colors.accent, 
      screen: 'Service Request' 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Status bar matching header blue */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.primary}
        translucent={false}
      />

      {/* Header Card - Outside ScrollView */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Back, Admin</Text>
            <Text style={styles.headerSubtitle}>Here's what's happening today</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="notifications" size={24} color={Colors.textLight} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton
              icon="add-circle"
              label="New Service"
              color={Colors.primary}
              onPress={() => handleNavigate('Admin Services')}
            />
            <QuickActionButton
              icon="flight"
              label="Air Bookings"
              color={Colors.warning}
              onPress={() => handleNavigate('Air Bookings')}
            />
            <QuickActionButton
              icon="assignment"
              label="Requests"
              color={Colors.accent}
              onPress={() => handleNavigate('Service Request')}
            />
            <QuickActionButton
              icon="people"
              label="Users"
              color={Colors.secondary}
              onPress={() => handleNavigate('User Management')}
            />
          </View>
        </View>

        {/* KPI Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={kpiData}
            renderItem={({ item }) => (
              <KPICard item={item} onPress={handleNavigate} />
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.kpiRow}
          />
        </View>

        {/* Management Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          {MANAGEMENT_LINKS.map(item => (
            <ManagementLink
              key={item.id}
              item={item}
              onPress={handleNavigate}
            />
          ))}
        </View>

        {/* System Health Card */}
        <View style={styles.section}>
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <MaterialIcons name="health-and-safety" size={24} color={Colors.success} />
              <Text style={styles.healthTitle}>System Status</Text>
            </View>
            <View style={styles.healthContent}>
              <View style={styles.healthItem}>
                <View style={[styles.healthDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.healthLabel}>All Services Operational</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={[styles.healthDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.healthLabel}>Database Connected</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={[styles.healthDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.healthLabel}>API Response Time: 45ms</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Report Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => handleNavigate('SystemReport')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="analytics" size={22} color={Colors.textLight} />
            <Text style={styles.reportButtonText}>View Detailed Reports</Text>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header Card - Fixed at top
  headerCard: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50, // Space for status bar
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: `${Colors.textLight}CC`,
    fontWeight: '500',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.textLight}20`,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '700',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // KPI Row
  kpiRow: {
    justifyContent: 'space-between',
  },

  // Health Card
  healthCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  healthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  healthContent: {
    gap: 10,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Report Button
  reportButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  reportButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
});
