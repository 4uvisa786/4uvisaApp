import React, { useEffect, useState } from 'react';
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
    Modal,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { logout, changePassword, updateUserProfile } from '../../redux/slices/authSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Colors from '../../themes/color';
import { showSnackbar } from '../../redux/slices/snackbarSlice';

export default function ProfileScreen({ navigation }) {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    // ------------------------------
    // USER DATA STATES
    // ------------------------------
    const [userData, setUserData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    const [initialUserData, setInitialUserData] = useState({ ...userData });
    const [isEditing, setIsEditing] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
    const [loading, setLoading] = useState(false);

    // ------------------------------
    // PASSWORD MODAL STATES - FIXED
    // ------------------------------
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ------------------------------
    // INPUT CHANGE
    // ------------------------------
    const handleChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    // ------------------------------
    // EDIT MODE TOGGLE
    // ------------------------------
    const toggleEditMode = () => {
        if (isEditing) setUserData({ ...initialUserData });
        setIsEditing(prev => !prev);
    };

    // ------------------------------
    // SAVE PROFILE
    // ------------------------------
    const handleSave = async () => {
        if (!userData.firstName || !userData.lastName) {
            dispatch(showSnackbar({ message: 'Name is required', type: 'error' }));
            return;
        }

        setLoading(true);

        try {
            await dispatch(
                updateUserProfile({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                })
            ).unwrap();

            setInitialUserData({ ...userData });
            setIsEditing(false);
            dispatch(showSnackbar({ message: 'Profile updated successfully!', type: 'success' }));
        } catch (err) {
            console.log('Update failed:', err);
            dispatch(showSnackbar({ message: err.message || 'Failed to update profile', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------
    // CHANGE PASSWORD
    // ------------------------------
    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            dispatch(showSnackbar({ message: 'Please fill in all fields', type: 'error' }));
            return;
        }

        if (newPassword.length < 6) {
            dispatch(
                showSnackbar({ message: 'New password must be at least 6 characters', type: 'error' })
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const msg = await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
            dispatch(showSnackbar({ message: msg || 'Password updated successfully!', type: 'success' }));
            handleClosePasswordModal();
        } catch (err) {
            dispatch(showSnackbar({ message: err.message || 'Failed to update password', type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalVisible(false);
        setOldPassword('');
        setNewPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
    };

    // ------------------------------
    // LOGOUT HANDLER
    // ------------------------------
    const handleLogout = () => {
        Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    dispatch(showSnackbar({ message: 'Logged out successfully', type: 'success' }));
                    dispatch(logout());
                },
            },
        ]);
    };

    // ------------------------------
    // FIELD RENDERER
    // ------------------------------
    const renderField = (label, fieldKey, icon, keyboardType = 'default') => (
        <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
                <MaterialIcons name={icon} size={18} color={Colors.primary} />
                <Text style={styles.label}>{label}</Text>
            </View>

            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={userData[fieldKey]}
                    onChangeText={text => handleChange(fieldKey, text)}
                    keyboardType={keyboardType}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor={Colors.textMuted}
                    editable={fieldKey !== 'email'}
                />
            ) : (
                <Text style={styles.valueText}>{userData[fieldKey] || 'Not provided'}</Text>
            )}
        </View>
    );

    const getInitials = () => {
        const f = userData.firstName?.[0] || '';
        const l = userData.lastName?.[0] || '';
        return (f + l).toUpperCase();
    };

    const openLink = async (url) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            dispatch(showSnackbar({
                message: 'Unable to open link',
                type: 'error'
            }));
        }
    };


    // ------------------------------
    // UI RETURN
    // ------------------------------
    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>{isEditing ? 'Edit Profile' : 'Profile'}</Text>

                    <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
                        <MaterialIcons name={isEditing ? 'close' : 'edit'} size={22} color={Colors.textLight} />
                        <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* AVATAR SECTION */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.profileAvatar}>
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        </View>

                        {isEditing && (
                            <TouchableOpacity style={styles.cameraButton}>
                                <MaterialIcons name="camera-alt" size={16} color={Colors.textLight} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.userName}>
                        {userData.firstName} {userData.lastName}
                    </Text>

                    <View style={styles.userEmailContainer}>
                        <MaterialIcons name="email" size={14} color={Colors.textSecondary} />
                        <Text style={styles.userEmail}>{userData.email}</Text>
                    </View>
                </View>

                {/* PERSONAL INFO */}
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

                {/* SETTINGS */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="settings" size={20} color={Colors.primary} />
                        <Text style={styles.cardTitle}>Settings & Preferences</Text>
                    </View>

                    <View style={styles.cardContent}>
                        {/* CHANGE PASSWORD */}
                        <TouchableOpacity
                            style={styles.actionRow}
                            onPress={() => setIsPasswordModalVisible(true)}
                        >
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="lock" size={20} color={Colors.textSecondary} />
                                <Text style={styles.actionLabel}>Change Password</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionRow}
                            onPress={() => openLink('https://fouruvisa.onrender.com/delete-account')}
                        >
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="delete-outline" size={20} color={Colors.red} />
                                <Text style={[styles.actionLabel, { color: Colors.red }]}>Delete Account</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
                        </TouchableOpacity>

                        {/* LANGUAGE */}
                        {/* <TouchableOpacity style={styles.actionRow}>
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="language" size={20} color={Colors.textSecondary} />
                                <Text style={styles.actionLabel}>Language</Text>
                            </View>

                            <View style={styles.actionRight}>
                                <Text style={styles.actionValue}>English</Text>
                                <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
                            </View>
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* SUPPORT */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="help" size={20} color={Colors.primary} />
                        <Text style={styles.cardTitle}>Support & Information</Text>
                    </View>


                    <View style={styles.cardContent}>

                        <TouchableOpacity 
            onPress={() => openLink('https://4uvisas.com')} 
            style={styles.actionRow}
        >
            <View style={styles.actionLeft}>
                <MaterialIcons name="language" size={20} color={Colors.secondary} />
                <Text style={styles.actionLabel}>Official Website</Text>
            </View>
            <View style={styles.actionRight}>
                <Text style={[styles.actionValue, { color: Colors.secondary }]}>Visit Site</Text>
                <MaterialIcons name="open-in-new" size={18} color={Colors.secondary} />
            </View>
        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("TermsConditions")}
                            style={styles.actionRow}
                        >
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="description" size={20} color={Colors.textSecondary} />
                                <Text style={styles.actionLabel}>Terms & Conditions</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
                        </TouchableOpacity>


                        <TouchableOpacity
                            onPress={() => openLink('https://fouruvisa.onrender.com/terms-and-conditions')}
                            style={styles.actionRow}
                        >
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="policy" size={20} color={Colors.textSecondary} />
                                <Text style={styles.actionLabel}>Privacy Policy</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Help")} style={styles.actionRow}>
                            <View style={styles.actionLeft}>
                                <MaterialIcons name="info" size={20} color={Colors.textSecondary} />
                                <Text style={styles.actionLabel}>About</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                </View>

                {/* FOLLOW US */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="share" size={20} color={Colors.primary} />
                        <Text style={styles.cardTitle}>Follow Us</Text>
                    </View>

                    <View style={styles.followContainer}>
                        {/* Facebook */}
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openLink('https://www.facebook.com/4uvisa')}
                        >
                            <FontAwesome name="facebook" size={22} color="#1877F2" />
                            <Text style={styles.socialText}>Facebook</Text>
                        </TouchableOpacity>

                        {/* X / Twitter */}
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openLink('https://x.com/4uVisa')}
                        >
                            <FontAwesome5 name="twitter" size={22} color="#000000" />
                            <Text style={styles.socialText}>X</Text>
                        </TouchableOpacity>

                        {/* Threads */}
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openLink('https://www.threads.net/@4u_visa')}
                        >
                            <FontAwesome5 name="instagram" size={22} color="#000000" />
                            <Text style={styles.socialText}>Threads</Text>
                        </TouchableOpacity>

                        {/* WhatsApp */}
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openLink('https://wa.me/923395555804')}
                        >
                            <FontAwesome name="whatsapp" size={22} color="#25D366" />
                            <Text style={styles.socialText}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* SAVE BUTTON */}
                {isEditing && (
                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
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

                {/* LOGOUT */}
                {!isEditing && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <MaterialIcons name="logout" size={20} color={Colors.error} />
                        <Text style={styles.logoutButtonText}>Log Out</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>

            {/* ---------------------------- */}
            {/* PASSWORD MODAL */}
            {/* ---------------------------- */}
            <Modal visible={isPasswordModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* HEADER */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <MaterialIcons name="lock" size={24} color={Colors.primary} />
                            </View>

                            <TouchableOpacity
                                disabled={isSubmitting}
                                onPress={handleClosePasswordModal}
                            >
                                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalTitle}>Change Password</Text>
                        <Text style={styles.modalSubtitle}>Enter your current & new password</Text>

                        {/* OLD PASSWORD */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.modalInput, { paddingHorizontal: 16 }]} // Use modalInput for padding fix
                                    placeholder="Enter current password"
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    secureTextEntry={!showOldPassword}
                                    editable={!isSubmitting}
                                    placeholderTextColor={Colors.textMuted}
                                />

                                <TouchableOpacity
                                    onPress={() => setShowOldPassword(!showOldPassword)}
                                    disabled={isSubmitting}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons
                                        name={showOldPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* NEW PASSWORD */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.modalInput, { paddingHorizontal: 16 }]} // Use modalInput for padding fix
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                    editable={!isSubmitting}
                                    placeholderTextColor={Colors.textMuted}
                                />

                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    disabled={isSubmitting}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons
                                        name={showNewPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ACTIONS */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleClosePasswordModal}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
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
        </View>
    );
}

