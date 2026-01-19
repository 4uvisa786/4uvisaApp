import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilePicker from '../../components/FilePicker';
import { useDispatch } from 'react-redux';
import { updateRequestStatus } from '../../redux/slices/adminSlice';
import { showSnackbar } from '../../redux/slices/snackbarSlice';
import { uploadMultipleToCloudinary } from '../../api/claudinary';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color';

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'rejected', 'cancelled'];

const getStatusConfig = status => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return {
        background: `${Colors.warning}15`,
        text: Colors.warning,
        border: Colors.warning,
        icon: 'schedule',
      };
    case 'processing':
      return {
        background: `${Colors.accent}15`,
        text: Colors.accent,
        border: Colors.accent,
        icon: 'sync',
      };
    case 'completed':
      return {
        background: `${Colors.success}15`,
        text: Colors.success,
        border: Colors.success,
        icon: 'check-circle',
      };
    case 'rejected':
      return {
        background: `${Colors.error}15`,
        text: Colors.error,
        border: Colors.error,
        icon: 'error',
      };
    case 'cancelled':
      return {
        background: `${Colors.error}15`,
        text: Colors.error,
        border: Colors.error,
        icon: 'cancel',
      };
    default:
      return {
        background: `${Colors.textMuted}15`,
        text: Colors.textMuted,
        border: Colors.textMuted,
        icon: 'info',
      };
  }
};

