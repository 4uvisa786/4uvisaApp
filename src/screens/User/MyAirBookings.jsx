import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux'
import { fetchMyBookings } from '../../redux/slices/airTicketSlice' // Adjust path
import Colors from '../../themes/color' // Adjust this path to match your project structure
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyAirBookings() {
  const dispatch = useDispatch()
  const { bookings, loading, error } = useSelector((state) => state.airTicket)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [expandedId, setExpandedId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch bookings on mount
  useEffect(() => {
    dispatch(fetchMyBookings())
  }, [dispatch])

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true)
    await dispatch(fetchMyBookings())
    setRefreshing(false)
  }

  // Calculate total passenger count
  const getTotalPassengers = (passengers) => {
    const adultCount = passengers?.Adult?.length || 0
    const childCount = passengers?.Child?.length || 0
    const infantCount = passengers?.Infant?.length || 0
    return { adultCount, childCount, infantCount, total: adultCount + childCount + infantCount }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  /**
   * Determine booking status based on API status and dates. (Status logic fix retained)
   */
  const getBookingStatus = (booking) => {
    // 1. Check explicit API status
    if (booking.status === 'Cancelled') return 'cancelled'
    if (booking.status === 'Pending') return 'pending'
    if (booking.status === 'Booked') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const departureDate = new Date(booking.departureDate)
        departureDate.setHours(0, 0, 0, 0)

        // If 'Booked' but the departure date is in the past, mark as completed
        if (departureDate < today) return 'completed'
        
        // Otherwise, if 'Booked' and in the future/today, treat as 'booked' (upcoming)
        return 'booked'
    }

    // 2. Fallback check for completed if status isn't clear
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const departureDate = new Date(booking.departureDate)
    departureDate.setHours(0, 0, 0, 0)
    
    if (departureDate < today) return 'completed'
    
    // Default to pending if API status is missing or unexpected, but date is future
    return 'pending'
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return Colors.warning
      case 'booked': return Colors.success 
      case 'cancelled': return Colors.error
      case 'completed': return Colors.textSecondary
      default: return Colors.textSecondary
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return 'time'
      case 'booked': return 'checkmark-circle'
      case 'cancelled': return 'close-circle'
      case 'completed': return 'checkmark-done-circle'
      default: return 'information-circle'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'PENDING'
      case 'booked': return 'BOOKED'
      case 'cancelled': return 'CANCELLED'
      case 'completed': return 'COMPLETED'
      default: return 'PENDING'
    }
  }

  /**
   * Filter bookings by tab, using the corrected statuses. (Status logic fix retained)
   */
  const getFilteredBookings = () => {
    if (!bookings || bookings.length === 0) return []
    
    return bookings.filter(booking => {
      const status = getBookingStatus(booking)
      // Upcoming: Pending or Booked with future/today departure date
      if (activeTab === 'upcoming') return status === 'pending' || status === 'booked'
      // Past: Completed
      if (activeTab === 'past') return status === 'completed'
      // Cancelled: Explicitly cancelled
      if (activeTab === 'cancelled') return status === 'cancelled'
      return false
    })
  }

  const renderPassengerDetails = (passengers) => {
    const allPassengers = [
      ...(passengers?.Adult || []).map(p => ({ ...p, type: 'Adult' })),
      ...(passengers?.Child || []).map(p => ({ ...p, type: 'Child' })),
      ...(passengers?.Infant || []).map(p => ({ ...p, type: 'Infant' }))
    ]

    if (allPassengers.length === 0) return null

    return (
      <View style={styles.passengerSection}>
        <Text style={styles.sectionTitle}>Passengers ({allPassengers.length})</Text>
        {allPassengers.map((passenger, index) => (
          <View key={index} style={styles.passengerCard}>
            <View style={styles.passengerHeader}>
              <View style={styles.passengerInfo}>
                <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
                <View style={styles.passengerTextContainer}>
                  <Text style={styles.passengerName}>{passenger.name}</Text>
                  <Text style={styles.passengerMeta}>{passenger.type} • Age {passenger.age}</Text>
                </View>
              </View>
              {passenger.passportNumber && (
                <Text style={styles.passportText}>PP: {passenger.passportNumber}</Text>
              )}
            </View>
            <View style={styles.passengerContact}>
              {passenger.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>{passenger.email}</Text>
                </View>
              )}
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{passenger.phone}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    )
  }

  const renderBookingCard = (booking) => {
    const status = getBookingStatus(booking)
    const passengerCount = getTotalPassengers(booking.passengers)
    const isExpanded = expandedId === booking._id

    // Use original data for display (no more stripping the airport details)
    const fromLocation = booking.fromCity;
    const toLocation = booking.toCity;

    return (
      <View key={booking._id} style={styles.bookingCard}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => setExpandedId(isExpanded ? null : booking._id)}
        >
          {/* Header with Booking ID and Status */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.bookingRef}>
                {booking._id ? `Booking #${booking._id.slice(-6).toUpperCase()}` : 'N/A'}
              </Text>
              <Text style={styles.bookingDate}>
                Booked on {formatDate(booking.createdAt)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}15` }]}>
              <Ionicons name={getStatusIcon(status)} size={14} color={getStatusColor(status)} />
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>
          </View>

          {/* Flight Route */}
          <View style={styles.routeContainer}>
            {/* From */}
            <View style={styles.locationContainer}>
              {/* Display full location name */}
              <Text style={styles.fullLocationText}>{fromLocation}</Text> 
              <Text style={styles.dateText}>{formatDate(booking.departureDate)}</Text>
            </View>

            {/* Flight Path */}
            <View style={styles.flightPath}>
              <View style={styles.dashedLine} />
              <View style={styles.planeIconContainer}>
                <Ionicons 
                  name={booking.travelType === 'RoundTrip' ? 'swap-horizontal' : 'arrow-forward'} 
                  size={20} 
                  color={Colors.primary} 
                />
              </View>
              <View style={styles.dashedLine} />
              <Text style={styles.travelTypeText}>
                {booking.travelType === 'RoundTrip' ? 'Round Trip' : 'One Way'}
              </Text>
            </View>

            {/* To */}
            <View style={[styles.locationContainer, styles.locationRight]}>
               {/* Display full location name */}
              <Text style={styles.fullLocationText}>{toLocation}</Text> 
              {booking.travelType === 'RoundTrip' && booking.returnDate && (
                <Text style={styles.dateText}>{formatDate(booking.returnDate)}</Text>
              )}
            </View>
          </View>

          {/* Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {passengerCount.total} Passenger{passengerCount.total > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{booking.travelClass}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.primary} />
              <Text style={[styles.detailText, { color: Colors.primary, fontWeight: '600' }]}>
                {isExpanded ? 'Less' : 'More'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            {/* Passenger Breakdown */}
            <View style={styles.passengerBreakdown}>
              <Text style={styles.sectionTitle}>Passenger Breakdown</Text>
              <View style={styles.breakdownRow}>
                {passengerCount.adultCount > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownCount}>{passengerCount.adultCount}</Text>
                    <Text style={styles.breakdownLabel}>
                      Adult{passengerCount.adultCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {passengerCount.childCount > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownCount}>{passengerCount.childCount}</Text>
                    <Text style={styles.breakdownLabel}>
                      Child{passengerCount.childCount > 1 ? 'ren' : ''}
                    </Text>
                  </View>
                )}
                {passengerCount.infantCount > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownCount}>{passengerCount.infantCount}</Text>
                    <Text style={styles.breakdownLabel}>
                      Infant{passengerCount.infantCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Passenger Details */}
            {renderPassengerDetails(booking.passengers)}

            {/* Action Buttons */}
            {(status === 'booked' || status === 'pending') && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.primaryButton}>
                  <Ionicons name="document-text-outline" size={18} color={Colors.textLight} />
                  <Text style={styles.primaryButtonText}>View Ticket</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Ionicons name="call-outline" size={18} color={Colors.primary} />
                  <Text style={styles.secondaryButtonText}>Support</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {status === 'completed' && (
              <TouchableOpacity style={styles.outlineButton}>
                <Ionicons name="repeat-outline" size={18} color={Colors.primary} />
                <Text style={styles.outlineButtonText}>Book Again</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    )
  }

  const filteredBookings = getFilteredBookings()
  // Upcoming count now relies on the corrected status logic
  const upcomingCount = bookings?.filter(b => {
    const status = getBookingStatus(b)
    return status === 'booked' || status === 'pending'
  }).length || 0

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => dispatch(fetchMyBookings())}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? "sync" : "refresh"} 
            size={22} 
            color={Colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
          {upcomingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{upcomingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchMyBookings())}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bookings List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={64} color="#A0A4A8" />
            <Text style={styles.emptyTitle}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map(booking => renderBookingCard(booking))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color="#A0A4A8" />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySubtitle}>
              Your {activeTab} flight bookings will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
   flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10, 
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1D29',
  },
  filterButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: Colors.primary, // Using Colors.primary for active tab background
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C757D',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary, // Using Colors.primary for badge text
  },
  errorContainer: {
    backgroundColor: '#E74C3C15',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  bookingRef: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D29',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
    color: '#6C757D',
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
    fontSize: 11,
    fontWeight: '700',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flex: 1,
    // Align left (default)
  },
  locationRight: {
    alignItems: 'flex-end',
  },
  // NEW STYLE: To handle the long text of the full location/airport name
  fullLocationText: { 
    fontSize: 16, // Slightly smaller font to fit longer names
    fontWeight: '700',
    color: '#1A1D29',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  flightPath: {
    alignItems: 'center',
    marginHorizontal: 8, // Reduced horizontal margin slightly
    minWidth: 80,
  },
  dashedLine: {
    width: '100%',
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },
  planeIconContainer: {
    backgroundColor: '#4A68E820',
    borderRadius: 20,
    padding: 8,
    marginVertical: 8,
  },
  travelTypeText: {
    fontSize: 10,
    color: '#6C757D',
    marginTop: 4,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E4E8',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E4E8',
    marginBottom: 16,
  },
  passengerBreakdown: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D29',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownItem: {
    backgroundColor: '#4A68E810',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  breakdownCount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  passengerSection: {
    marginBottom: 16,
  },
  passengerCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  passengerTextContainer: {
    flex: 1,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 2,
  },
  passengerMeta: {
    fontSize: 11,
    color: '#6C757D',
  },
  passportText: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '600',
  },
  passengerContact: {
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 11,
    color: '#6C757D',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  primaryButtonText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A68E815',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    marginTop: 12,
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D29',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#A0A4A8',
    textAlign: 'center',
  },
})