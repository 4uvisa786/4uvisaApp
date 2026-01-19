import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import { showSnackbar } from "../../redux/slices/snackbarSlice";

const DocumentAlertModal = ({ visible, address, onClose, onGoRequests }) => {
  const copyAddress = () => {
    Clipboard.setString(address);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <Icon name="alert-circle-outline" size={26} color="#2563EB" />
            <Text style={styles.title}>Important</Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            Please send your uploaded documents on the address below
          </Text>

          {/* Address Box */}
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{address}</Text>
            <TouchableOpacity onPress={copyAddress}>
              <Icon name="copy-outline" size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {/* <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onClose}
            >
              <Text style={styles.secondaryText}>Close</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onGoRequests}
            >
              <Text style={styles.primaryText}>OK</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default DocumentAlertModal;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 16,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  addressText: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
