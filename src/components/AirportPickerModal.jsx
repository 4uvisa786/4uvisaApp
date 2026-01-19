import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchAirports } from "../redux/slices/airTicketSlice";

const AirportPickerModal = ({ visible, onClose, onSelect }) => {
  const dispatch = useDispatch();
  const { airports, loading } = useSelector(state => state.airTicket);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible && airports.length === 0) {
      dispatch(fetchAirports());
    }
  }, [visible]);

  const filtered = airports.filter(item =>
    `${item.city}${item.airport}${item.code}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      // Crucial setting: Allows the press to register on the parent view
      onRequestClose={onClose} 
    >
      {/* 1. Change View to TouchableOpacity for the overlay
        2. Set activeOpacity to 1 to prevent visual feedback
        3. Assign onPress to the onClose function 
      */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* Stop event propagation here so tapping inside the container 
          *doesn't* trigger the overlay's onClose 
        */}
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={() => { /* Do nothing - stops the event from bubbling up to the overlay */ }}
        >

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.searchInput}
            placeholder="Search city or airport..."
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <View>
                    <Text style={styles.city}>
                      {item.city} ({item.code})
                    </Text>
                    <Text style={styles.airport}>{item.airport}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default AirportPickerModal;

// (Styles remain the same as the previous response)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "white",
    height: "70%",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  city: { fontSize: 16, fontWeight: "bold" },
  airport: { fontSize: 13, color: "#555" },
});