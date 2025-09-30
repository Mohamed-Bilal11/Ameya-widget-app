import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView, Keyboard} from 'react-native';
import {Text, TextInput, Button, Snackbar, Card} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules} from 'react-native';
import { useRoute } from '@react-navigation/native';
import BottomNavigation from '../../components/BottomNavigation';

type MovementData = {
  originalText: string;
  exercise: string | null;
  duration: number | null;
  intensity: string | null;
  distance: number | null;
  description: string | null;
  timestamp?: string;
};

type RouteParams = {
  movementData?: MovementData;
};

const {WidgetUpdater} = NativeModules;

const Movements = () => {
  const [exercise, setExercise] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [autoLogged, setAutoLogged] = useState(false);
  const route = useRoute();

  // Handle incoming movement data from navigation
  useEffect(() => {
    const movementData = (route.params as RouteParams)?.movementData;
    if (movementData && !autoLogged) {
      console.log('📊 Received movement data:', movementData);
      
      // Auto-populate the exercise field with extracted data
      if (movementData.description) {
        setExercise(movementData.description);
        
        // Auto-log the movement if it contains specific data
        if (movementData.exercise || movementData.duration) {
          setTimeout(() => {
            handleAutoLog(movementData);
          }, 1000); // Small delay to show the user what's happening
        }
      }
    }
  }, [(route.params as RouteParams)?.movementData, autoLogged]);

  const handleAutoLog = async (movementData: MovementData) => {
    try {
      console.log('🤖 Auto-logging movement data:', movementData);
      const message = `Hey! Log Movement: ${movementData.description}`;
      await AsyncStorage.setItem('lastMovement', movementData.description);
      await AsyncStorage.setItem('widget_text', message);
      await AsyncStorage.setItem('widget_type', 'movement');
      WidgetUpdater.updateWidget(message, 'movement');
      
      setAutoLogged(true);
      setSnackbarVisible(true);
      console.log('✅ Auto-logged movement:', movementData.description);
    } catch (error) {
      console.error('❌ Error auto-logging movement:', error);
    }
  };

  const logMovement = async () => {
    console.log('🏋️ Movement logging clicked');
    if (!exercise.trim()) {
      console.log('❌ No exercise text to log');
      return;
    }
    console.log('✅ Logging movement:', exercise);
    const message = `Hey! Log Movement: ${exercise}`;
    await AsyncStorage.setItem('lastMovement', exercise);
    await AsyncStorage.setItem('widget_text', message);
    await AsyncStorage.setItem('widget_type', 'movement');
    const test = await AsyncStorage.getItem('widget_type');
    console.log('🔍 Widget Type in AsyncStorage:', test);
    WidgetUpdater.updateWidget(message, 'movement');
    console.log('📱 Widget updated with message:', message);
    setExercise('');
    setSnackbarVisible(true);
    Keyboard.dismiss();
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>💪 Movements Log</Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Enter completed movement"
              value={exercise}
              onChangeText={setExercise}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  text: '#000000', // input text color
                  primary: '#1E88E5', // label + focused outline
                  placeholder: '#616161', // label color (unfocused)
                },
              }}
            />
            <Button
              mode="contained"
              onPress={logMovement}
              //disabled={!exercise.trim()}
              style={styles.button}
              buttonColor="#1E88E5"
              labelStyle={{color: '#FFFFFF', fontWeight: 'bold'}}>
              Log Movement
            </Button>
          </Card.Content>
        </Card>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}>
          {autoLogged ? 'Movement auto-logged! 🎉' : 'Movement logged! 🏋️'}
        </Snackbar>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default Movements;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    paddingBottom: 100, // Space for bottom navigation
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1565C0',
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
    backgroundColor: '#1E88E5',
  },
});
