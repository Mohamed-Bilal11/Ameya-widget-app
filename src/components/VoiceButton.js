import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, PermissionsAndroid ,StyleSheet,TextInput,TouchableOpacity, Text, PanResponder } from 'react-native';
import { startRecording, stopRecording } from '../services/Recorder';
import { transcribeAudio, detectIntent } from '../services/VoiceAPI';
import { useNavigation } from '@react-navigation/native';
import {voiceResponse} from '../data/voiceResponse'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpeechAPI from '../services/SpeechAPI';
import TranscriptionTextArea from './ui/TranscriptionTextArea';

export default function VoiceButton() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [transcription, setTranscription] = useState('');

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
    let text = '';
    if (typeof result === 'string') {
      text = result;
    } else if (result && result.value) {
      text = result.value;
    } else if (result && result.length > 0) {
      text = result[0];
    }
    if (!text) return;
    
    // Simply update transcription with the latest text
    setTranscription(text.trim());
    
    // Debug logging
    console.log('🎤 Speech recognized:', text);
  };

  const onSpeechErrorHandler = (error) => {
    setLoading(false);
    setRecording(false);
    console.log('Speech error:', error);
  };

  const handleNavigation = (text) => {
    console.log('🧭 Navigation called with text:', text);
    if (!text) {
      console.log('🧭 No text provided, navigating to Home');
      navigation.navigate('Home');
      // Reset text area after navigation
      setTranscription('');
      return;
    }
    
    const lower = text.toLowerCase();
    console.log('🧭 Processing text:', lower);
    
    if (lower.includes('food')) {
      console.log('🧭 Navigating to FoodLogs');
      navigation.navigate('FoodLogs');
    } else if (lower.includes('activity')) {
      console.log('🧭 Navigating to Activity');
      navigation.navigate('Activity');
    } else if (lower.includes('movement')) {
      console.log('🧭 Navigating to Movements');
      navigation.navigate('Movements');
    } else {
      console.log('🧭 Navigating to Home (default)');
      navigation.navigate('Home');
    }
    
    // Reset text area after navigation
    setTranscription('');
  };

  const onStartRecord = async () => {
    setLoading(true);
    setRecording(true);
    setTranscription(''); // Clear previous transcription
    await SpeechAPI.startListening();
  };

  const onStopRecord = async () => {
    console.log('🛑 Stopping recording, final transcription:', transcription);
    setLoading(false);
    setRecording(false);
    await SpeechAPI.stopListening();
    
    // Small delay to ensure final transcription is captured on Android
    setTimeout(() => {
      console.log('🛑 Final transcription after delay:', transcription);
      handleNavigation(transcription);
    }, 200);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.micButton, recording && styles.micButtonActive]}
        onPressIn={onStartRecord}
        onPressOut={onStopRecord}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#467267" />
        ) : (
          <Ionicons
            name={recording ? 'mic' : 'mic'}
            size={36}
            color={recording ? '#DB7670' : '#467267'}
          />
        )}
      </TouchableOpacity>
      
      <TranscriptionTextArea 
        transcription={transcription} 
        isLoading={loading || recording} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  transcriptionArea: {
    width: '100%',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
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
  micButtonActive: {
    backgroundColor: '#ffe6e6',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
