import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color'; // Adjust path as needed
import { changePassword, logout } from '../../redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../redux/slices/snackbarSlice';

// --- Enhanced Setting Item Component ---
const SettingItem = ({
  label,
  icon,
  onPress,
  isDestructive = false,
  subtitle,
  showBadge,
  badgeText,
}) => (
  <TouchableOpacity
    style={styles.itemContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View
        style={[
          styles.iconContainer,
          isDestructive && styles.iconContainerDestructive,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={20}
          color={isDestructive ? Colors.error : Colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[styles.itemLabel, isDestructive && styles.destructiveText]}
        >
          {label}
        </Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.itemRight}>
      {showBadge && badgeText && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
      <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
    </View>
  </TouchableOpacity>
);

// --- Enhanced Toggle Component ---
const SettingToggle = ({ label, icon, value, onToggle, subtitle }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <Switch
      trackColor={{
        false: Colors.borderDark,
        true: `${Colors.primary}50`,
      }}
      thumbColor={value ? Colors.primary : Colors.textMuted}
      onValueChange={onToggle}
      value={value}
      ios_backgroundColor={Colors.borderDark}
    />
  </View>
);

export default function SettingsScreen({navigation}) {
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Change Password Modal States
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();

  // Clear cache handler
 const handleClearCache = () => {
  Alert.alert(
    'Clear Cache',
    'Are you sure you want to clear the local application cache? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          dispatch(showSnackbar({ message: 'Cache cleared successfully', type: 'success' }));
        },
      },
    ],
  );
};

  // Change Password Handler
 const handleChangePassword = async () => {
  if (!oldPassword.trim() || !newPassword.trim()) {
    dispatch(showSnackbar({ message: 'Please fill in all password fields', type: 'error' }));
    return;
  }

  if (newPassword.length < 6) {
    dispatch(showSnackbar({ message: 'New password must be at least 6 characters', type: 'error' }));
    return;
  }

  setIsSubmitting(true);

  try {
    const msg = await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
    dispatch(showSnackbar({ message: msg || 'Password updated successfully!', type: 'success' }));
    handleClosePasswordModal();
  } catch (error) {
    dispatch(showSnackbar({ message: error || 'Failed to update password', type: 'error' }));
  } finally {
    setIsSubmitting(false);
  }
};
  // Close Modal Handler
  const handleClosePasswordModal = () => {
    setIsPasswordModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  // Navigation handler
  const handleNavigate = screen => {
    if (screen === 'ChangePassword') {
      setIsPasswordModalVisible(true);
    }
    if(screen==='Profile'){
      navigation.navigate('Profile');
    }
     else {
      Alert.alert('Navigation', `Would navigate to the ${screen} screen.`);
    }
  };

  // Logout handler
 const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout from your account?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(showSnackbar({ message: 'You have been logged out successfully', type: 'success' }));
          dispatch(logout());
        },
      },
    ],
  );
};


  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Settings</Text>
          <Text style={styles.screenSubtitle}>Manage your preferences</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Account Section --- */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.sectionContainer}>
          <SettingItem
            label="Edit Profile"
            icon="person"
            subtitle="Update your personal information"
            onPress={() => handleNavigate('Profile')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Change Password"
            icon="lock"
            subtitle="Update your password"
            onPress={() => handleNavigate('ChangePassword')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Language"
            icon="language"
            subtitle="English"
            onPress={() => handleNavigate('Language')}
            showBadge
            badgeText="EN"
          />
        </View>

        {/* --- Notifications Section --- */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.sectionContainer}>
          <SettingToggle
            label="Push Notifications"
            icon="notifications"
            subtitle="Receive push notifications"
            value={isPushEnabled}
            onToggle={setIsPushEnabled}
          />
          <View style={styles.separator} />
          <SettingToggle
            label="Email Notifications"
            icon="email"
            subtitle="Receive email updates"
            value={isEmailEnabled}
            onToggle={setIsEmailEnabled}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Notification Preferences"
            icon="tune"
            subtitle="Customize notification types"
            onPress={() => handleNavigate('NotificationPreferences')}
          />
        </View>

        {/* --- Privacy & Security Section --- */}
        <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
        <View style={styles.sectionContainer}>
          <SettingToggle
            label="Location Services"
            icon="location-on"
            subtitle="Allow app to access location"
            value={isLocationEnabled}
            onToggle={setIsLocationEnabled}
          />
          <View style={styles.separator} />
          <SettingToggle
            label="Biometric Authentication"
            icon="fingerprint"
            subtitle="Use fingerprint or face ID"
            value={isBiometricEnabled}
            onToggle={setIsBiometricEnabled}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Two-Factor Authentication"
            icon="security"
            subtitle="Add extra security layer"
            onPress={() => handleNavigate('TwoFactorAuth')}
            showBadge
            badgeText="New"
          />
          <View style={styles.separator} />
          <SettingItem
            label="Blocked Users"
            icon="block"
            subtitle="Manage blocked accounts"
            onPress={() => handleNavigate('BlockedUsers')}
          />
        </View>

        {/* --- Data & Storage Section --- */}
        <Text style={styles.sectionTitle}>DATA & STORAGE</Text>
        <View style={styles.sectionContainer}>
          <SettingItem
            label="Storage Usage"
            icon="storage"
            subtitle="View app storage details"
            onPress={() => handleNavigate('StorageUsage')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Export Data"
            icon="download"
            subtitle="Download your data"
            onPress={() => handleNavigate('DataExport')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Clear Cache"
            icon="delete-sweep"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
        </View>

        {/* --- Support & Legal Section --- */}
        <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
        <View style={styles.sectionContainer}>
          <SettingItem
            label="Help Center"
            icon="help"
            subtitle="Get help and support"
            onPress={() => handleNavigate('HelpCenter')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Contact Us"
            icon="email"
            subtitle="Send us a message"
            onPress={() => handleNavigate('ContactUs')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Terms of Service"
            icon="description"
            subtitle="Read our terms"
            onPress={() => handleNavigate('TermsOfService')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="Privacy Policy"
            icon="privacy-tip"
            subtitle="How we handle your data"
            onPress={() => handleNavigate('PrivacyPolicy')}
          />
          <View style={styles.separator} />
          <SettingItem
            label="About App"
            icon="info"
            subtitle="Version 1.0.0"
            onPress={() => handleNavigate('AboutApp')}
          />
        </View>

        {/* --- Danger Zone --- */}
        <Text style={styles.sectionTitle}>DANGER ZONE</Text>
        <View style={styles.sectionContainer}>
          <SettingItem
            label="Delete Account"
            icon="delete-forever"
            subtitle="Permanently delete your account"
            onPress={() =>
              Alert.alert('Delete Account', 'This feature is coming soon.')
            }
            isDestructive
          />
          <View style={styles.separator} />
          <SettingItem
            label="Logout"
            icon="logout"
            subtitle="Sign out from this device"
            onPress={handleLogout}
            isDestructive
          />
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>VisaAssist App</Text>
          <Text style={styles.footerVersion}>Version 1.0.0 (Build 100)</Text>
          <Text style={styles.footerCopyright}>© 2025 All rights reserved</Text>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleClosePasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <MaterialIcons name="lock" size={24} color={Colors.primary} />
              </View>
              <TouchableOpacity
                onPress={handleClosePasswordModal}
                style={styles.closeButton}
                disabled={isSubmitting}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Modal Title */}
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your current and new password
            </Text>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Old Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors.textMuted}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPassword}
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={styles.eyeIcon}
                    disabled={isSubmitting}
                  >
                    <MaterialIcons
                      name={showOldPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={Colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                    disabled={isSubmitting}
                  >
                    <MaterialIcons
                      name={showNewPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClosePasswordModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.textLight} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Update Password</Text>
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

  // Header Styles
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
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // Scroll View
  scrollView: {
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 30,
  },

  // Section Styles
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
    letterSpacing: 1,
  },
  sectionContainer: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Item Styles
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDestructive: {
    backgroundColor: `${Colors.error}10`,
  },
  textContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  destructiveText: {
    color: Colors.error,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },

  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 64, // Align with text after icon
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  footerCopyright: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: -0.2,
  },
});
