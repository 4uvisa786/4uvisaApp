import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminServiceRequestScreen from '../screens/Admin/AdminServiceRequestScreen';
import AdminServiceRequestDetailsScreen from '../screens/Admin/AdminServiceRequestDetailsScreen';
import AdminProfileScreen from '../screens/Admin/AdminProfileScreen';
import AdminManageServicesScreen from '../screens/Admin/AdminManageServicesScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AdminManageUsersScreen from '../screens/Admin/AdminManageUsersScreen';
import AdminAirBookingRequest from '../screens/Admin/AdminAirBookingRequest';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Define a mapping of route names to their desired MaterialIcons names
const ICON_MAP = {
  Dashboard: 'dashboard',
  'Admin Services': 'inventory', // For managing the services (list of items/products)
  'Service Request': 'fact-check', // For handling pending tasks/requests
  Profile: 'person',
};

// Bottom Tabs
function AdminTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1976D2', // Example active color (a nice blue)
        tabBarInactiveTintColor: '#757575',
        tabBarIcon: ({ color, size }) => {
          const iconName = ICON_MAP[route.name] || 'settings'; // Default to 'settings' if not found
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Admin Services" component={AdminManageServicesScreen} />
      <Tab.Screen name="Service Request" component={AdminServiceRequestScreen} />
      <Tab.Screen name="User Management" component={AdminManageUsersScreen} />
      <Tab.Screen name="Air Bookings" component={AdminAirBookingRequest} /> 
      <Tab.Screen name="Profile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}

// ---
// Main Admin Navigator (with Tabs + Details)
export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AdminServiceRequestDetails" component={AdminServiceRequestDetailsScreen} />
    </Stack.Navigator>
  );
}