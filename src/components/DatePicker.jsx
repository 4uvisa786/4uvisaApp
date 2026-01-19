import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePicker({ label, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);

    if (selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
  };

  return (
    <View>
      {label && (
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>{label}</Text>
      )}

      <TouchableOpacity
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: '#ced4da',
          borderRadius: 8,
          backgroundColor: '#f8f9fa',
        }}
        onPress={() => setShowPicker(true)}
      >
        <Text style={{ color: '#333' }}>
          {value ? value : `Select ${label}`}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          // maximumDate={new Date()} // Optional for DOB
        />
      )}
    </View>
  );
}
