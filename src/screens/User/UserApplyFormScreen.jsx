import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from '../../components/DatePicker';
import FilePicker from '../../components/FilePicker';
import { useDispatch, useSelector } from 'react-redux';
import { createRequest } from '../../redux/slices/userSlice';
import { showSnackbar } from '../../redux/slices/snackbarSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color';
import CountryCodePickerModal from '../../components/CountryCodePickerModal'; 
import { uploadMultipleToCloudinary } from '../../api/claudinary';
import DocumentAlertModal from '../User/DocumentAlertModal';

// Separate Confirmation Modal Component (Unchanged)
const ConfirmationModal = ({ visible, onConfirm, onCancel, serviceName, subServiceName }) => {
    const isSubServicePresent = !!subServiceName;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={confirmStyles.overlay}>
                <View style={confirmStyles.container}>
                    {/* Icon */}
                    <View style={confirmStyles.iconContainer}>
                        <MaterialIcons name="check-circle" size={56} color={Colors.success} />
                    </View>

                    {/* Title */}
                    <Text style={confirmStyles.title}>Confirm Submission</Text>

                    {/* Message */}
                    <Text style={confirmStyles.message}>
                        Are you sure you want to submit your application for{' '}
                        <Text style={confirmStyles.highlight}>{serviceName}</Text>
                        {isSubServicePresent && (
                            <>
                                {' '}under{' '}
                                <Text style={confirmStyles.highlight}>{subServiceName}</Text>
                                {' '}sub-service?
                            </>
                        )}
                        {!isSubServicePresent && '?'}
                    </Text>

                    <Text style={confirmStyles.subMessage}>
                        Make sure all information is correct before submitting.
                    </Text>

                    {/* Buttons */}
                    <View style={confirmStyles.buttons}>
                        <TouchableOpacity
                            style={confirmStyles.cancelButton}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={confirmStyles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={confirmStyles.confirmButton}
                            onPress={onConfirm}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="send" size={20} color={Colors.textLight} />
                            <Text style={confirmStyles.confirmText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


export default function UserApplyFormScreen({ route, navigation }) {
    const { service, subService } = route.params;
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.user);

    const [serviceId] = useState(service._id);
    const [subServiceId] = useState(subService?._id);
    const [formData, setFormData] = useState({});
    const [documents, setDocuments] = useState([]);
    const [focusedField, setFocusedField] = useState('');
    const [errors, setErrors] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // NEW STATE: Local loading state for document upload phase
    const [isUploading, setIsUploading] = useState(false);
    
    // State for the country code picker modal
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [currentPhoneField, setCurrentPhoneField] = useState(null); 

    const [showDropdownModal, setShowDropdownModal] = useState(false);
const [currentDropdownField, setCurrentDropdownField] = useState(null);
    
    // NEW STATE: State to track the flag emoji for display
    const [selectedCountryFlag, setSelectedCountryFlag] = useState({}); // { [fieldName]: flag }

    const [showDocAlert, setShowDocAlert] = useState(false);
const [address, setAddress] = useState("");


    const subServiceName = subService ? subService.name : null;
    const formFields = subService && subService.formFields.length > 0 ? subService.formFields : service.formFields;

    const handleInputChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value,
        }));
        if (errors[key]) {
            setErrors(prev => ({
                ...prev,
                [key]: null,
            }));
        }
    };

    const handlePhoneNumberChange = (field, value) => {
        setFormData(prev => {
            const countryCode = prev[field]?.countryCode || '';
            return {
                ...prev,
                [field]: {
                    ...prev[field],
                    number: value,
                    fullNumber: countryCode + value
                }
            };
        });

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null,
            }));
        }
    };

    // MODIFIED: handleCountryCodeSelect now accepts an object { code, flag }
    const handleCountryCodeSelect = ({ code, flag }) => {
        if (!currentPhoneField) return;

        setFormData(prev => {
            const number = prev[currentPhoneField]?.number || '';
            return {
                ...prev,
                [currentPhoneField]: {
                    ...prev[currentPhoneField],
                    countryCode: code,
                    fullNumber: code + number
                }
            };
        });
        
        // NEW: Store the flag emoji
        setSelectedCountryFlag(prev => ({
            ...prev,
            [currentPhoneField]: flag
        }));

        if (errors[currentPhoneField]) {
            setErrors(prev => ({
                ...prev,
                [currentPhoneField]: null,
            }));
        }

        setShowCountryPicker(false);
        setCurrentPhoneField(null);
    };

    const openCountryPicker = (fieldName) => {
        setCurrentPhoneField(fieldName);
        setShowCountryPicker(true);
    };


    const handleFileSelect = (fieldName, files) => {
        setDocuments(prev => [...prev, ...files]);

        // 2. Update formData so validation and progress bar "see" the data
    setFormData(prev => ({
        ...prev,
        [fieldName]: files, // Storing the file array here
    }));

        dispatch(showSnackbar({
            message: `${files.length} file(s) added successfully`,
            type: 'success',
            duration: 2000,
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        formFields.forEach(field => {
            if (field.type === 'phone' && field.required) {
                const phoneData = formData[field.name];
                if (!phoneData || !phoneData.countryCode || !phoneData.number) {
                    newErrors[field.name] = `${field.label} (including country code) is required`;
                }
            }
            else if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            dispatch(showSnackbar({
                message: 'Please fill in all required fields.',
                type: 'warning',
                duration: 3000,
            }));
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);

        setIsUploading(true);

        try {
            dispatch(showSnackbar({
                message: "Uploading documents...",
                type: "info",
                duration: 2000,
            }));

            const uploadedDocs =
  documents.length > 0
    ? await uploadMultipleToCloudinary(documents)
    : [];

const mappedDocs = uploadedDocs.map((doc, idx) => ({
  filename: doc.filename,
  mimeType: doc.mimeType,
  url: doc.url,
  fileId: doc.fileId,
}));


            const finalFormData = Object.keys(formData).reduce((acc, key) => {
                const field = formFields.find(f => f.name === key);
                if (field && field.type === 'phone') {
                    // Extract only the full number for the final payload
                    acc[key] = formData[key].fullNumber;
                } else {
                    acc[key] = formData[key];
                }
                return acc;
            }, {});

            const payload = {
                serviceId,
                subServiceId,
                formData: finalFormData,
                documents: mappedDocs,
            };

            const result = await dispatch(createRequest(payload)).unwrap();

            setErrors({});

             if (result.action === "SEND_DOCUMENTS_EXTERNALLY") {
            setAddress(result.address);
            setShowDocAlert(true);
        } else {
            // Standard success flow
            navigation.goBack();
        }

        setFormData({});
            setDocuments([]);

        } catch (error) {
            console.log("Submit error:", error);

            let errorMessage = "An error occurred during submission. Please check your connection.";
            
            // Extract the most relevant error message as a string
            if (error.response && error.response.data && error.response.data.message) {
                // Use message from server response body if available
                errorMessage = error.response.data.message;
            } else if (error.message) {
                // Use the standard Axios message (e.g., "Request failed with status code 404")
                errorMessage = error.message;
            }

            dispatch(showSnackbar({
                // Pass the extracted string here
                message: errorMessage,
                type: "error",
                duration: 3000,
            }));
        }
        finally {
            setIsUploading(false);
        }
    };

    const handleCancelSubmit = () => {
        setShowConfirmModal(false);
    };

    const getFieldIcon = type => {
        const icons = {
            text: 'text-fields',
            number: 'numbers',
            date: 'calendar-today',
            select: 'checklist',
            file: 'attach-file',
            phone: 'call',
            dropdown: 'arrow-drop-down-circle',
        };
        return icons[type] || 'info';
    };

    const requiredFieldsCount = formFields.filter(f => f.required).length;
    const filledFieldsCount = formFields.filter(
        f => {
            if (f.required) {
                if (f.type === 'phone') {
                    const phoneData = formData[f.name];
                    return phoneData && phoneData.countryCode && phoneData.number;
                }
                return !!formData[f.name];
            }
            return false;
        }
    ).length;
    const progress = requiredFieldsCount > 0 ? (filledFieldsCount / requiredFieldsCount) * 100 : 0;

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
                    <Text style={styles.headerTitle}>Application Form</Text>
                    <Text style={styles.headerSubtitle}>
                        {service.name}
                        {subServiceName && <Text style={styles.subServiceHeader}> | {subServiceName}</Text>}
                    </Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                        <MaterialIcons name="info" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Important Information</Text>
                        <Text style={styles.infoText}>
                            Please fill out all required fields marked with (*). Ensure all information is accurate.
                        </Text>
                        {subServiceName && (
                            <View style={styles.subServiceBadge}>
                                <MaterialIcons name="public" size={14} color={Colors.accent} />
                                <Text style={styles.subServiceBadgeText}>Sub-Service: {subServiceName}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <MaterialIcons name="checklist" size={20} color={Colors.primary} />
                        <Text style={styles.progressTitle}>Form Progress</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${progress}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {filledFieldsCount} of {requiredFieldsCount} required fields completed
                    </Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {formFields.map((field, index) => (
                        <View key={index} style={styles.fieldGroup}>
                            <View style={styles.fieldHeader}>
                                <View style={styles.fieldLabelContainer}>
                                    <MaterialIcons
                                        name={getFieldIcon(field.type)}
                                        size={18}
                                        color={Colors.primary}
                                    />
                                    <Text style={styles.label}>
                                        {field.label}
                                        {field.required && <Text style={styles.required}> *</Text>}
                                    </Text>
                                </View>
                                {(field.type === 'phone' && formData[field.name]?.countryCode && formData[field.name]?.number) ||
                                    (field.type !== 'phone' && formData[field.name]) ? (
                                        <MaterialIcons name="check-circle" size={18} color={Colors.success} />
                                    ) : null}
                            </View>

                            {/* Text/Number/Email Input */}
                            {['text', 'number', 'email'].includes(field.type) && (
                                <View
                                    style={[
                                        styles.inputContainer,
                                        focusedField === field.name && styles.inputContainerFocused,
                                        errors[field.name] && styles.inputContainerError,
                                    ]}
                                >
                                    <TextInput
                                        style={styles.textInput}
                                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                        placeholderTextColor={Colors.textMuted}
                                        value={formData[field.name] || ''}
                                        onChangeText={text => handleInputChange(field.name, text)}
                                        onFocus={() => setFocusedField(field.name)}
                                        onBlur={() => setFocusedField('')}
                                    />
                                </View>
                            )}

                            {/* Phone Input with Dropdown Trigger */}
                            {field.type === 'phone' && (
                                <View style={styles.phoneInputContainer}>
                                    {/* Country Code Dropdown/Button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.countryCodeInputContainer,
                                            errors[field.name] && styles.inputContainerError,
                                            !!formData[field.name]?.countryCode && styles.inputContainerFocused
                                        ]}
                                        onPress={() => openCountryPicker(field.name)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.countryCodeText}>
                                            {/* MODIFIED: Display flag and code */}
                                            {selectedCountryFlag[field.name] || '🌍'} 
                                            {' '}
                                            {formData[field.name]?.countryCode || ''}
                                        </Text>
                                        <MaterialIcons
                                            name="arrow-drop-down"
                                            size={20}
                                            color={Colors.textSecondary}
                                        />
                                    </TouchableOpacity>

                                    {/* Phone Number Input */}
                                    <View
                                        style={[
                                            styles.phoneNumberInputContainer,
                                            focusedField === `${field.name}-number` && styles.inputContainerFocused,
                                            errors[field.name] && styles.inputContainerError,
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.textInput}
                                            keyboardType="phone-pad"
                                            placeholder={`Enter ${field.label.toLowerCase()} number`}
                                            placeholderTextColor={Colors.textMuted}
                                            value={formData[field.name]?.number || ''}
                                            onChangeText={text => handlePhoneNumberChange(field.name, text)}
                                            onFocus={() => setFocusedField(`${field.name}-number`)}
                                            onBlur={() => setFocusedField('')}
                                        />
                                    </View>
                                </View>
                            )}


                            {/* Date Picker */}
                            {field.type === 'date' && (
                                <View style={styles.datePickerContainer}>
                                    <DatePicker
                                        label={field.label}
                                        value={formData[field.name]}
                                        onChange={v => handleInputChange(field.name, v)}
                                    />
                                </View>
                            )}

                            {/* Select/Radio Options */}
                            {field.type === 'select' && (
                                <View style={styles.selectGroup}>
                                    {field.options.map((opt, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[
                                                styles.radioOption,
                                                formData[field.name] === opt && styles.radioOptionSelected,
                                            ]}
                                            onPress={() => handleInputChange(field.name, opt)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={[
                                                    styles.radioButtonOuter,
                                                    formData[field.name] === opt && styles.radioButtonOuterSelected,
                                                ]}
                                            >
                                                {formData[field.name] === opt && (
                                                    <View style={styles.radioButtonInner} />
                                                )}
                                            </View>
                                            <Text
                                                style={[
                                                    styles.radioText,
                                                    formData[field.name] === opt && styles.radioTextSelected,
                                                ]}
                                            >
                                                {opt}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* File Picker */}
                            {field.type === 'file' && (
                                <View style={styles.filePickerContainer}>
                                    <FilePicker
                                        label={`Upload ${field.label}`}
                                        onFilesPicked={(files) => handleFileSelect(field.name, files)}
                                    />
                                </View>
                            )}

                            
                            {/* Dropdown Input */}
{field.type === 'dropdown' && (
    <View style={styles.dropdownContainer}>
        <TouchableOpacity
            style={[
                styles.dropdownTrigger,
                focusedField === field.name && styles.inputContainerFocused,
                errors[field.name] && styles.inputContainerError,
            ]}
            onPress={() => {
                setFocusedField(field.name);
                // We'll use a local state or a common modal to show options
                setCurrentDropdownField(field); 
                setShowDropdownModal(true);
            }}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.dropdownValue,
                !formData[field.name] && { color: Colors.textMuted }
            ]}>
                {formData[field.name] || `Select ${field.label.toLowerCase()}`}
            </Text>
            <MaterialIcons 
                name="keyboard-arrow-down" 
                size={24} 
                color={Colors.textSecondary} 
            />
        </TouchableOpacity>
    </View>
)}

                            {/* Error Message */}
                            {errors[field.name] && (
                                <View style={styles.errorContainer}>
                                    <MaterialIcons name="error" size={14} color={Colors.error} />
                                    <Text style={styles.errorText}>{errors[field.name]}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Documents Summary */}
                {documents.length > 0 && (
                    <View style={styles.documentsCard}>
                        <View style={styles.documentsHeader}>
                            <MaterialIcons name="folder" size={20} color={Colors.primary} />
                            <Text style={styles.documentsTitle}>
                                Uploaded Documents ({documents.length})
                            </Text>
                        </View>
                        {documents.map((doc, idx) => (
                            <View key={idx} style={styles.documentItem}>
                                <MaterialIcons name="insert-drive-file" size={20} color={Colors.accent} />
                                <Text style={styles.documentName} numberOfLines={1}>
                                    {doc.name || `Document ${idx + 1}`}
                                </Text>
                                <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                            </View>
                        ))}
                    </View>
                )}


                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Submit Button */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[styles.submitButton, (loading || isUploading) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading || isUploading}
                    activeOpacity={0.8}
                >
                    {loading || isUploading ? (
                        <ActivityIndicator color={Colors.textLight} size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="send" size={20} color={Colors.textLight} />
                            <Text style={styles.submitButtonText}>Submit Application</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Confirmation Modal */}
            <ConfirmationModal
                visible={showConfirmModal}
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                serviceName={service.name}
                subServiceName={subServiceName}
            />

            {/* Country Code Picker Modal (Imported) */}
            <CountryCodePickerModal
                visible={showCountryPicker}
                onSelect={handleCountryCodeSelect}
                onCancel={() => setShowCountryPicker(false)}
            />

            {/* Shared Dropdown Picker Modal */}
<Modal
    visible={showDropdownModal}
    transparent
    animationType="slide"
    onRequestClose={() => setShowDropdownModal(false)}
>
    <View style={dropdownStyles.overlay}>
        <View style={dropdownStyles.sheet}>
            <View style={dropdownStyles.header}>
                <Text style={dropdownStyles.title}>Select {currentDropdownField?.label}</Text>
                <TouchableOpacity onPress={() => setShowDropdownModal(false)}>
                    <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {currentDropdownField?.options?.map((option, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[
                            dropdownStyles.option,
                            formData[currentDropdownField.name] === option && dropdownStyles.optionSelected
                        ]}
                        onPress={() => {
                            handleInputChange(currentDropdownField.name, option);
                            setShowDropdownModal(false);
                            setFocusedField('');
                        }}
                    >
                        <Text style={[
                            dropdownStyles.optionText,
                            formData[currentDropdownField.name] === option && dropdownStyles.optionTextSelected
                        ]}>
                            {option}
                        </Text>
                        {formData[currentDropdownField.name] === option && (
                            <MaterialIcons name="check" size={20} color={Colors.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    </View>
</Modal>


<DocumentAlertModal
  visible={showDocAlert}
  address={address}
  onClose={() => setShowDocAlert(false)}
  onGoRequests={() => {
    setShowDocAlert(false);
    navigation.navigate("UserTabs", { screen: "User Requests" });
  }}
/>


        </SafeAreaView>
    );
}


// ---------------------------------
// --- STYLESHEETS ---
// ---------------------------------


// Confirmation Modal Styles (Unchanged)
const confirmStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: Colors.cardBg,
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: `${Colors.success}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    highlight: {
        fontWeight: '800',
        color: Colors.primary,
    },
    subMessage: {
        fontSize: 13,
        color: Colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 24,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
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
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    confirmButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textLight,
    },
});


// Create a new separate stylesheet for the Dropdown Modal
const dropdownStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.cardBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '50%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    optionSelected: {
        backgroundColor: `${Colors.primary}10`,
    },
    optionText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    optionTextSelected: {
        color: Colors.primary,
        fontWeight: '700',
    },
});

// Main Component Styles (Modified for phone input changes)
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
        flexDirection: 'row',
    },
    subServiceHeader: {
        fontWeight: '800',
        color: Colors.primary,
        marginLeft: 4,
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

    // Info Card 
    infoCard: {
        flexDirection: 'row',
        backgroundColor: `${Colors.primary}10`,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    infoIconContainer: { marginRight: 12, },
    infoTextContainer: { flex: 1, },
    infoTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4, },
    infoText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, },
    subServiceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'flex-start',
        gap: 4,
    },
    subServiceBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.accent, },

    // Progress Card 
    progressCard: {
        backgroundColor: Colors.cardBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    progressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8, },
    progressTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, },
    progressBarContainer: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden', marginBottom: 8, },
    progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4, },
    progressText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', },

    // Form Container
    formContainer: {
        marginBottom: 16,
    },

    // Phone Input Styles
    phoneInputContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    countryCodeInputContainer: {
        // MODIFIED: Adjusted width to accommodate flag + code
        width: '30%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 10,
        backgroundColor: Colors.background,
    },
    countryCodeText: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '500',
        // White space between flag and code is handled inline in JSX
    },
    phoneNumberInputContainer: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 10,
        backgroundColor: Colors.background,
    },

    fieldGroup: {
        backgroundColor: Colors.cardBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    fieldLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    required: {
        color: Colors.error,
        fontSize: 14,
    },

    // Input Styles
    inputContainer: {
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 10,
        backgroundColor: Colors.background,
    },
    inputContainerFocused: {
        borderColor: Colors.primary,
        backgroundColor: Colors.cardBg,
    },
    inputContainerError: {
        borderColor: Colors.error,
    },
    textInput: {
        padding: 12,
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '500',
    },

    // Date Picker
    datePickerContainer: { marginTop: 4, },

    // Select/Radio
    selectGroup: { gap: 8, },
    radioOption: {
        flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10,
        backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border,
    },
    radioOptionSelected: { backgroundColor: `${Colors.primary}10`, borderColor: Colors.primary, },
    radioButtonOuter: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border,
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    radioButtonOuterSelected: { borderColor: Colors.primary, },
    radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, },
    radioText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500', },
    radioTextSelected: { color: Colors.primary, fontWeight: '700', },

    // File Picker
    filePickerContainer: { marginTop: 4, },

    dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.background,
},
dropdownValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
},

    // Error
    errorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4, },
    errorText: { fontSize: 12, color: Colors.error, fontWeight: '600', },

    // Documents Card
    documentsCard: { backgroundColor: Colors.cardBg, padding: 16, borderRadius: 12, marginBottom: 16, },
    documentsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8, },
    documentsTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, },
    documentItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background,
        padding: 10, borderRadius: 8, marginBottom: 6, gap: 10,
    },
    documentName: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '600', },

    // Bottom Button
    bottomButtonContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: Colors.cardBg,
        borderTopWidth: 1, borderTopColor: Colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
    },
    submitButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success,
        paddingVertical: 16, marginBottom: 16, borderRadius: 14, gap: 8, shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    submitButtonDisabled: { backgroundColor: Colors.textMuted, shadowOpacity: 0.1, },
    submitButtonText: { color: Colors.textLight, fontSize: 17, fontWeight: '800', letterSpacing: 0.3, },
});