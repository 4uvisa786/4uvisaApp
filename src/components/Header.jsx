import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../themes/color'; // Import your Colors file

export default function Header({
  title,
  user,
  onProfilePress,
  onNotificationPress,
}) {
  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const initials =
    user?.firstName && user?.lastName
      ? getInitials(user.firstName + ' ' + user.lastName)
      : user?.username
      ? getInitials(user.username)
      : 'U';

  const notificationCount = user?.notifications?.length || 0;

  return (
    <View style={styles.headerContainer}>
      {/* Left Section - Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subTitle}>Visa & Travel Management</Text>
      </View>

      {/* Right Section - Actions */}
      <View style={styles.actions}>
        {/* Notification Button */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.actionIcon}>🔔</Text>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.profileAvatar}
          >
            <Text style={styles.profileText}>{initials}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent', // Transparent to show gradient from parent
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 6,
  },
  iconContainer: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '800',
  },
  profileButton: {
    padding: 2,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileText: {
    color: Colors.textLight,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
