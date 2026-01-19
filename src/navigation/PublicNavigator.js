import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { View } from 'react-native';

import HomeScreen from '../screens/User/HomeScreen';
import AuthNavigator from './AuthNavigator';
import UserServiceDetailsScreen from '../screens/User/UserServiceDetailsScreen';

// Define the same colors for consistency
const Colors = {
  primary: '#1434CB',
  textLight: '#FFFFFF',
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Reusable Icon component (matching your UserTabs style)
const TabBarIcon = ({ route, color, size, isFocused }) => {
  let iconName = route.name === 'Home' ? 'home' : 'person';

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {isFocused && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            width: 50,
            height: 5,
            backgroundColor: Colors.textLight,
            borderRadius: 2,
          }}
        />
      )}
      <MaterialIcons name={iconName} size={size} color={color} style={{ marginTop: isFocused ? 3 : 0 }} />
    </View>
  );
};

// The Tab Navigation for Public Users
function PublicTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon route={route} color={color} size={size} isFocused={focused} />
        ),
        tabBarActiveTintColor: Colors.textLight,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Slightly faded white
        tabBarStyle: {
          height: 80,
          backgroundColor: Colors.primary,
          borderTopWidth: 0,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Profile" 
        component={AuthNavigator} 
        options={{ tabBarLabel: 'Login' }} // Label it "Login" for public users
      />
    </Tab.Navigator>
  );
}

// Main Public Navigator
export default function PublicNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* The Tabs are now the entry point */}
      <Stack.Screen name="PublicTabs" component={PublicTabs} />
      {/* 2. Detail Screens (Add these so guests can view services) */}
      <Stack.Screen 
        name="UserServiceDetails" 
        component={UserServiceDetailsScreen} 
      />
      
      {/* Keep Auth here as well in case you need to push to it from inside Home */}
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </Stack.Navigator>
  );
}