import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../redux/slices/snackbarSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs'
import Colors from '../../themes/color';

// Status Timeline Component
const StatusTimeline = ({ status }) => {
  const statuses = ['pending', 'processing', 'completed'];
  const currentIndex = statuses.indexOf(status);
  const isCancelled = status === 'cancelled';
  const isRejected = status === 'rejected';

  if (isCancelled || isRejected) {
    return (
      <View style={timelineStyles.container}>
        <View style={timelineStyles.failedContainer}>
          <MaterialIcons
            name={isCancelled ? 'cancel' : 'error'}
            size={48}
            color={Colors.error}
          />
          <Text style={timelineStyles.failedTitle}>
            {isCancelled ? 'Request Cancelled' : 'Request Rejected'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={timelineStyles.container}>
      {statuses.map((item, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <View key={item} style={timelineStyles.step}>
            {/* Step Circle */}
            <View style={timelineStyles.stepIndicator}>
              <View
                style={[
                  timelineStyles.circle,
                  isActive && timelineStyles.circleActive,
                  isCurrent && timelineStyles.circleCurrent,
                ]}
              >
                {isActive && index < currentIndex ? (
                  <MaterialIcons name="check" size={16} color={Colors.textLight} />
                ) : isCurrent ? (
                  <View style={timelineStyles.currentDot} />
                ) : null}
              </View>

              {/* Connecting Line */}
              {index < statuses.length - 1 && (
                <View
                  style={[
                    timelineStyles.line,
                    isActive && timelineStyles.lineActive,
                  ]}
                />
              )}
            </View>

            {/* Step Label */}
            <View style={timelineStyles.stepLabel}>
              <Text
                style={[
                  timelineStyles.stepTitle,
                  isActive && timelineStyles.stepTitleActive,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const timelineStyles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  circleCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textLight,
  },
  line: {
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  lineActive: {
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepTitleActive: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  failedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  failedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.error,
    marginTop: 12,
  },
});

// Get Status Config
const getStatusConfig = status => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return {
        bg: `${Colors.warning}15`,
        text: Colors.warning,
        icon: 'schedule',
        label: 'Pending Review',
      };
    case 'processing':
      return {
        bg: `${Colors.accent}15`,
        text: Colors.accent,
        icon: 'sync',
        label: 'In Progress',
      };
    case 'completed':
      return {
        bg: `${Colors.success}15`,
        text: Colors.success,
        icon: 'check-circle',
        label: 'Completed',
      };
    case 'rejected':
      return {
        bg: `${Colors.error}15`,
        text: Colors.error,
        icon: 'cancel',
        label: 'Rejected',
      };
    case 'cancelled':
      return {
        bg: `${Colors.error}15`,
        text: Colors.error,
        icon: 'block',
        label: 'Cancelled',
      };
    default:
      return {
        bg: `${Colors.textMuted}15`,
        text: Colors.textMuted,
        icon: 'info',
        label: 'Unknown',
      };
  }
};

export default function UserRequestDetailedScreen({ route, navigation }) {
  const { request } = route.params;
  const dispatch = useDispatch();
  const statusConfig = getStatusConfig(request.status);


const handleDownload = async (doc) => {
  try {
    const { url, filename } = doc
    console.log(doc);

    const downloadDir = RNFS.DownloadDirectoryPath;
    const localFile = `${downloadDir}/${filename}.jpg`;

    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: localFile,
    }).promise;

    if (result.statusCode === 200) {
      // 🔥 THIS LINE MAKES FILE VISIBLE
      await RNFS.scanFile(localFile);

      Alert.alert('Download Success', 'Image saved to Downloads');
      console.log('Saved at:', localFile);
    }
  } catch (e) {
    console.log('Download error', e);
  }
};

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

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.bg }]}>
              <MaterialIcons name={statusConfig.icon} size={32} color={statusConfig.text} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusValue, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Priority Badge */}
          <View style={styles.priorityContainer}>
            <MaterialIcons
              name="flag"
              size={16}
              color={
                request.priority === 'high'
                  ? Colors.error
                  : request.priority === 'medium'
                  ? Colors.warning
                  : Colors.textMuted
              }
            />
            <Text style={styles.priorityText}>
              {request.priority?.toUpperCase()} Priority
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="timeline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Progress Timeline</Text>
          </View>
          <StatusTimeline status={request.status} />
        </View>

        {/* Service Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="business-center" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Service Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="label" size={18} color={Colors.textMuted} />
              <Text style={styles.infoLabel}>Service Name</Text>
            </View>
            <Text style={styles.infoValue}>
              {request.service?.name || 'N/A'}
              {request.subServiceName ? ` | ${request.subServiceName}` : ''}
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

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={18} color={Colors.textMuted} />
              <Text style={styles.infoLabel}>Submitted On</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(request.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {request.completedAt && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="event-available" size={18} color={Colors.textMuted} />
                <Text style={styles.infoLabel}>Completed On</Text>
              </View>
              <Text style={styles.infoValue}>
                {new Date(request.completedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Form Data */}
        {Object.keys(request.formData || {}).length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="description" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Application Details</Text>
            </View>

            {Object.entries(request.formData).map(([key, value]) => (
              <View key={key} style={styles.formDataRow}>
                <Text style={styles.formKey}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text style={styles.formValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Uploaded Documents */}
        {request.documents && request.documents.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="folder" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Uploaded Documents ({request.documents.length})</Text>
            </View>

            {request.documents.map((doc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.documentItem}
                onPress={() => handleDownload(doc)}
                activeOpacity={0.7}
              >
                <View style={styles.documentIcon}>
                  <MaterialIcons name="insert-drive-file" size={24} color={Colors.accent} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.filename || doc.label || `Document ${index + 1}`}
                  </Text>
                  {doc.uploadedAt && (
                    <Text style={styles.documentDate}>
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                    </Text>
                  )}
                </View>
                <MaterialIcons name="cloud-download" size={20} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Output Files (Completed Requests) */}
        {request.outputs && request.outputs.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="file-download" size={20} color={Colors.success} />
              <Text style={styles.cardTitle}>Output Documents ({request.outputs.length})</Text>
            </View>

            <View style={styles.outputBanner}>
              <MaterialIcons name="celebration" size={24} color={Colors.success} />
              <Text style={styles.outputBannerText}>
                Your documents are ready for download!
              </Text>
            </View>

            {request.outputs.map((output, index) => (
              <TouchableOpacity
                key={index}
                style={styles.outputItem}
                onPress={() => handleDownload(output)}
                activeOpacity={0.7}
              >
                <View style={styles.outputIconContainer}>
                  <MaterialIcons name="verified" size={28} color={Colors.success} />
                </View>
                <View style={styles.outputInfo}>
                  <Text style={styles.outputLabel}>{output.label}</Text>
                  {output.uploadedAt && (
                    <Text style={styles.outputDate}>
                      Generated: {new Date(output.uploadedAt).toLocaleDateString('en-IN')}
                    </Text>
                  )}
                </View>
                <View style={styles.downloadButton}>
                  <MaterialIcons name="download" size={24} color={Colors.textLight} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Rejection Reason */}
        {request.status === 'rejected' && request.rejectedReason && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="error" size={20} color={Colors.error} />
              <Text style={styles.cardTitle}>Rejection Reason</Text>
            </View>

            <View style={styles.rejectionBox}>
              <Text style={styles.rejectionText}>{request.rejectedReason}</Text>
            </View>
          </View>
        )}

        {/* Help Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="help" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Need Help?</Text>
          </View>

          <TouchableOpacity  onPress={() => navigation.navigate("Help")} style={styles.helpButton} activeOpacity={0.7}>
            <MaterialIcons name="support-agent" size={20} color={Colors.primary} />
            <Text style={styles.helpButtonText}>Contact Support</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },

  // Status Card
  statusCard: {
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
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
    fontWeight: '700',
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

  // Documents
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Outputs
  outputBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.success}10`,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  outputBannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
    flex: 1,
  },
  outputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.success}05`,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: `${Colors.success}30`,
    gap: 12,
  },
  outputIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${Colors.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outputInfo: {
    flex: 1,
  },
  outputLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  outputDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Rejection
  rejectionBox: {
    backgroundColor: `${Colors.error}10`,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  rejectionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Help
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  helpButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
