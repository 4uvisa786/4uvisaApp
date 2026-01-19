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
import { loginUser } from '../../redux/slices/authSlice';
import { showSnackbar } from '../../redux/slices/snackbarSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { authLoading } = useSelector(state => state.auth);

  const handleLogin = () => {
    if (!email || !password) {
      dispatch(showSnackbar({
        message: 'Please enter email/mobile and password.',
        type: 'warning',
        duration: 3000,
      }));
      return;
    }

    const trimmed = email.trim();

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(trimmed) && !mobileRegex.test(trimmed)) {
      dispatch(showSnackbar({
        message: 'Enter a valid email or 10-digit mobile number.',
        type: 'warning',
        duration: 3000,
      }));
      return;
    }

    dispatch(loginUser({ username: trimmed, password }));
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
                <MaterialIcons name="flight" size={36} color={Colors.textLight} />
              </View>
            </View>
            <Text style={styles.logoText}>4U VISA</Text>
            <Text style={styles.subTitle}>Your trusted visa companion</Text>
            <Text style={styles.welcomeText}>
              Welcome back! Please login to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email or Mobile Number</Text>
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
                  placeholder="Enter email or mobile"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
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
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

            {/* Forgot */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('ForgotPassword');
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, authLoading && styles.loginButtonDisabled]}
              disabled={authLoading}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              {authLoading ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
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
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Social */}
            {/* <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => {
                  dispatch(showSnackbar({
                    message: 'Google sign-in coming soon!',
                    type: 'info',
                    duration: 3000,
                  }));
                }}
              >
                <MaterialIcons name="g-translate" size={22} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => {
                  dispatch(showSnackbar({
                    message: 'Apple sign-in coming soon!',
                    type: 'info',
                    duration: 3000,
                  }));
                }}
              >
                <MaterialIcons name="apple" size={22} color="#000" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View> */}
          </View>

          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLinkText}> Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          {/* <View style={styles.footer}>
            <Text style={styles.footerText}>By continuing, you agree to our</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> and </Text>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View> */}
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

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  loginButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  loginButtonText: {
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

  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialButtonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  registerLinkText: {
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
