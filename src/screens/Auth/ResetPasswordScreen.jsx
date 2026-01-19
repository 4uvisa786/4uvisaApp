import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../redux/slices/authSlice';
import { showSnackbar } from '../../redux/slices/snackbarSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, otp } = route.params;
  const dispatch = useDispatch();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [otpFocused, setOtpFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const { authLoading } = useSelector(state => state.auth);

  const handleResetPassword = async () => {
    // Validate OTP
    if (enteredOtp !== otp) {
      dispatch(showSnackbar({
        message: 'Invalid OTP. Please try again.',
        type: 'error',
        duration: 3000,
      }));
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      dispatch(showSnackbar({
        message: 'Passwords do not match.',
        type: 'warning',
        duration: 3000,
      }));
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      dispatch(showSnackbar({
        message: 'Password must be at least 6 characters long.',
        type: 'warning',
        duration: 3000,
      }));
      return;
    }
    try{
      const result = await dispatch(resetPassword({ email, otp: enteredOtp, newPassword })).unwrap();
      if(result?.success) {
        dispatch(showSnackbar({
          message: 'Password reset successfully!',
          type: 'success',
          duration: 3000,
        }));
        navigation.navigate('Login');
      }
    } catch (error) {
      console.log('Reset Password Error:', error);
    }
    // Dispatch reset password action
   
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -150}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <MaterialIcons name="lock-reset" size={36} color={Colors.textLight} />
              </View>
            </View>
            <Text style={styles.logoText}>Reset Password</Text>
            <Text style={styles.subTitle}>Create a new secure password</Text>
            <Text style={styles.welcomeText}>
              Enter the OTP sent to your email and set a new password
            </Text>
          </View>

          {/* Testing Display - Remove in production */}
          <View style={styles.testingBox}>
            {/* <View style={styles.testingHeader}>
              <MaterialIcons name="info" size={18} color={Colors.primary} />
              <Text style={styles.testingLabel}>Testing Mode</Text>
            </View> */}
            <Text style={styles.testingText}>Your OTP: <Text style={styles.otpHighlight}>{otp}</Text></Text>
            <Text style={styles.testingSubtext}>Use this OTP to reset your password</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* OTP Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Enter OTP</Text>
              <View
                style={[
                  styles.inputContainer,
                  otpFocused && styles.inputContainerFocused,
                ]}
              >
                <MaterialIcons
                  name="dialpad"
                  size={20}
                  color={otpFocused ? Colors.primary : Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor={Colors.textMuted}
                  value={enteredOtp}
                  onChangeText={setEnteredOtp}
                  keyboardType="numeric"
                  maxLength={6}
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>New Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                ]}
              >
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={passwordFocused ? Colors.primary : Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  confirmPasswordFocused && styles.inputContainerFocused,
                ]}
              >
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color={confirmPasswordFocused ? Colors.primary : Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={newPassword.length >= 6 ? 'check-circle' : 'radio-button-unchecked'} 
                  size={16} 
                  color={newPassword.length >= 6 ? Colors.success : Colors.textMuted} 
                />
                <Text style={styles.requirementText}>At least 6 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={newPassword === confirmPassword && newPassword.length > 0 ? 'check-circle' : 'radio-button-unchecked'} 
                  size={16} 
                  color={newPassword === confirmPassword && newPassword.length > 0 ? Colors.success : Colors.textMuted} 
                />
                <Text style={styles.requirementText}>Passwords match</Text>
              </View>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[styles.resetButton, authLoading && styles.resetButtonDisabled]}
              disabled={authLoading}
              onPress={handleResetPassword}
              activeOpacity={0.8}
            >
              {authLoading ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <>
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={Colors.textLight}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}> Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Your password will be encrypted and stored securely</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cardBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
  },

  testingBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  testingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  testingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  testingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  otpHighlight: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 2,
  },
  testingSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },

  requirementsBox: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  resetButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  resetButtonText: {
    color: Colors.textLight,
    fontSize: 17,
    fontWeight: '800',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  loginLinkText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '800',
  },

  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
