import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color'; // Adjust path as needed

export default function AdminProfileScreen() {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    passportNumber: user?.passportNumber || '',
    passportExpiry: user?.passportExpiry || '',
  });

  const [initialUserData, setInitialUserData] = useState({ ...userData });
  const [isEditing, setIsEditing] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setInitialUserData({ ...userData });
  }, []);

  const handleChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Reset to initial data when canceling
      setUserData({ ...initialUserData });
    }
    setIsEditing(prev => !prev);
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API save
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      setInitialUserData({ ...userData });
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1000);
  };

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
        },
      },
    ]);
  };

  const renderField = (label, fieldKey, icon, keyboardType = 'default') => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <MaterialIcons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      {isEditing ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userData[fieldKey]}
            onChangeText={text => handleChange(fieldKey, text)}
            keyboardType={keyboardType}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={Colors.textMuted}
            editable={fieldKey !== 'email'} // Email typically non-editable
          />
        </View>
      ) : (
        <Text style={styles.valueText}>{userData[fieldKey] || 'Not provided'}</Text>
      )}
    </View>
  );

  const getInitials = () => {
    const first = userData.firstName?.[0] || '';
    const last = userData.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          {isEditing ? 'Edit Profile' : 'Admin Profile'}
        </Text>
        <TouchableOpacity
          onPress={toggleEditMode}
          style={styles.editButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isEditing ? 'close' : 'edit'}
            size={22}
            color={Colors.primary}
          />
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <MaterialIcons name="camera-alt" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>
            {userData.firstName} {userData.lastName}
          </Text>
          <View style={styles.userEmailContainer}>
            <MaterialIcons
              name="verified-user"
              size={14}
              color={Colors.success}
              style={styles.verifiedIcon}
            />
            <Text style={styles.userRole}>Admin Account</Text>
          </View>
          <View style={styles.emailBadge}>
            <MaterialIcons
              name="email"
              size={14}
              color={Colors.textSecondary}
              style={styles.emailIcon}
            />
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          <View style={styles.cardContent}>
            {renderField('First Name', 'firstName', 'person-outline')}
            {renderField('Last Name', 'lastName', 'person-outline')}
            {renderField('Email', 'email', 'email', 'email-address')}
            {renderField('Phone Number', 'phone', 'phone', 'phone-pad')}
          </View>
        </View>

        {/* Travel Documents Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="card-travel" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Travel Documents</Text>
          </View>
          <View style={styles.cardContent}>
            {renderField('Passport Number', 'passportNumber', 'credit-card')}
            {renderField('Passport Expiry', 'passportExpiry', 'event')}

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="upload-file" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionLabel}>Manage Document Uploads</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="settings" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Settings & Preferences</Text>
          </View>
          <View style={styles.cardContent}>
            {/* Notifications Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="notifications"
                  size={20}
                  color={Colors.textSecondary}
                />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive updates about requests
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{
                  false: Colors.borderDark,
                  true: `${Colors.primary}50`,
                }}
                thumbColor={
                  isNotificationsEnabled ? Colors.primary : Colors.textMuted
                }
                onValueChange={setIsNotificationsEnabled}
                value={isNotificationsEnabled}
              />
            </View>

            <View style={styles.divider} />

            {/* Action Links */}
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="lock" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionLabel}>Change Password</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="security" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionLabel}>Security Settings</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="language" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionLabel}>Language</Text>
              </View>
              <View style={styles.actionRight}>
                <Text style={styles.actionValue}>English</Text>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={Colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Tools Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="admin-panel-settings" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Admin Tools</Text>
          </View>
          <View style={styles.cardContent}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="assessment" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionLabel}>System Reports</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="history" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionLabel}>Activity Log</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <MaterialIcons name="backup" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionLabel}>Backup & Restore</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button (Visible only in edit mode) */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textLight} />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color={Colors.textLight} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        {!isEditing && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color={Colors.error} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text style={styles.versionText}>Admin Panel v1.0.0</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 10,
    gap: 6,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.cardBg,
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: `${Colors.primary}20`,
  },
  avatarText: {
    color: Colors.textLight,
    fontWeight: '800',
    fontSize: 36,
    letterSpacing: 1,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.cardBg,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  userEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.success}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    gap: 4,
  },
  verifiedIcon: {
    marginRight: 2,
  },
  userRole: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '700',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.accent}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  emailIcon: {
    marginRight: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: `${Colors.primary}05`,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardContent: {
    padding: 16,
  },

  // Field
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  input: {
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontWeight: '500',
  },

  // Settings Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Buttons
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: Colors.textLight,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.error}10`,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 20,
    fontWeight: '500',
  },
});
