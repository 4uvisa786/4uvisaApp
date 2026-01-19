import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import { useSelector, useDispatch } from "react-redux";
import { fetchDeliveryAddress } from "../../redux/slices/authSlice";


export default function HelpScreen() {
    const dispatch = useDispatch();
    const { deliveryAddress } = useSelector(state => state.auth);

  React.useEffect(() => {
    // Fetch delivery address on mount
    dispatch(fetchDeliveryAddress());
  }, [dispatch]);

  const ADDRESS = deliveryAddress || "Not Available";

  const copyAddress = () => {
    Clipboard.setString(ADDRESS);
    alert("Address copied to clipboard");
  };

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Icon name="help-circle-outline" size={26} color="#2563EB" />
        <Text style={styles.title}>Help & Instructions</Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Document Submission Required
        </Text>

        <Text style={styles.text}>
          If you apply for the following services:
        </Text>

        <View style={styles.list}>
          <Text style={styles.listItem}>• MOFA Attestation</Text>
          <Text style={styles.listItem}>• Embassy Attestation</Text>
        </View>

        <Text style={styles.text}>
          Then you must send your uploaded documents to the address below:
        </Text>

        {/* Address Box */}
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{ADDRESS}</Text>
          <TouchableOpacity onPress={copyAddress}>
            <Icon name="copy-outline" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1F2937",
  },
  text: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  list: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  listItem: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 4,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
});