// Custom Confirmation Modal Component
const ConfirmationModal = ({ visible, onConfirm, onCancel, status }) => {
  const config = getStatusConfig(status);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmBox}>
          {/* Icon */}
          <View style={[styles.confirmIconContainer, { backgroundColor: config.background }]}>
            <MaterialIcons name={config.icon} size={48} color={config.text} />
          </View>

          {/* Title */}
          <Text style={styles.confirmTitle}>Confirm Status Change</Text>
          
          {/* Message */}
          <Text style={styles.confirmMessage}>
            Are you sure you want to change the status to{' '}
            <Text style={[styles.confirmStatusText, { color: config.text }]}>
              {status?.toUpperCase()}
            </Text>
            ?
          </Text>

          {/* Buttons */}
          <View style={styles.confirmButtons}>
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmActionBtn, { backgroundColor: config.text }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check" size={20} color={Colors.textLight} />
              <Text style={styles.confirmActionText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AdminServiceRequestDetailsScreen({ route, navigation }) {
  const { request } = route.params;
  const dispatch = useDispatch();

  const [selectedStatus, setSelectedStatus] = useState(request.status);
  const [statusToConfirm, setStatusToConfirm] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [rejectedReason, setRejectedReason] = useState('');
  const [files, setFiles] = useState([]);
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTerminalState = ['completed', 'rejected', 'cancelled'].includes(
    selectedStatus?.toLowerCase()
  );

  const handleStatusChange = status => {
    if (isTerminalState) {
      dispatch(showSnackbar({
        message: 'This request is in a final state and cannot be modified.',
        type: 'warning',
        duration: 3000,
      }));
      return;
    }

    // Show confirmation modal for all status changes
    setPendingStatus(status);
    setConfirmModalVisible(true);
  };

  const handleConfirmStatusChange = () => {
    setConfirmModalVisible(false);
    
    // For rejected/completed, show the form modal
    if (pendingStatus === 'rejected' || pendingStatus === 'completed') {
      setStatusToConfirm(pendingStatus);
      setModalVisible(true);
    } else {
      // Direct status change for pending/processing/cancelled
      updateStatus(pendingStatus);
    }
    
    setPendingStatus(null);
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
    setPendingStatus(null);
  };

  const updateStatus = async (status, extraData = {}) => {
    try {
      await dispatch(
        updateRequestStatus({
          requestId: request._id,
          statusData: { newStatus: status, ...extraData },
        })
      ).unwrap();
      
      setSelectedStatus(status);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitModal = async () => {
    if (isSubmitting) return;

    if (statusToConfirm === 'rejected') {
      if (!rejectedReason.trim()) {
        dispatch(showSnackbar({
          message: 'Please provide a reason for rejection.',
          type: 'warning',
          duration: 3000,
        }));
        return;
      }
    } else if (statusToConfirm === 'completed') {
      if (!label || files.length === 0) {
        dispatch(showSnackbar({
          message: 'Please provide label and upload at least one file.',
          type: 'warning',
          duration: 3000,
        }));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (statusToConfirm === 'rejected') {
        await updateStatus('rejected', { rejectedReason });
      } else if (statusToConfirm === 'completed') {
        dispatch(showSnackbar({
          message: 'Uploading files...',
          type: 'info',
          duration: 2000,
        }));

        const uploadedURLs = await uploadMultipleToCloudinary(files);
        const outputs = uploadedURLs.map(file => ({ label, ...file }));
        await updateStatus('completed', { outputs });

        setFiles([]);
        setLabel('');
      }

      setStatusToConfirm(null);
      setRejectedReason('');
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      dispatch(showSnackbar({
        message: 'File upload failed. Please try again.',
        type: 'error',
        duration: 4000,
      }));
    }

    setIsSubmitting(false);
  };

  const handleCancelModal = () => {
    setStatusToConfirm(null);
    setRejectedReason('');
    setFiles([]);
    setLabel('');
    setModalVisible(false);
  };

  const currentStatusConfig = getStatusConfig(selectedStatus);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Request Details</Text>
          <Text style={styles.headerSubtitle}>ID: {request._id?.slice(-8)}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardHeader}>
            <MaterialIcons
              name={currentStatusConfig.icon}
              size={32}
              color={currentStatusConfig.text}
            />
            <View style={styles.statusCardText}>
              <Text style={styles.statusCardLabel}>Current Status</Text>
              <Text
                style={[
                  styles.statusCardValue,
                  { color: currentStatusConfig.text },
                ]}
              >
                {selectedStatus.toUpperCase()}
              </Text>
            </View>
          </View>
          {isTerminalState && (
            <View style={styles.lockedBadge}>
              <MaterialIcons name="lock" size={14} color={Colors.error} />
              <Text style={styles.lockedText}>Final State - Locked</Text>
            </View>
          )}
        </View>

        {/* Update Status Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="edit" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Update Status</Text>
          </View>

          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map(status => {
              const config = getStatusConfig(status);
              const isActive = selectedStatus?.toLowerCase() === status;

              return (
                <TouchableOpacity
                  key={status}
                  disabled={isTerminalState}
                  style={[
                    styles.statusButton,
                    {
                      borderColor: isActive ? config.border : Colors.border,
                      backgroundColor: isActive ? config.border : Colors.cardBg,
                    },
                    isTerminalState && styles.statusButtonDisabled,
                  ]}
                  onPress={() => handleStatusChange(status)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={config.icon}
                    size={18}
                    color={isActive ? Colors.textLight : config.text}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      { color: isActive ? Colors.textLight : config.text },
                    ]}
                  >
                    {status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Request Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Request Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="business-center" size={18} color={Colors.textMuted} />
              <Text style={styles.infoLabel}>Service</Text>
            </View>
            <Text style={styles.infoValue}>{request.service?.name || 'Unknown'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={18} color={Colors.textMuted} />
              <Text style={styles.infoLabel}>Submitted</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(request.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {request.country && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="public" size={18} color={Colors.textMuted} />
                <Text style={styles.infoLabel}>Country</Text>
              </View>
              <Text style={styles.infoValue}>{request.country}</Text>
            </View>
          )}
        </View>

        {/* Client Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Client Details</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="email" size={18} color={Colors.textMuted} />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{request.user?.email}</Text>
          </View>

          {request.user?.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="phone" size={18} color={Colors.textMuted} />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>{request.user?.phone}</Text>
            </View>
          )}

          {request.user?.firstName && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="badge" size={18} color={Colors.textMuted} />
                <Text style={styles.infoLabel}>Name</Text>
              </View>
              <Text style={styles.infoValue}>
                {request.user.firstName} {request.user.lastName}
              </Text>
            </View>
          )}
        </View>

        {/* Form Data */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="description" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Submitted Form Data</Text>
          </View>

          {Object.keys(request.formData || {}).length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No form data submitted</Text>
            </View>
          ) : (
            Object.entries(request.formData || {}).map(([key, value]) => (
              <View key={key} style={styles.formDataRow}>
                <Text style={styles.formKey}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text style={styles.formValue}>{String(value)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModalVisible}
        status={pendingStatus}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelConfirm}
      />

      {/* Form Modal (for rejected/completed) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {statusToConfirm === 'rejected'
                  ? 'Reject Request'
                  : 'Complete Request'}
              </Text>
              <TouchableOpacity
                onPress={handleCancelModal}
                disabled={isSubmitting}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {statusToConfirm === 'rejected' ? (
                <View style={styles.modalBody}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Rejection Reason *</Text>
                    <TextInput
                      placeholder="Enter reason for rejection..."
                      placeholderTextColor={Colors.textMuted}
                      style={styles.textArea}
                      value={rejectedReason}
                      onChangeText={setRejectedReason}
                      multiline
                      numberOfLines={5}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.modalBody}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Output Label *</Text>
                    <View style={styles.inputContainer}>
                      <MaterialIcons
                        name="label"
                        size={20}
                        color={Colors.textMuted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="e.g., Approved Visa"
                        placeholderTextColor={Colors.textMuted}
                        style={styles.input}
                        value={label}
                        onChangeText={setLabel}
                        editable={!isSubmitting}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Upload Files *</Text>
                    <FilePicker
                      label="Select Files"
                      onFilesPicked={pickedFiles => setFiles(pickedFiles)}
                    />
                    {files.length > 0 && (
                      <View style={styles.filesInfo}>
                        <MaterialIcons
                          name="check-circle"
                          size={16}
                          color={Colors.success}
                        />
                        <Text style={styles.filesInfoText}>
                          {files.length} file{files.length !== 1 ? 's' : ''} selected
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelModal}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitModal}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.textLight} size="small" />
                ) : (
                  <>
                    <MaterialIcons
                      name={statusToConfirm === 'rejected' ? 'cancel' : 'check-circle'}
                      size={20}
                      color={Colors.textLight}
                    />
                    <Text style={styles.submitButtonText}>
                      {statusToConfirm === 'rejected' ? 'Reject' : 'Complete'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Status Card
  statusCard: {
    backgroundColor: Colors.cardBg,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusCardText: {
    flex: 1,
  },
  statusCardLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusCardValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  lockedText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '700',
  },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Status Grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: 12,
    minWidth: '47%',
    justifyContent: 'center',
    gap: 6,
  },
  statusButtonDisabled: {
    opacity: 0.4,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },

  // Form Data
  formDataRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  formKey: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  formValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },

  // Confirmation Modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmBox: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmStatusText: {
    fontWeight: '800',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  confirmActionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmActionText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textLight,
  },

  // Form Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },

  // Input Group
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 14,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  filesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  filesInfoText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight,
  },
});
