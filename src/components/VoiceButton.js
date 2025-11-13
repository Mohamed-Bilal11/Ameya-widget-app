import React, { useState, useEffect, useRef } from 'react';
import { View, Button, ActivityIndicator, PermissionsAndroid, Platform, StyleSheet,TextInput,TouchableOpacity, Text, PanResponder } from 'react-native';
import { detectIntent } from '../services/VoiceAPI';
import { useNavigation } from '@react-navigation/native';
import {voiceResponse} from '../data/voiceResponse'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpeechAPI from '../services/SpeechAPI';
import TranscriptionTextArea from './ui/TranscriptionTextArea';
import TextInputNavigation from './ui/TextInputNavigation';

export default function VoiceButton() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [transcription, setTranscription] = useState('');
  const currentTranscriptionRef = useRef('');

  const navigation = useNavigation();

  useEffect(() => {
    // Set up global callback as backup
    SpeechAPI.setGlobalSpeechResultCallback(onSpeechResultsHandler);
    
    // Add a small delay to ensure SpeechAPI is properly initialized
    const setupListeners = () => {
      console.log('🎤 VoiceButton: Setting up event listeners');
      const resultListener = SpeechAPI.addResultListener(onSpeechResultsHandler);
      const errorListener = SpeechAPI.addErrorListener(onSpeechErrorHandler);
      const startListener = SpeechAPI.addStartListener(() => {
        console.log('🎤 VoiceButton: Speech recognition started');
      });
      const endListener = SpeechAPI.addEndListener(() => {
        console.log('🎤 VoiceButton: Speech recognition ended');
      });
      
      console.log('🎤 VoiceButton: Event listeners set up:', {
        resultListener: !!resultListener,
        errorListener: !!errorListener,
        startListener: !!startListener,
        endListener: !!endListener
      });
      
      return () => {
        console.log('🎤 VoiceButton: Cleaning up event listeners');
        resultListener.remove();
        errorListener.remove();
        startListener.remove();
        endListener.remove();
      };
    };
    
    // Set up listeners after a short delay
    const timeoutId = setTimeout(setupListeners, 100);
    
    return () => {
      clearTimeout(timeoutId);
      SpeechAPI.setGlobalSpeechResultCallback(null);
    };
  }, []);

  const onSpeechResultsHandler = (result) => {
    console.log('🎤 VoiceButton: onSpeechResultsHandler called with:', result);
    
    let text = '';
    
    // Handle the new SpeechAPI format: { text: "Hello", isFinal: false }
    if (result && result.text) {
      text = result.text;
    } else if (typeof result === 'string') {
      text = result;
    } else if (result && result.value) {
      text = result.value;
    } else if (result && result.length > 0) {
      text = result[0];
    }
    
    if (!text) {
      console.log('🎤 VoiceButton: No text found in result, returning');
      return;
    }
    
   // console.log('🎤 VoiceButton: Received speech result:', text, 'isFinal:', result?.isFinal);
    
    // Simply update transcription with the latest result
    const newTranscription = text.trim();
    setTranscription(newTranscription);
    currentTranscriptionRef.current = newTranscription;
    
    // Debug logging
    console.log('🎤 VoiceButton: Updated transcription to:', newTranscription);
  };

  const onSpeechErrorHandler = (error) => {
    console.log('🎤 Speech error:', error);
    
    // Don't immediately stop - let the Android module handle retries
    // Only stop if it's a critical error
    if (error && (error.includes('not authorized') || error.includes('permission'))) {
      console.log('🎤 Critical error, stopping recording');
      setLoading(false);
      setRecording(false);
    } else {
      console.log('🎤 Non-critical error, continuing to listen');
    }
  };

  const handleNavigation = (text) => {
    console.log('🧭 Navigation called with text:', text);
    if (!text || text.trim() === '') {
      console.log('🧭 No text provided, navigating to Home');
      navigation.navigate('Home');
      setTranscription('');
      return;
    }
    
    const lower = text.toLowerCase().trim();
    console.log('🧭 Processing text:', lower);
    console.log('🧭 Text length:', lower.length);
    
    // Check for keywords with better detection (including variations and natural language)
    const hasFood = lower.includes('food') || lower.includes('meal') || lower.includes('eat') || lower.includes('diet') || 
                   lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('snack') ||
                   lower.includes('log food') || lower.includes('food log') || lower.includes('add food') || lower.includes('record food') ||
                   lower.includes('go to food') || lower.includes('show food') || lower.includes('food logs');
    
    const hasActivity = lower.includes('activity') || lower.includes('exercise') || lower.includes('workout') || lower.includes('fitness') ||
                       lower.includes('gym') || lower.includes('sport') || lower.includes('training') || lower.includes('cardio') ||
                       lower.includes('log activity') || lower.includes('activity log') || lower.includes('track activity') ||
                       lower.includes('go to activity') || lower.includes('show activity') || lower.includes('activities');
    
    const hasMovement = lower.includes('movement') || lower.includes('steps') || lower.includes('walk') || lower.includes('run') ||
                       lower.includes('jog') || lower.includes('hike') || lower.includes('travel') || lower.includes('distance') ||
                       lower.includes('moment') || lower.includes('moments') ||
                       lower.includes('log movement') || lower.includes('movement log') || lower.includes('track movement') || lower.includes('track steps') ||
                       lower.includes('track moment') || lower.includes('track moments') ||
                       lower.includes('go to movement') || lower.includes('show movement') || lower.includes('movements');
    
    const hasChat = lower.includes('chat') || lower.includes('talk') || lower.includes('conversation') || lower.includes('assistant') ||
                   lower.includes('help') || lower.includes('ask') || lower.includes('question') ||
                   lower.includes('go to chat') || lower.includes('show chat') || lower.includes('chat home');
    
    const hasHelp = lower.includes('what can i say') || lower.includes('voice commands') || lower.includes('available commands') ||
                   lower.includes('help me') || lower.includes('what commands') || lower.includes('show commands');
    
    console.log('🧭 Keyword detection:', {
      hasFood,
      hasActivity,
      hasMovement,
      hasChat,
      hasHelp,
      text: lower
    });
    
    if (hasHelp) {
      console.log('🧭 Showing voice commands help');
      // For now, just show in console - you could add a modal or alert here
      console.log('🎤 Available voice commands:');
      console.log('• "Go to food" or "Food logs" - Navigate to food tracking');
      console.log('• "Go to activity" or "Exercise" - Navigate to activity tracking');
      console.log('• "Go to movements" or "Steps" - Navigate to movement tracking');
      console.log('• "Go to chat" or "Help" - Navigate to chat assistant');
      console.log('• "Home" - Navigate to home screen');
    } else if (hasFood) {
      console.log('🧭 Navigating to FoodLogs');
      navigation.navigate('FoodLogs');
    } else if (hasActivity) {
      console.log('🧭 Navigating to Activity');
      navigation.navigate('Activity');
    } else if (hasMovement) {
      //console.log('🧭 Navigating to Movements');
      //console.log('🧭 Navigation object:', navigation);
      navigation.navigate('Movements');
      console.log('🧭 Navigation call completed');
    } else if (hasChat) {
      //console.log('🧭 Navigating to ChatHome');
      navigation.navigate('ChatHome');
    } else {
      console.log('🧭 No keywords found, navigating to Home (default)');
      navigation.navigate('Home');
    }
    
    // Reset text area after navigation
    console.log('🧹 Clearing transcription after navigation');
    setTranscription('');
  };

  const onStartRecord = async () => {
    console.log('🎤 VoiceButton: Starting recording...');
    setLoading(true);
    setRecording(true);
    setTranscription(''); // Clear previous transcription
    currentTranscriptionRef.current = ''; // Clear ref as well
    console.log('🧹 VoiceButton: Cleared transcription for new recording session');
    
    try {
      await SpeechAPI.startListening();
      console.log('🎤 VoiceButton: Speech recognition started successfully');
    } catch (error) {
      console.error('🎤 VoiceButton: Failed to start speech recognition:', error);
      setLoading(false);
      setRecording(false);
    }
  };

  const onStopRecord = async () => {
    console.log('🛑 VoiceButton: Stopping recording, final transcription:', currentTranscriptionRef.current);
    setLoading(false);
    setRecording(false);
    await SpeechAPI.stopListening();
    
    // Small delay to ensure final transcription is captured
    setTimeout(() => {
      const finalTranscription = currentTranscriptionRef.current;
      console.log('🛑 VoiceButton: Final transcription after delay:', finalTranscription);
      handleNavigation(finalTranscription);
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
      
      <TextInputNavigation />
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
