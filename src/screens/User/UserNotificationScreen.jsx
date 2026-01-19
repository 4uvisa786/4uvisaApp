import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchNotifications,
  markReadNotification,
  markAllReadNotifications,
  clearAllNotifications,
} from '../../redux/slices/userSlice';

import Colors from '../../themes/color';

const LIMIT = 10;

// Notification Card
const NotificationItem = ({ notification, onMarkRead }) => {
  const { title, message, type, createdAt, isRead, _id } = notification;

  const normalizedType = type === "error" ? "alert" : type;

  const getColor = () => {
    switch (normalizedType) {
      case "success": return Colors.success;
      case "warning": return Colors.warning;
      case "info": return Colors.accent;
      case "alert": return Colors.error;
      default: return Colors.accent;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, !isRead && styles.cardUnread]}
      onPress={() => onMarkRead(_id)}
      activeOpacity={0.8}
    >
      {/* {!isRead && <View style={styles.unreadDot} />} */}

      <View style={[styles.iconBox, { backgroundColor: `${getColor()}15` }]}>
        <MaterialIcons name="notifications" size={24} color={getColor()} />
      </View>

      <View style={styles.textArea}>
        {/* <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>

          {!isRead && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View> */}

        <Text style={styles.description} numberOfLines={2}>{message}</Text>

        <View style={styles.footer}>
          <View style={styles.timestampContainer}>
            <MaterialIcons name="access-time" size={14} color={Colors.textMuted} />
            <Text style={styles.timestamp}>
              {new Date(createdAt).toLocaleString()}
            </Text>
          </View>

          {/* {!isRead && (
            <TouchableOpacity
              style={styles.markReadBtn}
              onPress={() => onMarkRead(_id)}
            >
              <MaterialIcons name="done" size={14} color={Colors.primary} />
              <Text style={styles.markReadText}>Mark read</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ---------------------------------------------------------------
// MAIN SCREEN
// ---------------------------------------------------------------

const UserNotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const {
    notifications,
    notifPage,
    notifTotalPages,
    notifLoading
  } = useSelector(state => state.user);

  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const unread = notifications.filter(n => !n.isRead);
  const filtered = filter === "unread" ? unread : notifications;

  // Load first page
  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: LIMIT }));
  }, []);

  // Load more
  const loadMore = () => {
    if (notifPage < notifTotalPages && !notifLoading) {
      dispatch(fetchNotifications({ page: notifPage + 1, limit: LIMIT }));
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchNotifications({ page: 1, limit: LIMIT }))
      .finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.cardBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterTabText, filter === 'unread' && styles.filterTabTextActive]}>
            Unread ({unread.length})
          </Text>
        </TouchableOpacity>

        {unread.length > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => dispatch(clearAllNotifications())}
          >
            <MaterialIcons name="done-all" size={16} color={Colors.primary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          const endReached =
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 40;

          if (endReached) loadMore();
        }}
        scrollEventThrottle={300}
      >
        {notifLoading && notifications.length === 0 ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : filtered.length > 0 ? (
          <>
            {filtered.map(item => (
              <NotificationItem
                key={item._id}
                notification={item}
                onMarkRead={(id) => dispatch(markReadNotification(id))}
              />
            ))}

            {notifLoading && (
              <ActivityIndicator size="small" style={{ marginTop: 15 }} />
            )}

            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => dispatch(clearAllNotifications())}
              >
                <MaterialIcons name="delete-sweep" size={20} color={Colors.error} />
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>You're all caught up!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserNotificationScreen;

// ---------------------------------------------------------------
// STYLES (same as your version)
// ---------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: "center",
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: {
    fontSize: 18, fontWeight: "700", color: Colors.textPrimary,
  },

  filterContainer: {
    flexDirection: "row",
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: "center",
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    color: Colors.textSecondary, fontWeight: "600",
  },
  filterTabTextActive: {
    color: Colors.textLight,
  },
  markAllButton: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  scrollContent: { padding: 16, paddingBottom: 40 },

  card: {
    flexDirection: "row",
    backgroundColor: Colors.cardBg,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    position: "relative",
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: `${Colors.primary}05`,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 4,
  },
  unreadDot: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: "center", alignItems: "center",
    marginRight: 12,
  },
  textArea: { flex: 1 },

  row: {
    flexDirection: "row", justifyContent: "space-between",
  },
  title: {
    fontSize: 15, fontWeight: "700", flex: 1, paddingRight: 8,
  },
  newBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10, color: Colors.textLight, fontWeight: "800",
  },

  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginVertical: 6,
  },

  footer: { flexDirection: "row", justifyContent: "space-between" },

  timestampContainer: { flexDirection: "row", gap: 4, alignItems: "center" },
  timestamp: { color: Colors.textMuted, fontSize: 12 },

  markReadBtn: {
    flexDirection: "row", gap: 4, padding: 4,
  },
  markReadText: {
    color: Colors.primary, fontWeight: "600", fontSize: 12,
  },

  clearAllButton: {
    marginTop: 10,
    backgroundColor: `${Colors.error}15`,
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clearAllText: {
    color: Colors.error,
    fontWeight: "700",
  },

  emptyBox: { alignItems: "center", marginTop: 80 },
  emptyTitle: { fontWeight: "700", fontSize: 20 },
  emptySub: { marginTop: 8, fontSize: 14, color: Colors.textSecondary },
});
