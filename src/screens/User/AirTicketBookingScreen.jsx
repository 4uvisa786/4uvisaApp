import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from '../../components/DatePicker';
import AirportTicketModal from '../../components/AirportPickerModal'
import { useDispatch, useSelector } from 'react-redux';
import { bookAirTicket } from '../../redux/slices/airTicketSlice';
import { showSnackbar } from '../../redux/slices/snackbarSlice';

const { width } = Dimensions.get('window');

// --- THEME COLORS ---
const Colors = {
  primary: '#1434CB',
  primaryDark: '#0D2380',
  primaryLight: '#4A68E8',
  secondary: '#FF6B35',
  accent: '#00B4D8',
  background: '#F8F9FA',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1D29',
  textSecondary: '#6C757D',
  textLight: '#FFFFFF',
  border: '#E1E4E8',
};


// --- ENHANCED Tab Button Component with Animation ---
const TabButton = ({ iconName, label, isActive }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.tabButton}>
        <View
          style={[
            styles.tabIconContainer,
            isActive && styles.activeTabIconContainer,
          ]}
        >
          <FontAwesome5
            name={iconName}
            size={18}
            color={isActive ? Colors.textLight : Colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            isActive && styles.activeTabLabel,
          ]}
        >
          {label}
        </Text>
        {isActive && (
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.activeTabIndicator}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};


// --- FIXED Input Field Component with State Management ---
const InputField = ({
  iconName,
  placeholder,
  value,
  isSwapper,
  label,
  onSwap,
  onPress,
  isTextInput = false,
  onChangeText,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.inputFieldWrapper}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={isTextInput}
      >
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.iconGradientBg}
          >
            {iconName === 'place' ||
            iconName === 'person' ||
            iconName === 'chair' ? (
              <MaterialIcons name={iconName} size={20} color={Colors.textLight} />
            ) : (
              <FontAwesome5 name={iconName} size={18} color={Colors.textLight} />
            )}
          </LinearGradient>

          <View style={styles.textInputGroup}>
            {label && <Text style={styles.inputLabel}>{label}</Text>}

            {isTextInput ? (
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.textSecondary}
                value={value}
                onChangeText={onChangeText}
              />
            ) : (
              <Text style={styles.inputText}>{value || placeholder}</Text>
            )}
          </View>
        </View>

        {isSwapper && (
          <TouchableOpacity 
            style={styles.swapperButton}
            onPress={onSwap}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.swapperGradient}
            >
              <MaterialIcons name="swap-vert" size={20} color={Colors.textLight} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};


// --- ENHANCED Custom Date Picker Field ---
const CustomDatePickerField = ({ label, value, onChange }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={styles.inputFieldWrapper}>
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.iconGradientBg}
          >
            <MaterialIcons name="calendar-today" size={20} color={Colors.textLight} />
          </LinearGradient>
          <View style={styles.textInputGroup}>
            <DatePicker label={label} value={value} onChange={onChange} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};


// --- ENHANCED Passenger Form Component ---
const PassengerForm = ({ type, passenger, onChange }) => {
  const isAdult = type.startsWith('Adult');

  const requiredFields = [
    { key: 'name', label: 'Full Name', keyboard: 'default', icon: 'person' },
    { key: 'age', label: 'Age', keyboard: 'numeric', icon: 'cake' },
  ];

  if (isAdult) {
    requiredFields.push(
      { key: 'email', label: 'Email', keyboard: 'email-address', icon: 'email' },
      { key: 'phone', label: 'Phone Number', keyboard: 'phone-pad', icon: 'phone' },
      {
        key: 'passportNumber',
        label: 'Passport Number',
        keyboard: 'default',
        icon: 'card-travel',
      }
    );
  }

  return (
    <View style={modalStyles.passengerForm}>
      <View style={modalStyles.formTitleRow}>
        <MaterialIcons name="person" size={20} color={Colors.primary} />
        <Text style={modalStyles.formTitle}>{type}</Text>
      </View>
      {requiredFields.map(({ key, label, keyboard, icon }) => (
        <View key={key} style={modalStyles.inputWrapper}>
          <MaterialIcons
            name={icon}
            size={18}
            color={Colors.primary}
            style={modalStyles.inputIcon}
          />
          <TextInput
            style={modalStyles.textInput}
            placeholder={label}
            placeholderTextColor={Colors.textSecondary}
            value={passenger[key] || ''}
            onChangeText={text => onChange(key, text)}
            keyboardType={keyboard}
          />
        </View>
      ))}
    </View>
  );
};


