import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/NavigationService';

function App(): React.JSX.Element {
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log("🔗 URL Received:", url);
      if (!navigationRef.isReady()) return;

      if (url.includes('meal')) {
        navigationRef.navigate('FoodLogs');
      } else if (url.includes('movement')) {
        navigationRef.navigate('Movements');
      } else if (url.includes('activity')) {
        navigationRef.navigate('Activity');
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}

export default App;
