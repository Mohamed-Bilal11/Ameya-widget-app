import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, PermissionsAndroid ,StyleSheet,TextInput,TouchableOpacity, Text, PanResponder } from 'react-native';
import { startRecording, stopRecording } from '../services/Recorder';
import { transcribeAudio, detectIntent } from '../services/VoiceAPI';
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
    
    console.log('🎤 Received speech result:', text);
    
    // Accumulate transcription text with previous text
    setTranscription(prevText => {
      const newText = text.trim();
      
      // If this is the first text
      if (!prevText) {
        return newText;
      }
      
      // If the new text contains the previous text (refinement), use the new text
      if (newText.toLowerCase().includes(prevText.toLowerCase())) {
        return newText;
      }
      
      // If the new text is shorter than previous (partial result), keep previous
      if (newText.length < prevText.length) {
        return prevText;
      }
      
      // If the new text is a single word and previous text ends with a similar word, replace it
      const prevWords = prevText.toLowerCase().split(' ');
      const newWords = newText.toLowerCase().split(' ');
      
      if (newWords.length === 1 && prevWords.length > 1) {
        const lastWord = prevWords[prevWords.length - 1];
        const newWord = newWords[0];
        
        // If the new word is similar to the last word (like "moment" -> "movements")
        if (newWord.includes(lastWord) || lastWord.includes(newWord) || 
            (newWord.length > lastWord.length && newWord.startsWith(lastWord))) {
          const updatedWords = [...prevWords];
          updatedWords[updatedWords.length - 1] = newWord;
          return updatedWords.join(' ');
        }
      }
      
      // If it's a continuation or new phrase, append it
      if (!prevText.toLowerCase().includes(newText.toLowerCase())) {
        return prevText + ' ' + newText;
      }
      
      // Default: use the new text
      return newText;
    });
    
    // Debug logging
    console.log('🎤 Speech recognized:', text);
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
                   lower.includes('log food') || lower.includes('food log') || lower.includes('add food') || lower.includes('record food');
    
    const hasActivity = lower.includes('activity') || lower.includes('exercise') || lower.includes('workout') || lower.includes('fitness') ||
                       lower.includes('gym') || lower.includes('sport') || lower.includes('training') || lower.includes('cardio') ||
                       lower.includes('log activity') || lower.includes('activity log') || lower.includes('track activity');
    
    const hasMovement = lower.includes('movement') || lower.includes('steps') || lower.includes('walk') || lower.includes('run') ||
                       lower.includes('jog') || lower.includes('hike') || lower.includes('travel') || lower.includes('distance') ||
                       lower.includes('moment') || lower.includes('moments') ||
                       lower.includes('log movement') || lower.includes('movement log') || lower.includes('track movement') || lower.includes('track steps') ||
                       lower.includes('track moment') || lower.includes('track moments');
    
    console.log('🧭 Keyword detection:', {
      hasFood,
      hasActivity,
      hasMovement,
      text: lower
    });
    
    if (hasFood) {
      console.log('🧭 Navigating to FoodLogs');
      navigation.navigate('FoodLogs');
    } else if (hasActivity) {
      console.log('🧭 Navigating to Activity');
      navigation.navigate('Activity');
    } else if (hasMovement) {
      console.log('🧭 Navigating to Movements');
      console.log('🧭 Navigation object:', navigation);
      navigation.navigate('Movements');
      console.log('🧭 Navigation call completed');
    } else {
      console.log('🧭 No keywords found, navigating to Home (default)');
      navigation.navigate('Home');
    }
    
    // Reset text area after navigation
    console.log('🧹 Clearing transcription after navigation');
    setTranscription('');
  };

  const onStartRecord = async () => {
    console.log('🎤 Starting recording...');
    setLoading(true);
    setRecording(true);
    setTranscription(''); // Clear previous transcription
    console.log('🧹 Cleared transcription for new recording session');
    
    try {
      await SpeechAPI.startListening();
      console.log('🎤 Speech recognition started successfully');
    } catch (error) {
      console.error('🎤 Failed to start speech recognition:', error);
      setLoading(false);
      setRecording(false);
    }
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
