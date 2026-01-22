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

// Import your custom modal component
import CountryCodePickerModal from '../../components/CountryCodePickerModal'; 

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();

  // --- Form State ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role] = useState('user');

  // --- UI/Security State ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  // --- Country Picker State ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: "+92",
    flag: "🇵🇰" // Defaulting to Pakistan
  });

  const { authLoading, error } = useSelector(state => state.auth);

  // Error Handling
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
    }
  }, [error]);

  // Password Strength Logic
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
      case 'weak': return Colors.error;
      case 'medium': return Colors.warning;
      case 'strong': return Colors.success;
      default: return Colors.border;
    }
  };

  const handleRegistration = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Enter a valid email address.');
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
      // Combining the selected country code with the phone number
      phone: `${selectedCountry.code}${phone.trim()}`,
      role,
    };
    console.log('Registering User:', userData);
    dispatch(registerUser(userData));
  };

  // Helper for Standard Inputs
  const renderInput = (label, value, setValue, icon, placeholder, options = {}) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name={icon} size={20} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={setValue}
          {...options}
        />
        {options.isPassword && (
          <TouchableOpacity onPress={options.onToggle} style={styles.eyeIcon}>
            <MaterialIcons
              name={options.visible ? 'visibility' : 'visibility-off'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <MaterialIcons name="person-add" size={36} color={Colors.textLight} />
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
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            {renderInput('Email', email, setEmail, 'email', 'you@example.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}

            {/* Phone Number with Country Selector */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity 
                  style={styles.countryPickerButton} 
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                  <Text style={styles.selectedCodeText}>{selectedCountry.code}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="9876543210"
                    placeholderTextColor={Colors.textMuted}
                    value={phone}
                    onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            </View>

            {/* Password */}
            {renderInput('Password', password, setPassword, 'lock', 'Must be 8+ characters', {
              secureTextEntry: !showPassword,
              isPassword: true,
              visible: showPassword,
              onToggle: () => setShowPassword(!showPassword)
            })}

            {/* Strength Bar */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  <View style={[styles.strengthBar, { backgroundColor: passwordStrength !== '' ? getPasswordStrengthColor() : Colors.border }]} />
                  <View style={[styles.strengthBar, { backgroundColor: (passwordStrength === 'medium' || passwordStrength === 'strong') ? getPasswordStrengthColor() : Colors.border }]} />
                  <View style={[styles.strengthBar, { backgroundColor: passwordStrength === 'strong' ? getPasswordStrengthColor() : Colors.border }]} />
                </View>
                <Text style={{ color: getPasswordStrengthColor(), fontSize: 12, fontWeight: '600' }}>
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} strength
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            {renderInput('Confirm Password', confirmPassword, setConfirmPassword, 'lock', 'Re-enter password', {
              secureTextEntry: !showConfirmPassword,
              isPassword: true,
              visible: showConfirmPassword,
              onToggle: () => setShowConfirmPassword(!showConfirmPassword)
            })}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, authLoading && styles.registerButtonDisabled]}
              onPress={handleRegistration}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Create Account</Text>
                  <MaterialIcons name="arrow-forward" size={20} color={Colors.textLight} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Modal */}
      <CountryCodePickerModal
        visible={modalVisible}
        onSelect={(country) => {
          setSelectedCountry(country);
          setModalVisible(false);
        }}
        onCancel={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.cardBg },
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
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  subTitle: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  form: { width: '100%' },
  nameRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  nameInputContainer: { flex: 1 },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, color: Colors.textPrimary, marginBottom: 8, fontWeight: '700' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    height: 54, borderColor: Colors.border,
    borderWidth: 1.5, borderRadius: 14,
    backgroundColor: Colors.background, paddingHorizontal: 16,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  countryPickerButton: {
    flexDirection: 'row', alignItems: 'center',
    height: 54, paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.border,
  },
  flagText: { fontSize: 22, marginRight: 4 },
  selectedCodeText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  input: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  inputIcon: { marginRight: 12 },
  eyeIcon: { padding: 4 },
  strengthContainer: { marginTop: -12, marginBottom: 16 },
  strengthBars: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  registerButton: {
    flexDirection: 'row', backgroundColor: Colors.success,
    height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10
  },
  registerButtonDisabled: { backgroundColor: Colors.textMuted },
  registerButtonText: { color: Colors.textLight, fontSize: 17, fontWeight: '800' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 15, color: Colors.textSecondary },
  loginLinkText: { fontSize: 15, color: Colors.primary, fontWeight: '800' },
});