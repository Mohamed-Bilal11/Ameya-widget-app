import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, PermissionsAndroid ,StyleSheet,TextInput,TouchableOpacity, Text } from 'react-native';
import { startRecording, stopRecording } from '../services/Recorder';
import { transcribeAudio, detectIntent } from '../services/VoiceAPI';
import { useNavigation } from '@react-navigation/native';
import {voiceResponse} from '../data/voiceResponse'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpeechAPI from '../services/SpeechAPI';

export default function VoiceButton() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const resultListener = SpeechAPI.addResultListener(onSpeechResultsHandler);
    const errorListener = SpeechAPI.addErrorListener(onSpeechErrorHandler);
    return () => {
      resultListener.remove();
      errorListener.remove();
    };
  }, []);

  const onSpeechResultsHandler = (result) => {
    setLoading(false);
    setRecording(false);
    let text = '';
    if (typeof result === 'string') {
      text = result;
    } else if (result && result.value) {
      text = result.value;
    } else if (result && result.length > 0) {
      text = result[0];
    }
    if (!text) return;
    // Navigation logic based on recognized text
    const lower = text.toLowerCase();
    if (lower.includes('food')) {
      navigation.navigate('FoodLogs');
    } else if (lower.includes('activity')) {
      navigation.navigate('Activity');
    } else if (lower.includes('movement')) {
      navigation.navigate('Movements');
    } else {
      navigation.navigate('Home');
    }
  };

  const onSpeechErrorHandler = (error) => {
    setLoading(false);
    setRecording(false);
    console.log('Speech error:', error);
  };

  const onStartRecord = async () => {
    setLoading(true);
    setRecording(true);
    await SpeechAPI.startListening();
  };

  const onStopRecord = async () => {
    setLoading(false);
    setRecording(false);
    await SpeechAPI.stopListening();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity
          style={styles.micButton}
          onPress={recording ? onStopRecord : onStartRecord}
          activeOpacity={0.7}
        >
          <Ionicons
            name={recording ? 'mic-off' : 'mic'}
            size={36}
            color={recording ? '#DB7670' : '#467267'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
});
