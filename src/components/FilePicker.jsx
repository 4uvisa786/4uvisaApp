import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { pick, types } from '@react-native-documents/picker';

export default function FilePicker({ onFilesPicked, label = 'Pick Files' }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handlePick = async () => {
    try {
      const result = await pick({
        allowMultiSelection: true,
        type: [types.allFiles],
      });

      if (result) {
        const updatedFiles = [...selectedFiles, ...result];
        setSelectedFiles(updatedFiles);
        onFilesPicked(updatedFiles);
      }
    } catch (error) {
      console.log('File picking cancelled or error:', error);
    }
  };

  const removeFile = index => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesPicked(updated);
  };

  return (
    <View style={{ marginBottom: 5 }}>
      <TouchableOpacity style={styles.button} onPress={handlePick}>
        <Text style={styles.btnText}>{label}</Text>
      </TouchableOpacity>

      {/* Show file list */}
      {selectedFiles.length > 0 && (
        <View style={styles.fileList}>
          {selectedFiles.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Text style={styles.fileText}>📄 {file.name}</Text>

              <TouchableOpacity onPress={() => removeFile(index)}>
                <Text style={styles.removeText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4c66f7',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  fileList: {
    marginTop: 10,
    backgroundColor: '#e9f0ff',
    borderRadius: 8,
    padding: 10,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  fileText: {
    fontSize: 14,
    color: '#333',
  },
  removeText: {
    fontSize: 16,
    color: '#d9534f',
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
});
