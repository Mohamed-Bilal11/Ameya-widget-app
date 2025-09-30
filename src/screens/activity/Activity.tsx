import React, { useState, useEffect } from 'react';
import {  StyleSheet, ScrollView, Keyboard } from 'react-native';
import { Text, TextInput, Button, Snackbar, Card, } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import { useRoute } from '@react-navigation/native';
import BottomNavigation from '../../components/BottomNavigation';

type ActivityData = {
  originalText: string;
  type: string | null;
  value: number | null;
  unit: string | null;
  description: string | null;
  timestamp?: string;
};

type RouteParams = {
  activityData?: ActivityData;
};

const { WidgetUpdater } = NativeModules;

const Activity = () => {
  const [activity, setActivity] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [autoLogged, setAutoLogged] = useState(false);
  const route = useRoute();

  // Handle incoming activity data from navigation
  useEffect(() => {
    const activityData = (route.params as RouteParams)?.activityData;
    if (activityData && !autoLogged) {
      console.log('📊 Received activity data:', activityData);
      
      // Auto-populate the activity field with extracted data
      if (activityData.description) {
        setActivity(activityData.description);
        
        // Auto-log the activity if it contains specific data
        if (activityData.type && activityData.value) {
          setTimeout(() => {
            handleAutoLog(activityData);
          }, 1000); // Small delay to show the user what's happening
        }
      }
    }
  }, [(route.params as RouteParams)?.activityData, autoLogged]);

  const handleAutoLog = async (activityData: ActivityData) => {
    try {
      const logMessage = `Hey! Log Activity: ${activityData.description}`;
      await AsyncStorage.setItem('lastActivity', activityData.description);
      await AsyncStorage.setItem('widget_text', logMessage); 
      await AsyncStorage.setItem('widget_type', 'activity'); 
      WidgetUpdater.updateWidget(logMessage, 'activity');
      
      setAutoLogged(true);
      setSnackbarVisible(true);
      console.log('✅ Auto-logged activity:', activityData.description);
    } catch (error) {
      console.error('❌ Error auto-logging activity:', error);
    }
  };

  const logActivity = async () => {
    if (!activity.trim()) return;
    console.log('clicked activity')
    const logMessage = `Hey! Log Activity: ${activity}`;
    await AsyncStorage.setItem('lastActivity', activity);
    await AsyncStorage.setItem('widget_text', logMessage); 
    await AsyncStorage.setItem('widget_type', 'activity'); 
    WidgetUpdater.updateWidget(logMessage,'activity');
    console.log('log Message')

    setActivity('');
    setSnackbarVisible(true);
    Keyboard.dismiss();
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🏃‍♂️ Activity Tracker</Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="What did you do?"
              value={activity}
              mode="outlined"
              onChangeText={setActivity}
              style={styles.input}
              theme={{
                colors: {
                  text: '#000000', // input text color
                  primary: '#DB7670', // label + focused outline
                  placeholder: '#616161', // label color (unfocused)
                },
              }}
            />
            <Button
              mode="contained"
              onPress={logActivity}
              disabled={!activity.trim()}
              style={styles.button}
              buttonColor="#DB7670"
              labelStyle={{color: '#FFFFFF', fontWeight: 'bold'}}>
              Log Activity
            </Button>
          </Card.Content>
        </Card>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}
        >
          {autoLogged ? 'Activity auto-logged! 🎉' : 'Activity logged! 💪'}
        </Snackbar>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFE6E8',
    justifyContent: 'center',
    paddingBottom: 100, // Space for bottom navigation
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#DB7670',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 8,
  },
  snackbar: {
    backgroundColor: '#43A047',
  },
});
