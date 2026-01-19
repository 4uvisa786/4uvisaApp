// components/GlobalSnackbar.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { hideSnackbar } from '../redux/slices/snackbarSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../themes/color';

const { width } = Dimensions.get('window');

const GlobalSnackbar = () => {
  const dispatch = useDispatch();
  const { open, message, type, duration } = useSelector(state => state.snackbar);
  
  const translateY = useRef(new Animated.Value(100)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Auto hide after duration
      timeoutRef.current = setTimeout(() => {
        handleHide();
      }, duration);
    } else {
      handleHide();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [open, duration]);

  const handleHide = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      dispatch(hideSnackbar());
    });
  };

  const getConfig = () => {
    const configs = {
      success: {
        bg: Colors.success,
        icon: 'check-circle',
      },
      error: {
        bg: Colors.error,
        icon: 'error',
      },
      warning: {
        bg: Colors.warning,
        icon: 'warning',
      },
      info: {
        bg: Colors.accent,
        icon: 'info',
      },
    };
    return configs[type] || configs.success;
  };

  const config = getConfig();

  if (!open && translateY._value === 100) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons name={config.icon} size={24} color={Colors.textLight} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={handleHide}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: Colors.textLight,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
});

export default GlobalSnackbar;
