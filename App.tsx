import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import { LogBox, StatusBar } from 'react-native';
import GlobalSnackbar from './src/components/GlobalSnackbar';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaProvider>
        <RootNavigator />
        <GlobalSnackbar />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
