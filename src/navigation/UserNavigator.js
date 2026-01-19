import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/User/HomeScreen';
import ProfileScreen from '../screens/User/ProfileScreen';
import AirTicketBookingScreen from '../screens/User/AirTicketBookingScreen';
import SettingsScreen from '../screens/User/SettingsScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UserManageRequestsScreen from '../screens/User/UserManageRequestsScreen';
import UserServiceDetailsScreen from '../screens/User/UserServiceDetailsScreen';
import UserApplyFormScreen from '../screens/User/UserApplyFormScreen';
import UserNotificationScreen from '../screens/User/UserNotificationScreen';
import UserRequestDetailedScreen from '../screens/User/UserRequestDetailedScreen';
import MyAirBookings from '../screens/User/MyAirBookings';
import HelpScreen from '../screens/User/HelpScreen';
import TermsConditionsScreen from '../screens/User/TermsConditionsScreen';
import { View } from 'react-native';

// --- Placeholder for Colors (Assuming these values from previous context) ---
const Colors = {
  primary: '#1434CB', // Primary Blue (Deep)
  primaryLight: '#4A68E8', // Lighter Blue (Inactive contrast)
  textLight: '#FFFFFF', // White text (Active)
  cardBg: '#FFFFFF', // Card Background
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Custom Tab Bar Icon Component with White Top Indicator ---
const TabBarIcon = ({ route, color, size, isFocused }) => {
  let iconName;

  if (route.name === 'Home') {
    iconName = 'home';
  } else if (route.name === 'Profile') {
    iconName = 'person';
  } else if (route.name === 'Air Ticket') {
    iconName = 'flight';
  } else if (route.name === 'Settings') {
    iconName = 'settings';
  } else if (route.name === 'User Requests') {
    iconName = 'list-alt';
  } else {
    iconName = 'info';
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {/* The Active Bar/Indicator (White) */}
      {isFocused && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            width: 50, // Width of the indicator bar
            height: 5,
            backgroundColor: Colors.textLight, // WHITE BAR
            borderRadius: 2,
          }}
        />
      )}
      {/* The Icon */}
      <MaterialIcons name={iconName} size={size} color={color} style={{ marginTop: isFocused ? 3 : 0 }} />
    </View>
  );
};

function UserTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        // Using custom component to render the top bar
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon route={route} color={color} size={size} isFocused={focused} />
        ),
        // --- THEME IMPLEMENTATION: BLUE BACKGROUND with White/Light Contrast ---
        tabBarActiveTintColor: Colors.textLight, // Active: White
        tabBarInactiveTintColor: Colors.textLight, // Inactive: Light Blue/Muted White for better visibility on dark BG
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 80,
          backgroundColor: Colors.primary, // SET BACKGROUND TO PRIMARY BLUE
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        }
      })}
    >
      {/* Tab Screens */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Air Ticket"
        component={AirTicketBookingScreen}
        options={{ tabBarLabel: 'Air Ticket' }}
      />
      <Tab.Screen
        name="User Requests"
        component={UserManageRequestsScreen}
        options={{ tabBarLabel: 'My Requests' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Account' }}
      />
      {/* <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      /> */}
    </Tab.Navigator>
  );
}

export default function UserNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabs} />
      {/* Stack Screens (Detail/Form pages) */}
      <Stack.Screen
        name="UserServiceDetails"
        component={UserServiceDetailsScreen}
      />
      <Stack.Screen name="UserApplyForm" component={UserApplyFormScreen} />
      <Stack.Screen
        name="UserNotificationScreen"
        component={UserNotificationScreen}
      />
      <Stack.Screen
        name="UserRequestDetailed"
        component={UserRequestDetailedScreen}
      />
      <Stack.Screen
        name="MyAirBookings"
        component={MyAirBookings}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
      />
      <Stack.Screen
  name="TermsConditions"
  component={TermsConditionsScreen}
  options={{ title: 'Terms & Conditions' }}
/>
    </Stack.Navigator>
  );
}