// --- ENHANCED Passenger Modal Component ---
const PassengerModal = ({ visible, onClose, passengers, setPassengers }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const totalPassengers =
    passengers.Adult.length +
    passengers.Child.length +
    passengers.Infant.length;

  const handleAddPassenger = type => {
    setPassengers(prev => ({
      ...prev,
      [type]: [...prev[type], {}],
    }));
  };

  const handleRemovePassenger = (type, index) => {
    setPassengers(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleChangePassenger = (type, index, key, value) => {
    setPassengers(prev => ({
      ...prev,
      [type]: prev[type].map((p, i) =>
        i === index ? { ...p, [key]: value } : p
      ),
    }));
  };

  const passengerTypes = [
    { type: 'Adult', min: 1, max: 9, label: 'Adults (12+ yrs)', icon: 'person' },
    { type: 'Child', min: 0, max: 5, label: 'Children (2-12 yrs)', icon: 'child-care' },
    { type: 'Infant', min: 0, max: 2, label: 'Infants (Under 2 yrs)', icon: 'child-friendly' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <Animated.View
          style={[
            modalStyles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={modalStyles.modalHeader}
          >
            <View style={modalStyles.headerContent}>
              <View style={modalStyles.headerLeft}>
                <MaterialIcons name="people" size={24} color={Colors.textLight} />
                <View style={modalStyles.headerTextContainer}>
                  <Text style={modalStyles.headerTitle}>Passengers</Text>
                  <Text style={modalStyles.headerSubtitle}>
                    {totalPassengers} Selected
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={modalStyles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={modalStyles.scrollArea}>
            <View style={modalStyles.counterContainer}>
              {passengerTypes.map(({ type, min, max, label, icon }) => (
                <View key={type} style={modalStyles.counterRow}>
                  <View style={modalStyles.counterLeft}>
                    <View style={modalStyles.counterIconBg}>
                      <MaterialIcons name={icon} size={22} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={modalStyles.counterLabel}>{type}</Text>
                      <Text style={modalStyles.counterSubLabel}>{label}</Text>
                    </View>
                  </View>
                  <View style={modalStyles.counterControls}>
                    <TouchableOpacity
                      style={[
                        modalStyles.counterButton,
                        passengers[type].length <= min &&
                          modalStyles.disabledButton,
                      ]}
                      onPress={() =>
                        handleRemovePassenger(type, passengers[type].length - 1)
                      }
                      disabled={passengers[type].length <= min}
                    >
                      <Text style={modalStyles.counterButtonText}>−</Text>
                    </TouchableOpacity>

                    <Text style={modalStyles.counterCount}>
                      {passengers[type].length}
                    </Text>

                    <TouchableOpacity
                      style={[
                        modalStyles.counterButton,
                        modalStyles.incrementButton,
                        passengers[type].length >= max &&
                          modalStyles.disabledButton,
                      ]}
                      onPress={() => handleAddPassenger(type)}
                      disabled={passengers[type].length >= max}
                    >
                      <Text
                        style={[
                          modalStyles.counterButtonText,
                          modalStyles.incrementText,
                        ]}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={modalStyles.formSeparator} />

            <Text style={modalStyles.detailsHeader}>
              <MaterialIcons name="edit" size={18} color={Colors.primary} /> Passenger
              Details
            </Text>
            {passengerTypes.flatMap(({ type }) =>
              passengers[type].map((passenger, index) => (
                <PassengerForm
                  key={`${type}-${index}`}
                  type={`${type} ${index + 1}`}
                  passenger={passenger}
                  onChange={(key, value) =>
                    handleChangePassenger(type, index, key, value)
                  }
                />
              ))
            )}

            <View style={{ height: 50 }} />
          </ScrollView>

          <TouchableOpacity style={modalStyles.doneButtonWrapper} onPress={onClose}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={modalStyles.doneButton}
            >
              <MaterialIcons name="check-circle" size={20} color={Colors.textLight} />
              <Text style={modalStyles.doneButtonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};


// --- ENHANCED Class Modal Component ---
const ClassModal = ({
  visible,
  onClose,
  travelClasses,
  setTravelClass,
  currentClass,
}) => {
  const classIcons = {
    Economy: 'airline-seat-recline-normal',
    'Premium Economy': 'airline-seat-recline-extra',
    Business: 'business',
    First: 'star',
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={modalStyles.modalHeader}
          >
            <View style={modalStyles.headerContent}>
              <View style={modalStyles.headerLeft}>
                <MaterialIcons name="airline-seat-recline-extra" size={24} color={Colors.textLight} />
                <View style={modalStyles.headerTextContainer}>
                  <Text style={modalStyles.headerTitle}>Select Class</Text>
                  <Text style={modalStyles.headerSubtitle}>Choose your comfort</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={modalStyles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={modalStyles.classContainer}>
            {travelClasses.map(cls => {
              const isActive = cls === currentClass;

              return (
                <TouchableOpacity
                  key={cls}
                  style={[
                    modalStyles.classRow,
                    isActive && modalStyles.activeClassRow,
                  ]}
                  onPress={() => {
                    setTravelClass(cls);
                    onClose();
                  }}
                >
                  <View style={modalStyles.classLeft}>
                    <View
                      style={[
                        modalStyles.classIconBg,
                        isActive && modalStyles.activeClassIconBg,
                      ]}
                    >
                      <MaterialIcons
                        name={classIcons[cls]}
                        size={22}
                        color={isActive ? Colors.textLight : Colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        modalStyles.classText,
                        isActive && modalStyles.activeClassText,
                      ]}
                    >
                      {cls}
                    </Text>
                  </View>
                  {isActive && (
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};


// --- MAIN Component with Round Trip Support ---
export default function AirTicketBookingScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.airTicket);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isClassModalVisible, setIsClassModalVisible] = useState(false);

  const [showAirportModal, setShowAirportModal] = useState(false);
  const [selectingType, setSelectingType] = useState("");

  // **NEW: Add travel type state**
  const [travelType, setTravelType] = useState('OneWay'); // 'OneWay' or 'RoundTrip'

  const [departureDate, setDepartureDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // **NEW: Add return date state**
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 7 days later
  );

  const [travelClass, setTravelClass] = useState('Economy');
  
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  
  const [passengers, setPassengers] = useState({
    Adult: [],
    Child: [],
    Infant: [],
  });

  // **UPDATED: Payload now includes travelType and returnDate**
  const payload = {
    travelType,
    fromCity,
    toCity,
    departureDate,
    ...(travelType === 'RoundTrip' && { returnDate }), // Include returnDate only for round trip
    travelClass,
    passengers,
  };

  const handleSubmit = () => {
    if(!fromCity || !toCity){
      dispatch(showSnackbar({
        message: "Please select both From and To.",
        type: 'error',
        duration: 3000,
      }));
      return;
    }

    if(!departureDate){
      dispatch(showSnackbar({
        message: "Please select a departure date.",
        type: 'error',
        duration: 3000,
      }));
      return;
    }

    if(passengers.Adult.length === 0){
      dispatch(showSnackbar({
        message: "At least one adult passenger is required.",
        type: 'error',
        duration: 3000,
      }));
      return;
    }

    if(travelType === 'roundTrip' && !returnDate){
      alert("Please select a return date for round trip.");
      return;
    }

    console.log('Booking Payload:', payload);
    dispatch(bookAirTicket(payload));
  }

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swapRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const travelClasses = ['Economy', 'Premium Economy', 'Business', 'First'];

  const totalAdults = passengers.Adult.length;
  const totalChildren = passengers.Child.length;
  const totalInfants = passengers.Infant.length;

  const passengerSummary = `${totalAdults} Adult${totalAdults > 1 ? 's' : ''}${
    totalChildren > 0
      ? `, ${totalChildren} Child${totalChildren > 1 ? 'ren' : ''}`
      : ''
  }${
    totalInfants > 0
      ? `, ${totalInfants} Infant${totalInfants > 1 ? 's' : ''}`
      : ''
  }`;

  const handleSwap = () => {
    Animated.sequence([
      Animated.timing(swapRotation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(swapRotation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const rotation = swapRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.headerWrapper}>

  <View style={styles.headerContent}>
    <MaterialIcons name="flight-takeoff" size={28} color={Colors.textLight} />
    <Text style={styles.headerTitle}>Book Your Flight</Text>
  </View>

  <TouchableOpacity onPress={() => navigation.navigate("MyAirBookings")}>
    <MaterialIcons name="airplane-ticket" size={28} color={Colors.textLight} />
  </TouchableOpacity>

</View>

        </LinearGradient>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* **UPDATED: Trip Type Selector with state management** */}
            <View style={styles.tripTypeContainer}>
              <TouchableOpacity 
                style={styles.tripTypeButton}
                onPress={() => setTravelType('OneWay')}
              >
                <View style={travelType === 'OneWay' ? styles.tripTypeActive : styles.tripTypeInactive}>
                  <MaterialIcons 
                    name={travelType === 'OneWay' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={18} 
                    color={travelType === 'OneWay' ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={travelType === 'OneWay' ? styles.tripTypeTextActive : styles.tripTypeText}>
                    One Way
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.tripTypeButton}
                onPress={() => setTravelType('RoundTrip')}
              >
                <View style={travelType === 'RoundTrip' ? styles.tripTypeActive : styles.tripTypeInactive}>
                  <MaterialIcons 
                    name={travelType === 'RoundTrip' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={18} 
                    color={travelType === 'RoundTrip' ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={travelType === 'RoundTrip' ? styles.tripTypeTextActive : styles.tripTypeText}>
                    Round Trip
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <InputField
                iconName="place"
                placeholder="City or Airport"
                label="Flying From"
                isTextInput={false}
                value={fromCity}
                onPress={() => {
                  setSelectingType("from");
                  setShowAirportModal(true);
                }}
              />

              <InputField
                iconName="place"
                placeholder="City or Airport"
                label="Flying To"
                isTextInput={false}
                value={toCity}
                onPress={() => {
                  setSelectingType("to");
                  setShowAirportModal(true);
                }}
                isSwapper={true}
                onSwap={handleSwap}
              />

              <CustomDatePickerField
                label="Departing"
                value={departureDate}
                onChange={setDepartureDate}
              />

              {/* **NEW: Conditionally render Return Date field for Round Trip** */}
              {travelType === 'RoundTrip' && (
                <CustomDatePickerField
                  label="Returning"
                  value={returnDate}
                  onChange={setReturnDate}
                />
              )}

              <InputField
                iconName="person"
                placeholder="Select Passengers"
                value={passengerSummary}
                label="Passengers"
                onPress={() => setIsModalVisible(true)}
              />

              <InputField
                iconName="chair"
                placeholder="Select Class"
                value={travelClass}
                label="Class"
                onPress={() => setIsClassModalVisible(true)}
              />
            </View>

         <TouchableOpacity
  disabled={loading}
  onPress={handleSubmit}
  style={[
    styles.searchButtonWrapper,
  ]}
>
  <LinearGradient
    colors={[Colors.primary, Colors.primaryDark]}
    style={styles.searchButton}
  >
    {loading ? (
      <ActivityIndicator color={Colors.textLight} size="small" />
    ) : (
      <>
        <Text style={styles.searchButtonText}>Book Flight</Text>
        <MaterialIcons name="flight" size={24} color={Colors.textLight} />
      </>
    )}
  </LinearGradient>
</TouchableOpacity>

            <View style={styles.infoCardsContainer}>
              <View style={styles.infoCard}>
                <MaterialIcons name="verified-user" size={20} color={Colors.primary} />
                <Text style={styles.infoCardText}>Secure Booking</Text>
              </View>
              <View style={styles.infoCard}>
                <MaterialIcons name="price-check" size={20} color={Colors.primary} />
                <Text style={styles.infoCardText}>Best Prices</Text>
              </View>
              <View style={styles.infoCard}>
                <MaterialIcons name="support-agent" size={20} color={Colors.primary} />
                <Text style={styles.infoCardText}>24/7 Support</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <PassengerModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          passengers={passengers}
          setPassengers={setPassengers}
        />

        <ClassModal
          visible={isClassModalVisible}
          onClose={() => setIsClassModalVisible(false)}
          travelClasses={travelClasses}
          setTravelClass={setTravelClass}
          currentClass={travelClass}
        />
      </SafeAreaView>

      <AirportTicketModal
        visible={showAirportModal}
        onClose={() => setShowAirportModal(false)}
        onSelect={(item) => {
          const formatted = `${item.city} (${item.code}) - ${item.airport}`;

          if (selectingType === "from") {
            setFromCity(formatted);
          } else {
            setToCity(formatted);
          }
        }}
      />
    </View>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  marginBottom: 10,
},

headerContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},

headerTitle: {
  fontSize: 24,
  fontWeight: '800',
  color: Colors.textLight,
  letterSpacing: 0.5,
},
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tripTypeButton: {
    flex: 1,
  },
  tripTypeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tripTypeInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tripTypeTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: Colors.cardBg,
    paddingTop: 10,
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeTabIconContainer: {
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeTabIndicator: {
    height: 3,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 2,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputFieldWrapper: {
    marginBottom: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 75,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconGradientBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textInputGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    paddingVertical: 0,
    height: 24,
  },
  inputText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  swapperButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -18 }],
  },
  swapperGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchButtonWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  searchButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchButtonText: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoCardText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  modalHeader: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textLight,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  counterContainer: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  counterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  counterSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  counterButtonText: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
    lineHeight: 20,
  },
  incrementText: {
    color: Colors.textLight,
  },
  counterCount: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  formSeparator: {
    height: 2,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  detailsHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  passengerForm: {
    padding: 18,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  doneButtonWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  doneButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  doneButtonText: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: '800',
  },
  classContainer: {
    padding: 20,
  },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  classLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  classIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeClassIconBg: {
    backgroundColor: Colors.primary,
  },
  classText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeClassRow: {
    backgroundColor: Colors.primaryLight + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  activeClassText: {
    fontWeight: '800',
    color: Colors.primary,
  },
});
