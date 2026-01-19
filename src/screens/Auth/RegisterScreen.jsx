import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slices/authSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role] = useState('user');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState('');

  const { authLoading, error } = useSelector(state => state.auth);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
    }
  }, [error]);

  useEffect(() => {
    if (password.length === 0) setPasswordStrength('');
    else if (password.length < 6) setPasswordStrength('weak');
    else if (password.length < 8) setPasswordStrength('medium');
    else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    )
      setPasswordStrength('strong');
    else setPasswordStrength('medium');
  }, [password]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'strong':
        return Colors.success;
      default:
        return Colors.border;
    }
  };

  const handleRegistration = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone
    ) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Enter a valid email address.');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      role,
    };

    dispatch(registerUser(userData));
  };

 const renderInput = (
  label,
  value,
  setValue,
  icon,
  placeholder,
  fieldKey,
  options = {}
) => {
  const {
    secureTextEntry,
    showPassword,
    onTogglePassword,
    ...inputOptions
  } = options;

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name={icon}
          size={20}
          color={Colors.textMuted}
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={setValue}
          secureTextEntry={secureTextEntry ? !showPassword : false}
          {...inputOptions}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={onTogglePassword} style={styles.eyeIcon}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <MaterialIcons
                  name="person-add"
                  size={36}
                  color={Colors.textLight}
                />
              </View>
            </View>

            <Text style={styles.logoText}>Create Account</Text>
            <Text style={styles.subTitle}>Join 4U VISA today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Row */}
            <View style={styles.nameRow}>
              <View style={styles.nameInputContainer}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { paddingLeft: 16 }]}
                    placeholder="John"
                    placeholderTextColor={Colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>

              <View style={styles.nameInputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { paddingLeft: 16 }]}
                    placeholder="Doe"
                    placeholderTextColor={Colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            {renderInput(
              'Email',
              email,
              setEmail,
              'email',
              'you@example.com',
              'email',
              { keyboardType: 'email-address', autoCapitalize: 'none' }
            )}

            {/* Phone */}
            {renderInput(
              'Phone',
              phone,
              text => setPhone(text.replace(/[^0-9]/g, '')),
              'phone',
              '9876543210',
              'phone',
              { keyboardType: 'number-pad', maxLength: 10 }
            )}

            {/* Password */}
            {renderInput(
              'Password',
              password,
              setPassword,
              'lock',
              'Must be 8+ characters',
              'password',
              {
                secureTextEntry: true,
                showPassword,
                onTogglePassword: () =>
                  setShowPassword(!showPassword),
              }
            )}

            {/* Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          passwordStrength !== ''
                            ? getPasswordStrengthColor()
                            : Colors.border,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          passwordStrength === 'medium' ||
                          passwordStrength === 'strong'
                            ? getPasswordStrengthColor()
                            : Colors.border,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          passwordStrength === 'strong'
                            ? getPasswordStrengthColor()
                            : Colors.border,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={{
                    color: getPasswordStrengthColor(),
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {passwordStrength === 'weak' && 'Weak password'}
                  {passwordStrength === 'medium' && 'Medium strength'}
                  {passwordStrength === 'strong' && 'Strong password'}
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            {renderInput(
              'Confirm Password',
              confirmPassword,
              setConfirmPassword,
              'lock',
              'Re-enter password',
              'confirmPassword',
              {
                secureTextEntry: true,
                showPassword: showConfirmPassword,
                onTogglePassword: () =>
                  setShowConfirmPassword(!showConfirmPassword),
              }
            )}

            {/* Match Indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                <MaterialIcons
                  name={
                    password === confirmPassword
                      ? 'check-circle'
                      : 'cancel'
                  }
                  size={16}
                  color={
                    password === confirmPassword
                      ? Colors.success
                      : Colors.error
                  }
                />

                <Text
                  style={{
                    color:
                      password === confirmPassword
                        ? Colors.success
                        : Colors.error,
                    fontWeight: '600',
                  }}
                >
                  {password === confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </Text>
              </View>
            )}

            {/* Terms */}
            {/* <View style={styles.termsContainer}>
              <MaterialIcons
                name="info"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View> */}

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                authLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegistration}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>
                    Create Account
                  </Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={Colors.textLight}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already registered?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}> Sign In</Text>
            </TouchableOpacity>
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
  container: { flex: 1 },
  scrollContent: { padding: 24 },

  header: { alignItems: 'center', marginTop: 10, marginBottom: 32 },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: { marginBottom: 16 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  form: { width: '100%' },
  nameRow: { flexDirection: 'row', gap: 12 },
  nameInputContainer: { flex: 1 },

  inputWrapper: { marginBottom: 20 },
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
    borderColor: Colors.border,
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: Colors.textPrimary },

  eyeIcon: { padding: 4 },

  strengthContainer: { marginTop: -12, marginBottom: 16 },
  strengthBars: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },

  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    backgroundColor: `${Colors.accent}10`,
    gap: 8,
  },
  termsText: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  termsLink: { color: Colors.primary, fontWeight: '700' },

  registerButton: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerButtonDisabled: { backgroundColor: Colors.textMuted },
  registerButtonText: {
    color: Colors.textLight,
    fontSize: 17,
    fontWeight: '800',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: { fontSize: 15, color: Colors.textSecondary },
  loginLinkText: { fontSize: 15, color: Colors.primary, fontWeight: '800' },
});
