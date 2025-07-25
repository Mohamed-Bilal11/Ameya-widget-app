import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../navigation/NavigationService';

import Home from '../screens/home/Home';
import FoodLog from '../screens/food_log/FoodLog';
import Movements from '../screens/movements/Movements';
import Activity from '../screens/activity/Activity';
import ChatHome from '../screens/chat_home/ChatHome.native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  useEffect(() => {
    // Optional: delay navigation if you’re using NativeModules (IntentLauncher)
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="FoodLogs" component={FoodLog} />
        <Stack.Screen name="Movements" component={Movements} />
        <Stack.Screen name="Activity" component={Activity} />
        <Stack.Screen name="ChatHome" component={ChatHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
