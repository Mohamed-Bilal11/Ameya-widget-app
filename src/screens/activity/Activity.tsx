import React, { useState } from 'react';
import {  StyleSheet, ScrollView, Keyboard } from 'react-native';
import { Text, TextInput, Button, Snackbar, Card, } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { WidgetUpdater } = NativeModules;

const Activity = () => {
  const [activity, setActivity] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const logActivity = async () => {
    if (!activity.trim()) return;
    console.log('clicked activity')
    const logMessage = `Hey! Log Movement.`;
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
        Activity logged! 💪
      </Snackbar>
    </ScrollView>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFE6E8',
    justifyContent: 'center',
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