const styles = StyleSheet.create({
    // UPDATED: Safe Area background to primary color
    safeArea: {
        backgroundColor: Colors.primary,
    },

    // UPDATED: Header background to primary color, text/icons to white
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.primary, // THEME COLOR
        borderBottomWidth: 0, // No border needed on colored background
    },
    screenTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.textLight, // White text
        letterSpacing: -0.5,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light tint for contrast
        borderRadius: 10,
        gap: 6,
    },
    editButtonText: {
        color: Colors.textLight, // White text
        fontSize: 15,
        fontWeight: '700',
    },

    scrollContent: {
        paddingBottom: 30,
        // The rest of the content scrolls over the background
        backgroundColor: Colors.background,
    },

    // Avatar Section (Remains white to give context to the scrolling area)
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
        borderColor: Colors.primary + '20',
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
        backgroundColor: Colors.accent + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    emailIcon: {
        marginRight: 6,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },

    // Card Styles
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
        backgroundColor: Colors.primary + '05', // Very light primary tint
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

    // Field Styles
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
    input: {
        height: 48,
        borderColor: Colors.border,
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        color: Colors.textPrimary,
        backgroundColor: Colors.background,
        fontWeight: '500',
    },

    // Action Row Styles
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

    // Button Styles
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
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.error + '10',
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
    // Modal Styles (Kept consistent with theme)
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
        backgroundColor: Colors.primary + '10',
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
    modalInput: {
        flex: 1,
        paddingVertical: 14,
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
    followContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 16,
        gap: 12,
    },

    socialButton: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: Colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    socialText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },

});