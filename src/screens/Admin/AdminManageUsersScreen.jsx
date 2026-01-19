import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Colors from "../../themes/color";
import { fetchAllUsers } from "../../redux/slices/adminSlice";

const getStatusConfig = (isActive) => {
  if (isActive) {
    return {
      bg: `${Colors.success}15`,
      color: Colors.success,
      icon: "check-circle",
      text: "active",
    };
  }
  return {
    bg: `${Colors.error}15`,
    color: Colors.error,
    icon: "block",
    text: "inactive",
  };
};

// ---------------- USER CARD ----------------
const UserCard = ({ user, onPress }) => {
  const statusConfig = getStatusConfig(user.isActive);

  const getInitials = () =>
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(user)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: statusConfig.color },
          ]}
        />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>

        <View style={styles.detailRow}>
          <MaterialIcons name="email" size={14} color={Colors.textMuted} />
          <Text style={styles.detailText}>{user.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="phone" size={14} color={Colors.textMuted} />
          <Text style={styles.detailText}>{user.phone}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Joined: {new Date(user.createdAt).toDateString()}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bg },
            ]}
          >
            <MaterialIcons
              name={statusConfig.icon}
              size={12}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
    </TouchableOpacity>
  );
};

// ---------------- MAIN SCREEN ----------------
export default function AdminManageUsers({ navigation }) {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.phone?.toString().includes(searchQuery)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((u) =>
        filterStatus === "active" ? u.isActive : !u.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, filterStatus]);

  const handleUserPress = (user) => {
    navigation.navigate("UserDetails", { user });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchAllUsers()).finally(() => setRefreshing(false));
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>
            {filteredUsers.length} user(s)
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <MaterialIcons name="person-add" size={24} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="check-circle" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="block" size={24} color={Colors.error} />
          <Text style={styles.statValue}>{stats.inactive}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {/* Search */}
      {/* <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, phone..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View> */}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Status:</Text>

        {["all", "active", "inactive"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filterStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === status && styles.filterChipTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <UserCard user={item} onPress={handleUserPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons
                name="people-outline"
                size={64}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptyText}>
                Try changing filters or search query.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.cardBg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textLight,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    color: Colors.textLight,
    fontWeight: "800",
  },
  statusDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.cardBg,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
