import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Assuming Colors import path is correct
import Colors from '../../themes/color';
import { countryFlags } from '../../components/countryFlags'; // Utility mapping country names to flags

// Define UI Types for Sub-Services
const SubServiceUITypes = {
  DROPDOWN: 'dropdown',
  CARD: 'card', // For a grid/list of selectable cards
};

export default function UserServiceDetailsScreen({ route, navigation }) {
  const { service } = route.params;

  // Initialize selectedSubService with the first item or null
  const [selectedSubService, setSelectedSubService] = useState(
    service.subServices && service.subServices.length > 0
      ? service.subServices[0]
      : null
  );

  // Controls Modal visibility (only used for 'dropdown' UI type)
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- Helper Functions ---

  const handleApply = (subService) => {
    if (subService) {
      navigation.navigate('UserApplyForm', {
        service,
        subService,
      });
    }
  };

  const handleSelectSubService = (subService) => {
    setSelectedSubService(subService);
    // Close the modal if it's open (only relevant for dropdown)
    setIsModalVisible(false);
  };


const getSubServiceFlag = (subServiceName) => {
  return countryFlags[subServiceName] || "🌍";
};

  const getAirlineLogo = (airline) => {
    const logos = {
      'Emirates': '✈️', 'Qatar Airways': '🛫', 'Singapore Airlines': '🟦',
      'Etihad': '🛩️', 'Lufthansa': '🇩🇪', 'Air India': '🇮🇳',
      'IndiGo': '🔷', 'Vistara': '🟣', 'British Airways': '🇬🇧',
      'Turkish Airlines': '🇹🇷',
    };
    return logos[airline] || '✈️';
  };

  const isSubServiceSelected = (subService) => {
    return selectedSubService && selectedSubService._id === subService._id;
  };

  // --------------------------------------------------
  // Modal Component for Sub-Service Selection (DROPDOWN UI)
  // --------------------------------------------------
  const SubServiceSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>

          {/* Modal Header */}
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Select a Service Option</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={modalStyles.closeButton}
            >
              <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.modalScrollView}>
            {service.subServices.map((subService) => (
              <TouchableOpacity
                key={subService._id}
                style={[
                  modalStyles.subServiceListItem,
                  isSubServiceSelected(subService) && modalStyles.subServiceListItemSelected,
                ]}
                onPress={() => handleSelectSubService(subService)}
                activeOpacity={0.7}
              >
                <View style={styles.subServiceContent}>
                  <Text style={styles.subServiceFlag}>{getSubServiceFlag(subService.name)}</Text>
                  <Text style={[
                    styles.subServiceName,
                    isSubServiceSelected(subService) && styles.subServiceNameSelected,
                  ]}>
                    {subService.name}
                  </Text>
                </View>
                {isSubServiceSelected(subService) && (
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
  // --------------------------------------------------

  // --------------------------------------------------
  // Sub-Service Renderer (Conditional Logic)
  // --------------------------------------------------
  const SubServiceSection = () => {
    if (!service.subServices || service.subServices.length === 0) {
      return null;
    }

    // --- DROPDOWN UI (Default/Selected for Modal) ---
    if (service.subServicesUIType === SubServiceUITypes.DROPDOWN || !service.subServicesUIType) {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="public" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Available Countries</Text>
          </View>
          {/* <Text style={styles.cardSubtitle}>
            Select a specific country to proceed with your application.
          </Text> */}

          {/* Sub-Service Dropdown Trigger - Opens Modal */}
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownTriggerContent}>
              {selectedSubService ? (
                <>
                  <Text style={styles.subServiceFlag}>
                    {getSubServiceFlag(selectedSubService.name)}
                  </Text>
                  <Text style={styles.dropdownTriggerTextSelected}>
                    {selectedSubService.name}
                  </Text>
                </>
              ) : (
                <Text style={styles.dropdownTriggerTextPlaceholder}>
                  Select an Option...
                </Text>
              )}
            </View>
            <MaterialIcons
              name={"arrow-drop-down"}
              size={38}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      );
    }

    // --- CARD/GRID UI ---
    if (service.subServicesUIType === SubServiceUITypes.CARD) {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="public" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Available Services</Text>
          </View>
          {/* <Text style={styles.cardSubtitle}>
            Select a specific service to proceed with your application.
          </Text> */}

          <View style={styles.subServiceGrid}>
            {service.subServices.map((subService) => (
              <TouchableOpacity
                key={subService._id}
                style={[
                  styles.subServiceCard,
                  isSubServiceSelected(subService) && styles.subServiceCardSelected,
                ]}
                onPress={() => handleSelectSubService(subService)} // Use handleSelectSubService here
                activeOpacity={0.7}
              >
                <View style={styles.subServiceContent}>
                  {/* <Text style={styles.subServiceFlag}>{getSubServiceFlag(subService.name)}</Text> */}
                  <Text style={[
                    styles.subServiceName,
                    isSubServiceSelected(subService) && styles.subServiceNameSelected,
                  ]}>
                    {subService.name}
                  </Text>
                </View>

                {/* Optional: Add a checkmark for selected state on the right */}
                {isSubServiceSelected(subService) && (
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                )}

                {/* You might keep the apply button separate if the main floating button is sufficient */}
                {/* <TouchableOpacity
                  style={styles.subServiceApplyButton}
                  onPress={() => handleApply(subService)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.subServiceApplyText}>Select</Text>
                  <MaterialIcons name="arrow-forward" size={14} color={Colors.textLight} />
                </TouchableOpacity> */}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return null;
  };
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      {/* 1. Render the Modal (only for dropdown type) */}
      {service.subServicesUIType === SubServiceUITypes.DROPDOWN && SubServiceSelectionModal()}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Image (Unchanged) */}
        {service.imageURL ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: service.imageURL }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <View style={styles.badge}>
                <MaterialIcons name="verified" size={16} color={Colors.textLight} />
                <Text style={styles.badgeText}>Official Service</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="image" size={48} color={Colors.textMuted} />
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}

        {/* Service Title (Unchanged) */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{service.name}</Text>
          <View style={styles.processingTimeContainer}>
            <MaterialIcons name="schedule" size={18} color={Colors.accent} />
            <Text style={styles.processingTime}>
              {service.estimatedProcessingDays} Days Processing
            </Text>
          </View>
        </View>

        {/* 2. Sub-Services Section (Conditional Rendering) */}
        {SubServiceSection()}


        {/* Available Airlines (Kept as is - independent selection/grid) */}
        {service.airlines && service.airlines.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="flight" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Available Airlines</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Select an airline to apply for this service
            </Text>

            <View style={styles.subServiceGrid}>
              {service.airlines.map((airline, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.subServiceCard}
                  onPress={() => handleApply({ name: airline, formFields: [], _id: `airline-${index}` })}
                  activeOpacity={0.7}
                >
                  <View style={styles.subServiceContent}>
                    <Text style={styles.subServiceFlag}>{getAirlineLogo(airline)}</Text>
                    <Text
                      style={styles.subServiceName}
                    >
                      {airline}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.subServiceApplyButton}
                    onPress={() => handleApply({ name: airline, formFields: [], _id: `airline-${index}` })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.subServiceApplyText}>Apply</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={14}
                      color={Colors.textLight}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


        {/* Description, Required Documents, Processing Details (Unchanged) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="description" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Description</Text>
          </View>
          <Text style={styles.descriptionText}>
            {service.description || 'No description available'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="folder" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Required Documents</Text>
          </View>
          {service.requiredDocuments && service.requiredDocuments.length > 0 ? (
            <View style={styles.documentsList}>
              {service.requiredDocuments.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <View style={styles.documentIcon}>
                    <MaterialIcons
                      name="insert-drive-file"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.documentText}>{doc}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="check-circle" size={24} color={Colors.success} />
              <Text style={styles.emptyStateText}>No documents required</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Processing Information</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="schedule" size={20} color={Colors.accent} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Processing Time</Text>
                <Text style={styles.infoValue}>
                  {service.estimatedProcessingDays} Business Days
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <MaterialIcons name="lightbulb" size={16} color={Colors.warning} />
            <Text style={styles.noteText}>
              Processing times may vary depending on the **selected sub-service** and current workload
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button (Applies to the currently selected sub-service) */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.generalApplyButton,
            !selectedSubService && { backgroundColor: Colors.textMuted }
          ]}
          onPress={() => selectedSubService && handleApply(selectedSubService)}
          activeOpacity={selectedSubService ? 0.8 : 1}
          disabled={!selectedSubService}
        >
          <MaterialIcons name="send" size={20} color={Colors.textLight} />
          <Text style={styles.generalApplyButtonText}>
            {selectedSubService ? `Apply for ${selectedSubService.name}` : 'Select a Service Option to Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


// -----------------------------------------------------------------------
// 🎨 Stylesheets (Combined Styles)
// NOTE: I've included the modal styles here too for completeness, 
// and added a 'subServiceCardSelected' style for the CARD UI.
// -----------------------------------------------------------------------

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    maxHeight: '90%',
  },
  subServiceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subServiceListItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
});


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },

  // Image Section
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  placeholderImage: {
    backgroundColor: Colors.background,
    width: '100%',
    height: 220,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },

  // Title Section
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  processingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  processingTime: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '700',
  },

  // Card Styles
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },

  // Dropdown Trigger Styles
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  dropdownTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownTriggerTextPlaceholder: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  dropdownTriggerTextSelected: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Re-used Sub-Service Styles
  subServiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  subServiceFlag: {
    fontSize: 28,
  },
  subServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subServiceNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Airline Grid / Card Grid Styles
  subServiceGrid: {
    gap: 12,
  },
  subServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  subServiceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}05`, // Light background tint
  },
  subServiceApplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  subServiceApplyText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },

  // Description
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Documents List
  documentsList: {
    gap: 10,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  documentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },

  // Processing Info
  infoRow: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 10,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  // Note Container
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${Colors.warning}10`,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },

  // Bottom Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  generalApplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generalApplyButtonText: {
    color: Colors.textLight,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});