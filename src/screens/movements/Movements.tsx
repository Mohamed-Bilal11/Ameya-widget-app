import React, {useState} from 'react';
import {StyleSheet, ScrollView, Keyboard} from 'react-native';
import {Text, TextInput, Button, Snackbar, Card} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules} from 'react-native';

const {WidgetUpdater} = NativeModules;

const Movements = () => {
  const [exercise, setExercise] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const logMovement = async () => {
    console.log('clicked');
    if (!exercise.trim()) {
      return;
    }
    console.log('after return');
    const message = `Hey! Log your Food.`;
    await AsyncStorage.setItem('lastMovement', exercise);
    await AsyncStorage.setItem('widget_text', message);
    await AsyncStorage.setItem('widget_type', 'movement');
    const test = await AsyncStorage.getItem('widget_type');
    console.log('🔍 Widget Type in AsyncStorage:', test);
    WidgetUpdater.updateWidget(message, 'movement');
    console.log('message', message);
    setExercise('');
    setSnackbarVisible(true);
    Keyboard.dismiss();
  };

  return (
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
        Movement logged! 🏋️
      </Snackbar>
    </ScrollView>
  );
};

export default Movements;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
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
