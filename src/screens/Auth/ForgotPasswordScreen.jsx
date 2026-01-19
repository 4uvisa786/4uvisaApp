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
import { useSelector, useDispatch } from 'react-redux';
import { forgotPassword } from '../../redux/slices/authSlice';
import { showSnackbar } from '../../redux/slices/snackbarSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color';

export default function ForgotPasswordScreen({ navigation }) {
  const dispatch = useDispatch();
  const { authLoading } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);

  // Email validation function
  const validateEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!input || input.length === 0) {
      return 'Email is required';
    }

    if (!emailRegex.test(input)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  const handleForgotPassword = async () => {
    const error = validateEmail(email);
    if (error) {
      dispatch(showSnackbar({
        message: error,
        type: 'warning',
        duration: 3000,
      }));
      return;
    }

    try {
      const result = await dispatch(forgotPassword(email)).unwrap();

      // Navigate ONLY on success
      if (result?.success) {
        dispatch(showSnackbar({
          message: 'OTP sent successfully! Check your email.',
          type: 'success',
          duration: 3000,
        }));
        navigation.navigate('ResetPassword', {
          email: result.email,
          otp: result.otp,
        });
      }
    } catch (err) {
      // Error already handled by Redux
      console.log('Forgot Password Error:', err);
    }
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
                <MaterialIcons name="lock-clock" size={36} color={Colors.textLight} />
              </View>
            </View>
            <Text style={styles.logoText}>Forgot Password?</Text>
            <Text style={styles.subTitle}>Don't worry, it happens!</Text>
            <Text style={styles.welcomeText}>
              Enter your email address and we'll send you an OTP to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                ]}
              >
                <MaterialIcons
                  name="email"
                  size={20}
                  color={emailFocused ? Colors.primary : Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleForgotPassword}
                  editable={!authLoading}
                />
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoText}>
                We'll send you a one-time password (OTP) to verify your identity
              </Text>
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.sendButton, authLoading && styles.sendButtonDisabled]}
              disabled={authLoading}
              onPress={handleForgotPassword}
              activeOpacity={0.8}
            >
              {authLoading ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <>
                  <Text style={styles.sendButtonText}>Send OTP</Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={Colors.textLight}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            {/* Back to Login Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={authLoading}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="arrow-back"
                size={20}
                color={Colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Having trouble?</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Contact Support</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> or </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLinkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 40,
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
    lineHeight: 20,
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

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },

  sendButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  sendButtonText: {
    color: Colors.textLight,
    fontSize: 17,
    fontWeight: '800',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginHorizontal: 16,
    fontWeight: '600',
  },

  backButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
  },

  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
});
