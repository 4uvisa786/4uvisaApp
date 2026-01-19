import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../components/Header';
import { ServiceCard } from '../../components/ServiceCard';
import { Banner } from '../../components/Banner';
// IMPORT THE NEW CARD
import { QuickBookingCard } from '../../components/QuickBookingCard'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../../redux/slices/serviceSlice';
import Colors from '../../themes/color';

// You will need to define a route named 'AirTicketScreen' for this to work
const AIR_TICKET_SCREEN = 'AirTicketScreen'; 

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { services, loading } = useSelector(state => state.service);
  const [refreshing, setRefreshing] = React.useState(false);
  const { serviceScrollSpeed } = useSelector(state => state.ui);

  console.log('Service Scroll Speed from Redux:', serviceScrollSpeed);

  // Function to navigate to the Air Ticket screen
  const handleAirTicketPress = () => {
    if(!user) {
      navigation.navigate('Profile'); // Redirect to login if not authenticated
      return;
    }
      navigation.navigate("Air Ticket"); // Assuming you register AirTicketScreen in your navigator
  };

  const handleServicePress = service => {
    if(!user) {
      navigation.navigate('Profile'); // Redirect to login if not authenticated
      return;
    }
    navigation.navigate('UserServiceDetails', { service: service });
  };

  const fullname = user?.firstName || 'Guest';

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchServices()).finally(() => setRefreshing(false));
  }, [dispatch]);

  // 3. Add function to handle website opening
  const openWebsite = () => {
    Linking.openURL('https://www.4uvisas.com/').catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Extended gradient background for status bar + header */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <AppHeader
            title={`Welcome, ${fullname}`}
            user={user}
            onProfilePress={() => navigation.navigate('Profile')}
            onNotificationPress={() =>
              navigation.navigate('UserNotificationScreen')
            }
          />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.accent]}
          />
        }
      >
        {/* Banner Component */}
        {/* <Banner /> */}
        
        {/* --- ADDED: QUICK ACCESS CARD FOR AIR TICKETS --- */}
        <QuickBookingCard onPress={handleAirTicketPress} />
        {/* ------------------------------------------------ */}

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <View style={styles.blueUnderline} />
          </View>

          <View style={styles.servicesGrid}>
            {services && services.length > 0 ? (
              services.map(service => (
                <ServiceCard
                  key={service._id}
                  imageURL={service.imageURL}
                  title={service.name}
                  description={service.description}
                  subServices={service.subServices}
                  scrollSpeed={serviceScrollSpeed}
                  onPress={() => handleServicePress(service)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>✈️</Text>
                <Text style={styles.noServicesText}>
                  No services available at the moment
                </Text>
                <Text style={styles.noServicesSubtext}>
                  We're preparing amazing travel services for you
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.bottomSpacer} />      

        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} 4UVISA</Text>
          <TouchableOpacity onPress={openWebsite}>
            <Text style={styles.websiteLink}>www.4uvisas.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topGradient: {
    paddingBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Removed paddingHorizontal from section to allow the QuickBookingCard to use it
  section: {
    paddingHorizontal: 20, 
    marginTop: 25,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  blueUnderline: {
    width: 50,
    height: 4,
    backgroundColor: Colors.secondary,
    marginTop: 8,
    borderRadius: 2,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noServicesText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noServicesSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20, // Increased spacer for better breathing room
  },
  footer: {
    paddingVertical: 5,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  websiteLink: {
    fontSize: 14,
    color: Colors.secondary, // Using your secondary color for the link
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});