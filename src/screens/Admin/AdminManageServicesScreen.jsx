import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Image,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchServices,
  deleteService,
  toggleServiceStatus,
  createService,
  updateService,
} from '../../redux/slices/serviceSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../themes/color'; // Adjust path as needed
import { uploadImageToCloudinary, pickImageFromGallery } from '../../api/claudinaryImageUpload';

// Available field types for form fields
const FIELD_TYPES = ['text', 'number', 'phone', 'date', 'select', 'file'];

// NEW: Available UI types for sub-services
const SUB_SERVICE_UI_TYPES = ['card', 'dropdown'];

// --- Sub-Component for Service List Item ---

const ServiceListItem = ({ item, onEdit, onToggle, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            item.isActive ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.isActive
                  ? Colors.success
                  : Colors.textMuted,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>

    <Text style={styles.cardDescription} numberOfLines={2}>
      {item.description}
    </Text>

    <View style={styles.cardMeta}>
      <View style={styles.metaItem}>
        <MaterialIcons name="schedule" size={16} color={Colors.accent} />
        <Text style={styles.metaText}>{item.estimatedProcessingDays} days</Text>
      </View>
      <View style={styles.metaItem}>
        <MaterialIcons name="folder" size={16} color={Colors.primary} />
        <Text style={styles.metaText}>
          {item.requiredDocuments?.length || 0} docs
        </Text>
      </View>
      <View style={styles.metaItem}>
        <MaterialIcons name="business-center" size={16} color={Colors.secondary} />
        <Text style={styles.metaText}>
          {item.subServices?.length || 0} sub-service{item.subServices?.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {/* NEW: Display UI Type */}
      <View style={styles.metaItem}>
        <MaterialIcons name="select-all" size={16} color={Colors.warning} />
        <Text style={styles.metaText}>
          UI: {item.subServicesUIType || 'card'}
        </Text>
      </View>
      {/* END NEW */}
    </View>

    {/* <View style={styles.cardActions}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.editBtn]}
        onPress={() => onEdit(item)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="edit" size={18} color={Colors.primary} />
        <Text style={[styles.actionBtnText, { color: Colors.primary }]}>
          Edit
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          item.isActive ? styles.pauseBtn : styles.playBtn,
        ]}
        onPress={() => onToggle(item)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={item.isActive ? 'pause' : 'play-arrow'}
          size={18}
          color={item.isActive ? Colors.warning : Colors.success}
        />
        <Text
          style={[
            styles.actionBtnText,
            { color: item.isActive ? Colors.warning : Colors.success },
          ]}
        >
          {item.isActive ? 'Pause' : 'Activate'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.deleteBtn]}
        onPress={() =>
          Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => onDelete(item),
            },
          ])
        }
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete" size={18} color={Colors.error} />
        <Text style={[styles.actionBtnText, { color: Colors.error }]}>
          Delete
        </Text>
      </TouchableOpacity>
    </View> */}
  </View>
);

// --- Sub-Component for Sub-Service Item ---

const SubServiceItem = ({ subService, onRemove }) => (
  <View style={styles.fieldCard}>
    <View style={styles.fieldCardHeader}>
      <View style={styles.fieldCardLeft}>
        <MaterialIcons name="public" size={18} color={Colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>{subService.name}</Text>
          <Text style={styles.fieldMeta}>
            {subService.formFields?.length || 0} field{subService.formFields?.length !== 1 ? 's' : ''} • {subService.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  </View>
);

// --- Main Component ---

export default function AdminManageServicesScreen() {
  const dispatch = useDispatch();
  const { services, loading } = useSelector(state => state.service);

  // Modal & editing
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSubServiceModalVisible, setIsSubServiceModalVisible] = useState(false);
  const [editingSubService, setEditingSubService] = useState(null); // Used for editing existing sub-service

  // Image Upload State
  const [localImageUri, setLocalImageUri] = useState(null);
  // NEW: State to store the file type for upload
  const [localFileType, setLocalFileType] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);

  // Form (main service)
  const [form, setForm] = useState({
    name: '',
    imageURL: '',
    description: '',
    estimatedProcessingDays: '',
    isActive: true,
    requiredDocuments: [],
    subServices: [], // NEW: Array of sub-services
    airlines: [],
    // NEW FIELD ADDED TO STATE
    subServicesUIType: 'card',
  });

  // Form (current sub-service being added/edited)
  const [currentSubService, setCurrentSubService] = useState({
    name: '',
    formFields: [],
    isActive: true,
  });


  // Field inputs for forms (used in both main and sub-service)
  const [docInput, setDocInput] = useState('');
  const [airlineInput, setAirlineInput] = useState('');

  // Field inputs for *Form Field* creation
  const [fieldInput, setFieldInput] = useState({
    label: '',
    name: '',
    type: 'text',
    required: true,
    options: [],
    optionInput: '',
  });


  // Load services
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const generateKey = label => {
    return label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');
  };

  useEffect(() => {
    if (editingService) {
      setForm({
        name: editingService.name || '',
        imageURL: editingService.imageURL || '',
        description: editingService.description || '',
        estimatedProcessingDays:
          editingService.estimatedProcessingDays != null
            ? String(editingService.estimatedProcessingDays)
            : '',
        isActive:
          typeof editingService.isActive === 'boolean'
            ? editingService.isActive
            : true,
        requiredDocuments: editingService.requiredDocuments
          ? [...editingService.requiredDocuments]
          : [],
        subServices: editingService.subServices // NEW
          ? [...editingService.subServices]
          : [],
        airlines: editingService.airlines ? [...editingService.airlines] : [],
        // card or dropdown
        subServicesUIType: editingService.subServicesUIType || 'card',
      });
      // Clear local image state when starting an edit session
      setLocalImageUri(null); 
      setLocalFileType(null); // Clear file type
    }
  }, [editingService]);

  const resetSubServiceForm = () => {
    setEditingSubService(null);
    setCurrentSubService({
      name: '',
      formFields: [],
      isActive: true,
    });
    setFieldInput({
      label: '',
      name: '',
      type: 'text',
      required: true,
      options: [],
      optionInput: '',
    });
  };

  const openAddModal = () => {
    setEditingService(null);
    setForm({
      name: '',
      imageURL: '',
      description: '',
      estimatedProcessingDays: '',
      isActive: true,
      requiredDocuments: [],
      subServices: [], // NEW
      airlines: [],
      // NEW: Default value for new service
      subServicesUIType: 'card',
    });
    setDocInput('');
    setAirlineInput('');
    setLocalImageUri(null); // Reset local image on add
    setLocalFileType(null); // Reset file type
    resetSubServiceForm();
    setModalVisible(true);
  };

  const openEditSubServiceModal = (subService) => {
    setEditingSubService(subService);
    setCurrentSubService({
      name: subService.name,
      formFields: [...(subService.formFields || [])],
      isActive: subService.isActive,
    });
    // Reset fieldInput for new form field creation
    setFieldInput({
      label: '',
      name: '',
      type: 'text',
      required: true,
      options: [],
      optionInput: '',
    });
    setIsSubServiceModalVisible(true);
  };

  const handleSaveSubService = () => {
    if (!currentSubService.name.trim()) {
      return Alert.alert('Validation Error', 'Sub-service name is required.');
    }

    const newSubService = {
      name: currentSubService.name.trim(),
      formFields: currentSubService.formFields,
      isActive: currentSubService.isActive,
      // Mongoose will generate _id if not provided
      ...(editingSubService && { _id: editingSubService._id }),
    };
    
    setForm(prev => {
      let updatedSubServices = [...(prev.subServices || [])];
      
      if (editingSubService) {
        // Find and replace the existing sub-service
        const index = updatedSubServices.findIndex(s => s._id === editingSubService._id);
        if (index > -1) {
          updatedSubServices[index] = newSubService;
        }
      } else {
        // Check for duplicate name for *new* sub-service
        const exists = updatedSubServices.find(s => s.name.toLowerCase() === newSubService.name.toLowerCase());
        if (exists) {
          Alert.alert('Validation Error', `A sub-service named '${newSubService.name}' already exists.`);
          return prev;
        }
        // Add new sub-service
        updatedSubServices = [...updatedSubServices, newSubService];
      }
      
      return { ...prev, subServices: updatedSubServices };
    });

    setIsSubServiceModalVisible(false);
    resetSubServiceForm();
  };

  // --- IMAGE PICKER HANDLER ---
  const handleImagePick = async () => {
    const result = await pickImageFromGallery();
    if (result) {
        setLocalImageUri(result.uri);
        setLocalFileType(result.type); // Store the file type
    }
  };
  // -----------------------------

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      return Alert.alert(
        'Validation Error',
        'Service name and description are required.'
      );
    }
    
    // --- Validation for Form Fields within SubServices ---
    for (const sub of form.subServices) {
      const names = sub.formFields.map(f => f.name);
      const dup = names.find((n, i) => names.indexOf(n) !== i);
      if (dup) {
        return Alert.alert('Validation Error', `Duplicate form field name '${dup}' in sub-service '${sub.name}'.`);
      }
    }
    // ----------------------------------------------------

    let imageUrl = form.imageURL;

    // --- IMAGE UPLOAD LOGIC ---
    if (localImageUri && localFileType) { // Ensure both URI and Type are present
        setIsUploading(true);
        try {
            const result = await uploadImageToCloudinary(localImageUri, localFileType);
            console.log('Uploaded image URL:', result.url);
            imageUrl = result.url; // Use the new Cloudinary URL
        } catch (error) {
            Alert.alert('Upload Failed', error.message || 'Could not upload image to cloud.');
            setIsUploading(false);
            return; // Stop saving if upload fails
        } finally {
            setIsUploading(false);
        }
    }
    // --------------------------

    const payload = {
      name: form.name.trim(),
      imageURL: imageUrl,
      description: form.description,
      estimatedProcessingDays: Number(form.estimatedProcessingDays) || 0,
      isActive: !!form.isActive,
      requiredDocuments: form.requiredDocuments || [],
      subServices: form.subServices || [], // NEW: Send SubServices
      airlines: form.airlines || [],
      // NEW: Include the UI Type in the payload
      subServicesUIType: form.subServicesUIType,
    };

    if (editingService) {
      // NOTE: Redux action needs update to handle subServices
      dispatch(updateService({ id: editingService._id, ...payload }));
    } else {
      dispatch(createService(payload));
    }

    setModalVisible(false);
    setEditingService(null);
    setLocalImageUri(null);
    setLocalFileType(null);
  };

  const handleDelete = item => {
    dispatch(deleteService(item._id));
  };

  const handleToggle = item => {
    dispatch(
      toggleServiceStatus({ serviceId: item._id, status: !item.isActive })
    );
  };

  // Documents handlers
  const addDocument = () => {
    if (!docInput?.trim()) return;
    setForm(prev => ({
      ...prev,
      requiredDocuments: [...(prev.requiredDocuments || []), docInput.trim()],
    }));1
    setDocInput('');
  };

  const removeDocument = idx => {
    setForm(prev => {
      const arr = [...(prev.requiredDocuments || [])];
      arr.splice(idx, 1);
      return { ...prev, requiredDocuments: arr };
    });
  };

  // Airlines handlers
  const addAirline = () => {
    if (!airlineInput?.trim()) return;
    setForm(prev => ({
      ...prev,
      airlines: [...(prev.airlines || []), airlineInput.trim()],
    }));
    setAirlineInput('');
  };

  const removeAirline = idx => {
    setForm(prev => {
      const arr = [...(prev.airlines || [])];
      arr.splice(idx, 1);
      return { ...prev, airlines: arr };
    });
  };

  // Form field handlers (for *currentSubService*)
  const addFieldOption = () => {
    if (!fieldInput.optionInput?.trim()) return;
    setFieldInput(f => ({
      ...f,
      options: [...(f.options || []), f.optionInput.trim()],
      optionInput: '',
    }));
  };

  const addFormField = () => {
    if (!fieldInput.label.trim() || !fieldInput.name.trim()) {
      return Alert.alert('Validation Error', 'Field label and name are required.');
    }

    const existing = currentSubService.formFields.find(f => f.name === fieldInput.name);
    if (existing) {
      return Alert.alert('Validation Error', 'Form field name must be unique.');
    }

    const newField = {
      label: fieldInput.label.trim(),
      name: fieldInput.name.trim(),
      type: fieldInput.type,
      required: !!fieldInput.required,
      options:
        fieldInput.type === 'select' ? [...(fieldInput.options || [])] : [],
    };

    setCurrentSubService(prev => ({
      ...prev,
      formFields: [...(prev.formFields || []), newField],
    }));

    setFieldInput({
      label: '',
      name: '',
      type: 'text',
      required: false,
      options: [],
      optionInput: '',
    });
  };

  const removeFormField = idx => {
    setCurrentSubService(prev => {
      const arr = [...(prev.formFields || [])];
      arr.splice(idx, 1);
      return { ...prev, formFields: arr };
    });
  };

  // Sub-service handlers
  const removeSubService = idx => {
    setForm(prev => {
      const arr = [...(prev.subServices || [])];
      arr.splice(idx, 1);
      return { ...prev, subServices: arr };
    });
  };

  const keyExtractor = (item, index) => item._id || item.id || String(index);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Manage Services</Text>
            <Text style={styles.headerSubtitle}>
              {services.length} service{services.length !== 1 ? 's' : ''} available
            </Text>
          </View>
          {/* <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={24} color={Colors.textLight} />
          </TouchableOpacity> */}
        </View>

        <FlatList
          data={services}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ServiceListItem
              item={item}
              onEdit={it => {
                setEditingService(it);
                setModalVisible(true);
              }}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="business-center" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Services Yet</Text>
              <Text style={styles.emptyText}>Create your first service to get started</Text>
            </View>
          }
        />

        {/* --- Main Service Modal --- */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setEditingService(null);
                    setLocalImageUri(null);
                    setLocalFileType(null);
                  }}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Basic Info Section */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="info" size={20} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                  </View>

                  <Text style={styles.inputLabel}>Service Name *</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="business-center" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Enter service name"
                      placeholderTextColor={Colors.textMuted}
                      value={form.name}
                      onChangeText={v => setForm(p => ({ ...p, name: v }))}
                      style={styles.input}
                    />
                  </View>

                  {/* --- IMAGE UPLOAD UI --- */}
                  <Text style={styles.inputLabel}>Service Image (Optional)</Text>
                  
                  {/* Image Preview & Selection */}
                  <View style={styles.imagePreviewContainer}>
                    {/* Display existing URL or local URI preview */}
                    {((editingService && form.imageURL && !localImageUri) || localImageUri) ? (
                        <Image 
                            source={{ uri: localImageUri || form.imageURL }} 
                            style={styles.imagePreview} 
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="image" size={40} color={Colors.textMuted} />
                            <Text style={styles.imagePlaceholderText}>No Image</Text>
                        </View>
                    )}

                    <TouchableOpacity
                      style={styles.imagePickButton}
                      onPress={handleImagePick}
                      disabled={isUploading}
                      activeOpacity={0.8}
                    >
                        <MaterialIcons 
                            name="camera-alt" 
                            size={20} 
                            color={Colors.textLight} 
                            style={{ marginRight: 5 }} 
                        />
                      <Text style={styles.imagePickButtonText}>
                        {isUploading ? 'Uploading...' : localImageUri ? 'Change Image' : 'Select Image'}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Clear Button */}
                    {form.imageURL || localImageUri ? (
                        <TouchableOpacity
                            style={styles.imageClearButton}
                            onPress={() => {
                                setLocalImageUri(null);
                                setLocalFileType(null);
                                setForm(p => ({ ...p, imageURL: '' }));
                            }}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="close" size={18} color={Colors.error} />
                        </TouchableOpacity>
                    ) : null}

                  </View>

                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    placeholder="Detailed description of the service"
                    placeholderTextColor={Colors.textMuted}
                    value={form.description}
                    onChangeText={v => setForm(p => ({ ...p, description: v }))}
                    style={[styles.textArea]}
                    multiline
                    numberOfLines={4}
                  />

                  <Text style={styles.inputLabel}>Processing Days *</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="schedule" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      placeholder="e.g. 5"
                      placeholderTextColor={Colors.textMuted}
                      value={form.estimatedProcessingDays}
                      onChangeText={v =>
                        setForm(p => ({
                          ...p,
                          estimatedProcessingDays: v.replace(/[^0-9]/g, ''),
                        }))
                      }
                      style={styles.input}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.switchRow}>
                    <View style={styles.switchLeft}>
                      <MaterialIcons name="toggle-on" size={20} color={Colors.primary} />
                      <Text style={styles.switchLabel}>Service is Active</Text>
                    </View>
                    <Switch
                      value={!!form.isActive}
                      onValueChange={v => setForm(p => ({ ...p, isActive: v }))}
                      trackColor={{ false: Colors.borderDark, true: `${Colors.primary}50` }}
                      thumbColor={form.isActive ? Colors.primary : Colors.textMuted}
                    />
                  </View>
                </View>

                {/* NEW SECTION: Sub-Service UI Type */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="select-all" size={20} color={Colors.accent} />
                    <Text style={styles.sectionTitle}>Sub-Service UI Display</Text>
                  </View>

                  <Text style={styles.inputLabel}>How should sub-services be presented?</Text>
                  <View style={styles.typeButtons}>
                      {SUB_SERVICE_UI_TYPES.map(t => (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.typeBtn,
                            styles.subServiceTypeBtn,
                            form.subServicesUIType === t && styles.typeBtnActive,
                          ]}
                          onPress={() => setForm(p => ({ ...p, subServicesUIType: t }))}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons 
                            name={t === 'card' ? 'view-module' : 'list-alt'} 
                            size={18} 
                            color={form.subServicesUIType === t ? Colors.textLight : Colors.textSecondary}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={
                              form.subServicesUIType === t
                                ? styles.typeBtnTextActive
                                : styles.typeBtnText
                            }
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={[styles.helperText, { marginTop: 12 }]}>
                      **Card**: Better for services with few, visually distinct sub-services (e.g., Visa types).{' '}
                      **Dropdown**: Better for services with many sub-services (e.g., many countries).
                    </Text>
                </View>
                {/* END NEW SECTION */}

                {/* Sub-Services Section (NEW) */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="layers" size={20} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Sub-Services (e.g., Countries)</Text>
                  </View>
                  
                  {(form.subServices || []).map((sub, i) => (
                    <TouchableOpacity
                      key={sub._id || sub.name + i}
                      onPress={() => openEditSubServiceModal(sub)}
                      style={{ marginBottom: 10 }}
                      activeOpacity={0.8}
                    >
                      <SubServiceItem 
                        subService={sub} 
                        onRemove={() => removeSubService(i)} 
                      />
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.addFieldBtn}
                    onPress={() => {
                      resetSubServiceForm();
                      setIsSubServiceModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="add-circle" size={20} color={Colors.textLight} />
                    <Text style={styles.addFieldBtnText}>Add New Sub-Service</Text>
                  </TouchableOpacity>

                  <Text style={[styles.helperText, { marginTop: 12 }]}>
                    A sub-service is typically a country or region with its own set of required forms.
                  </Text>
                </View>

                {/* Airlines Section */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="flight" size={20} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Applicable Airlines</Text>
                  </View>

                  <View style={styles.tagList}>
                    {(form.airlines || []).map((a, i) => (
                      <View key={i} style={styles.tagPill}>
                        <Text style={styles.tagPillText}>{a}</Text>
                        <TouchableOpacity
                          onPress={() => removeAirline(i)}
                          style={styles.tagDelete}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="close" size={14} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.addRow}>
                    <TextInput
                      placeholder="Enter airline (e.g., Emirates)"
                      placeholderTextColor={Colors.textMuted}
                      value={airlineInput}
                      onChangeText={setAirlineInput}
                      style={[styles.input, styles.flexInput]}
                    />

                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={addAirline}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="add" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.helperText}>
                    Leave empty if service applies to all airlines
                  </Text>
                </View>

                {/* Required Documents Section */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="folder" size={20} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Required Documents (Global)</Text>
                  </View>

                  <View style={styles.tagList}>
                    {(form.requiredDocuments || []).map((d, i) => (
                      <View key={i} style={styles.tagPill}>
                        <Text style={styles.tagPillText}>{d}</Text>
                        <TouchableOpacity
                          onPress={() => removeDocument(i)}
                          style={styles.tagDelete}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="close" size={14} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.addRow}>
                    <TextInput
                      placeholder="Enter document name (e.g., Passport Copy)"
                      placeholderTextColor={Colors.textMuted}
                      value={docInput}
                      onChangeText={setDocInput}
                      style={[styles.input, styles.flexInput]}
                    />
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={addDocument}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="add" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>
                    These documents are required for *all* sub-services.
                  </Text>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                  style={[styles.saveBtn, (loading || isUploading) && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={loading || isUploading}
                  activeOpacity={0.8}
                >
                  {(loading || isUploading) ? (
                    <ActivityIndicator size="small" color={Colors.textLight} />
                  ) : (
                    <>
                      <MaterialIcons 
                        name={editingService ? "save" : "add-circle"} 
                        size={20} 
                        color={Colors.textLight} 
                      />
                      <Text style={styles.saveBtnText}>
                        {editingService ? 'Update Service' : 'Create Service'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingService(null);
                    setLocalImageUri(null);
                    setLocalFileType(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* --- Sub-Service/Form Fields Modal --- */}
        <Modal 
          visible={isSubServiceModalVisible} 
          animationType="slide" 
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingSubService ? `Edit ${currentSubService.name}` : 'Add New Sub-Service'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSubServiceModalVisible(false);
                    resetSubServiceForm();
                  }}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Sub-Service Info */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="public" size={20} color={Colors.accent} />
                    <Text style={styles.sectionTitle}>Sub-Service Details</Text>
                  </View>
                  
                  <Text style={styles.inputLabel}>Sub-Service Name *</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="flag" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      placeholder="e.g., USA, UK Visa"
                      placeholderTextColor={Colors.textMuted}
                      value={currentSubService.name}
                      onChangeText={v => setCurrentSubService(p => ({ ...p, name: v }))}
                      style={styles.input}
                    />
                  </View>
                  
                  <View style={styles.switchRow}>
                    <View style={styles.switchLeft}>
                      <MaterialIcons name="toggle-on" size={20} color={Colors.primary} />
                      <Text style={styles.switchLabel}>Sub-Service is Active</Text>
                    </View>
                    <Switch
                      value={!!currentSubService.isActive}
                      onValueChange={v => setCurrentSubService(p => ({ ...p, isActive: v }))}
                      trackColor={{ false: Colors.borderDark, true: `${Colors.primary}50` }}
                      thumbColor={currentSubService.isActive ? Colors.primary : Colors.textMuted}
                    />
                  </View>
                </View>

                {/* Form Fields Section (for Sub-Service) */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="dynamic-form" size={20} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Form Fields for: {currentSubService.name || 'New Sub-Service'}</Text>
                  </View>

                  {(currentSubService.formFields || []).map((f, idx) => (
                    <View key={idx} style={styles.fieldCard}>
                      <View style={styles.fieldCardHeader}>
                        <View style={styles.fieldCardLeft}>
                          <MaterialIcons 
                            name={
                              f.type === 'text' ? 'text-fields' :
                              f.type === 'number' ? 'numbers' :
                              f.type === 'phone' ? 'phone' :
                              f.type === 'date' ? 'calendar-today' :
                              f.type === 'select' ? 'checklist' :
                              'attach-file'
                            } 
                            size={18} 
                            color={Colors.primary} 
                          />
                          <View>
                            <Text style={styles.fieldLabel}>{f.label}</Text>
                            <Text style={styles.fieldMeta}>
                              {f.name} • {f.type} {f.required ? '• Required' : ''}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={() => removeFormField(idx)}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="delete" size={20} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                      {f.type === 'select' && (
                        <View style={styles.optionsPreview}>
                          <Text style={styles.optionsLabel}>Options:</Text>
                          {(f.options || []).map((op, i) => (
                            <Text key={i} style={styles.optionText}>• {op}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}

                  {/* Add New Field */}
                  <View style={styles.addFieldSection}>
                    <Text style={styles.addFieldTitle}>Add New Field</Text>

                    <Text style={styles.inputLabel}>Field Label *</Text>
                    <TextInput
                      placeholder="e.g., Name"
                      placeholderTextColor={Colors.textMuted}
                      value={fieldInput.label}
                      onChangeText={v =>
                        setFieldInput(s => ({
                          ...s,
                          label: v,
                          name: generateKey(v),
                        }))
                      }
                      style={styles.input}
                    />
                    <Text style={styles.helperText}>
                      Generated key: **{fieldInput.name || 'field_name'}**
                    </Text>

                    <Text style={styles.inputLabel}>Field Type *</Text>
                    <View style={styles.typeButtons}>
                      {FIELD_TYPES.map(t => (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.typeBtn,
                            fieldInput.type === t && styles.typeBtnActive,
                          ]}
                          onPress={() =>
                            setFieldInput(s => ({ ...s, type: t, options: [] }))
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={
                              fieldInput.type === t
                                ? styles.typeBtnTextActive
                                : styles.typeBtnText
                            }
                          >
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.switchRow}>
                      <View style={styles.switchLeft}>
                        <MaterialIcons name="error" size={18} color={Colors.error} />
                        <Text style={styles.switchLabel}>Required Field</Text>
                      </View>
                      <Switch
                        value={!!fieldInput.required}
                        onValueChange={v =>
                          setFieldInput(s => ({ ...s, required: v }))
                        }
                        trackColor={{ false: Colors.borderDark, true: `${Colors.primary}50` }}
                        thumbColor={fieldInput.required ? Colors.primary : Colors.textMuted}
                      />
                    </View>

                    {fieldInput.type === 'select' && (
                      <View style={styles.optionsSection}>
                        <Text style={styles.inputLabel}>Select Options</Text>
                        <View style={styles.tagList}>
                          {(fieldInput.options || []).map((op, i) => (
                            <View key={i} style={styles.tagPill}>
                              <Text style={styles.tagPillText}>{op}</Text>
                              <TouchableOpacity
                                onPress={() =>
                                  setFieldInput(s => {
                                    const arr = [...(s.options || [])];
                                    arr.splice(i, 1);
                                    return { ...s, options: arr };
                                  })
                                }
                                style={styles.tagDelete}
                                activeOpacity={0.7}
                              >
                                <MaterialIcons name="close" size={14} color={Colors.error} />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>

                        <View style={styles.addRow}>
                          <TextInput
                            placeholder="Option value (e.g., Male)"
                            placeholderTextColor={Colors.textMuted}
                            value={fieldInput.optionInput}
                            onChangeText={v =>
                              setFieldInput(s => ({ ...s, optionInput: v }))
                            }
                            style={[styles.input, styles.flexInput]}
                          />
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={addFieldOption}
                            activeOpacity={0.7}
                          >
                            <MaterialIcons name="add" size={20} color={Colors.textLight} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.addFieldBtn}
                      onPress={addFormField}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="add-circle" size={20} color={Colors.textLight} />
                      <Text style={styles.addFieldBtnText}>Add Field to Form</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sub-Service Action Buttons */}
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveSubService}
                  activeOpacity={0.8}
                >
                  <MaterialIcons 
                    name={editingSubService ? "save" : "add-circle"} 
                    size={20} 
                    color={Colors.textLight} 
                  />
                  <Text style={styles.saveBtnText}>
                    {editingSubService ? 'Save Sub-Service' : 'Add Sub-Service'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setIsSubServiceModalVisible(false);
                    resetSubServiceForm();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// NOTE: Styles remain the same for brevity.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // Service Card
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusActive: {
    backgroundColor: `${Colors.success}15`,
  },
  statusInactive: {
    backgroundColor: `${Colors.textMuted}15`,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  editBtn: {
    backgroundColor: `${Colors.primary}10`,
  },
  playBtn: {
    backgroundColor: `${Colors.success}10`,
  },
  pauseBtn: {
    backgroundColor: `${Colors.warning}10`,
  },
  deleteBtn: {
    backgroundColor: `${Colors.error}10`,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form Section
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Input Styles
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 14,
    fontWeight: '500',
  },

  
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -12,
    marginBottom: 12,
    fontWeight: '500',
  },

  // --- NEW IMAGE STYLES ---
  imagePreviewContainer: {
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: Colors.textMuted,
    marginTop: 8,
    fontWeight: '600',
  },
  imagePickButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  imagePickButtonText: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: '700',
  },
  imageClearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  // --- END NEW IMAGE STYLES ---

  // Switch Row
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Tags
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 6,
  },
  tagPillText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  tagDelete: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${Colors.error}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Add Row
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  flexInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Field Card
  fieldCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  fieldCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fieldCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fieldMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  optionsPreview: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  optionsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },

  // Add Field Section
  addFieldSection: {
    backgroundColor: `${Colors.accent}10`,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  addFieldTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  // Type Buttons
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.textLight,
    fontWeight: '700',
  },
  subServiceTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Options Section
  optionsSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },

  // Add Field Button
  addFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  addFieldBtnText: {
    color: Colors.textLight,
    fontSize: 15,
    fontWeight: '700',
  },

  // Action Buttons
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnText: {
    color: Colors.textLight,
    fontSize: 17,
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: Colors.background,
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});