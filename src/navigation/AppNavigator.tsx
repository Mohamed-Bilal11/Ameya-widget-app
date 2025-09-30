import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../navigation/NavigationService';

import Home from '../screens/home/Home';
import FoodLog from '../screens/food_log/FoodLog';
import Movements from '../screens/movements/Movements';
import Activity from '../screens/activity/Activity';
import MicInput from '../screens/mic_input/MicInput';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  useEffect(() => {
    // Optional: delay navigation if you’re using NativeModules (IntentLauncher)
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#E9F1E0',
          },
          headerTintColor: '#467267',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{
            headerShown: false, // Hide header for Home since we use SafeAreaView
          }}
        />
        <Stack.Screen 
          name="FoodLogs" 
          component={FoodLog} 
          options={{
            title: '🍽️ Food Logs',
          }}
        />
        <Stack.Screen 
          name="Movements" 
          component={Movements} 
          options={{
            title: '🧘 Movements',
          }}
        />
        <Stack.Screen 
          name="Activity" 
          component={Activity} 
          options={{
            title: '🚶 Activity',
          }}
        />
        <Stack.Screen 
          name="MicInput" 
          component={MicInput} 
          options={{
            title: '🎤 Voice & Text Input',
            headerShown: false, // Hide header for full-screen experience
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
