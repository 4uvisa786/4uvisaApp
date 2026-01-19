import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import SuperAdminNavigator from './SuperAdminNavigator';
import SplashScreen from '../screens/SplashScreen';
import { useDispatch } from 'react-redux';
import { loadUserFromStorage } from '../redux/slices/authSlice';
import { fetchServiceScrollSpeed } from '../redux/slices/uiSlice';
import PublicNavigator from './PublicNavigator';


export default function RootNavigator() {
  const dispatch = useDispatch();
  const { user, loading, loadUserFromStorageLoading } = useSelector(state => state.auth);

    useEffect(() => {
    dispatch(loadUserFromStorage());
    dispatch(fetchServiceScrollSpeed());
  }, [dispatch]);

  if (loading || loadUserFromStorageLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {user ? (
        user?.role === 'admin' ? (
          <AdminNavigator />
        ) :
        user?.role === 'superadmin' ? (
          <SuperAdminNavigator />
        )
        : (
          <UserNavigator />
        )
      ) : (
        <PublicNavigator />
      )}
    </NavigationContainer>
  );
}
