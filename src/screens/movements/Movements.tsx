import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView, Keyboard, View} from 'react-native';
import {Text, TextInput, Button, Snackbar, Card} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import BottomNavigation from '../../components/BottomNavigation';
import { completeCurrentScreen, getCurrentProgress } from '../../services/SequentialNavigationService';

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
  isMultiScreen?: boolean;
  sequenceIndex?: number;
  totalScreens?: number;
};

const {WidgetUpdater} = NativeModules;

const Movements = () => {
  const [exercise, setExercise] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [autoLogged, setAutoLogged] = useState(false);
  const [isMultiScreen, setIsMultiScreen] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  const route = useRoute();
  const navigation = useNavigation();

  // Handle incoming movement data from navigation
  useEffect(() => {
    const routeParams = route.params as RouteParams;
    const movementData = routeParams?.movementData;
    const isMultiScreenMode = routeParams?.isMultiScreen;
    const sequenceIndex = routeParams?.sequenceIndex;
    const totalScreens = routeParams?.totalScreens;
    
    if (isMultiScreenMode) {
      setIsMultiScreen(true);
      if (sequenceIndex !== undefined && totalScreens !== undefined) {
        setProgress({ current: sequenceIndex + 1, total: totalScreens });
      }
    }
    
    if (movementData && !autoLogged) {
      console.log('📊 Received movement data:', movementData);
      
      // Auto-populate the exercise field with extracted data
      if (movementData.description) {
        setExercise(movementData.description);
        
        // Auto-log the movement if it contains specific data
        if (movementData.exercise || movementData.duration) {
          setTimeout(() => {
            // Pass the multi-screen state directly to handleAutoLog
            handleAutoLog(movementData, isMultiScreenMode);
          }, 1000); // Small delay to show the user what's happening
        }
      }
    }
  }, [route.params, autoLogged]);

  const handleAutoLog = async (movementData: MovementData, isMultiScreenParam?: boolean) => {
    try {
      console.log('🤖 Auto-logging movement data:', movementData);
      const shouldAdvance = isMultiScreenParam !== undefined ? isMultiScreenParam : isMultiScreen;
      const message = `Hey! Log Movement: ${movementData.description}`;
      await AsyncStorage.setItem('lastMovement', movementData.description);
      await AsyncStorage.setItem('widget_text', message);
      await AsyncStorage.setItem('widget_type', 'movement');
      WidgetUpdater.updateWidget(message, 'movement');
      
      setAutoLogged(true);
      setSnackbarVisible(true);
      console.log('✅ Auto-logged movement:', movementData.description);
      
      // If this is part of a multi-screen sequence, move to next screen
      if (shouldAdvance) {
        await completeCurrentScreen(navigation, () => {
          console.log('💪 Movement logging completed, moving to next screen');
        });
      }
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
    
    // If this is part of a multi-screen sequence, move to next screen
    if (isMultiScreen) {
      await completeCurrentScreen(navigation, () => {
        console.log('💪 Movement logging completed, moving to next screen');
      });
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>💪 Movements Log</Text>
        
        {isMultiScreen && progress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              💪 Logging Movement ({progress.current}/{progress.total})
            </Text>
          </View>
        )}

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
  progressContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    textAlign: 'center',
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
