// components/QuickBookingCard.js (ENHANCED WITH ANIMATIONS)
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient'; 
import Colors from '../themes/color'; 

export const QuickBookingCard = ({ onPress }) => {
  // Animation values
  const planeAnim = useRef(new Animated.Value(0)).current;
  const cloudAnim1 = useRef(new Animated.Value(0)).current;
  const cloudAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Plane flying animation (continuous loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(planeAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(planeAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cloud animations (slower, continuous)
    Animated.loop(
      Animated.timing(cloudAnim1, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(cloudAnim2, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Plane movement from left to right with slight upward curve
  const planeTranslateX = planeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-30, 150, 320],
  });

  const planeTranslateY = planeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  });

  const planeRotate = planeAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: ['0deg', '10deg', '-5deg', '0deg'],
  });

  // Cloud movements
  const cloud1TranslateX = cloudAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const cloud2TranslateX = cloudAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298', '#7e8ba3']} // Sky gradient
      style={quickStyles.cardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Animated clouds background */}
      <Animated.View 
        style={[
          quickStyles.cloud,
          quickStyles.cloud1,
          { transform: [{ translateX: cloud1TranslateX }] }
        ]}
      >
        <MaterialIcons name="cloud" size={60} color="rgba(255, 255, 255, 0.15)" />
      </Animated.View>
      
      <Animated.View 
        style={[
          quickStyles.cloud,
          quickStyles.cloud2,
          { transform: [{ translateX: cloud2TranslateX }] }
        ]}
      >
        <MaterialIcons name="cloud" size={80} color="rgba(255, 255, 255, 0.1)" />
      </Animated.View>

      {/* Animated plane */}
      <Animated.View
        style={[
          quickStyles.planeContainer,
          {
            transform: [
              { translateX: planeTranslateX },
              { translateY: planeTranslateY },
              { rotate: planeRotate },
            ],
          },
        ]}
      >
        <MaterialIcons name="flight" size={28} color="rgba(255, 255, 255, 0.9)" />
      </Animated.View>

      <Animated.View style={[quickStyles.contentWrapper, { opacity: fadeAnim }]}>
        {/* Header with flight icon */}
        <View style={quickStyles.header}>
          <View style={quickStyles.iconBadge}>
            <MaterialIcons name="airplanemode-active" size={24} color="#fff" />
          </View>
          <View style={quickStyles.headerText}>
            <Text style={quickStyles.badge}>FLIGHTS</Text>
            <Text style={quickStyles.title}>Book Your Flight</Text>
          </View>
        </View>
        
        <Text style={quickStyles.subtitle}>
          ✈️ Explore destinations worldwide
        </Text>
        
        <View style={quickStyles.divider} />
        
        {/* Features */}
        <View style={quickStyles.features}>
          <View style={quickStyles.feature}>
            <MaterialIcons name="schedule" size={18} color="rgba(255, 255, 255, 0.9)" />
            <Text style={quickStyles.featureText}>Instant Booking</Text>
          </View>
          <View style={quickStyles.feature}>
            <MaterialIcons name="verified" size={18} color="rgba(255, 255, 255, 0.9)" />
            <Text style={quickStyles.featureText}>Secure Payment</Text>
          </View>
          <View style={quickStyles.feature}>
            <MaterialIcons name="support-agent" size={18} color="rgba(255, 255, 255, 0.9)" />
            <Text style={quickStyles.featureText}>24/7 Support</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            style={quickStyles.button} 
            onPress={onPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']} // Gold gradient
              style={quickStyles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons name="flight-takeoff" size={24} color="#1e3c72" />
              <Text style={quickStyles.buttonText}>Search Flights Now</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#1e3c72" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
};

const quickStyles = StyleSheet.create({
  cardGradient: {
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3c72',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cloud: {
    position: 'absolute',
  },
  cloud1: {
    top: 20,
    right: 40,
  },
  cloud2: {
    top: 80,
    left: 30,
  },
  planeContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    zIndex: 1,
  },
  contentWrapper: {
    padding: 24,
    paddingTop: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#1e3c72',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
    marginRight: 8,
    letterSpacing: 0.3,
  },
});
