import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, // Used to show a native loading spinner
  Animated, // Used for subtle fade-in animation
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial value for opacity

  useEffect(() => {
    // Simple fade-in animation for the logo/text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds fade-in
      useNativeDriver: true,
    }).start();

    // In a real application, this is where you would handle
    // initial data loading, authentication checks, and then navigate away.
    // Example: setTimeout(() => navigation.replace('Home'), 3000);
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          
          {/* Main Logo/Branding */}
          <Text style={styles.logoEmoji}>✈️</Text>
          <Text style={styles.logoText}>VisaAssist</Text>
          <Text style={styles.tagline}>Your Global Journey Starts Here</Text>
          
          {/* Loading Indicator */}
          <ActivityIndicator 
            style={styles.loadingIndicator}
            size="large" 
            color="#ffffff" // White spinner for contrast
          />

        </Animated.View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007bff', // Primary Blue background
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff', // White text
    letterSpacing: 1,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    marginBottom: 50,
  },
  loadingIndicator: {
    marginTop: 20,
  }
});