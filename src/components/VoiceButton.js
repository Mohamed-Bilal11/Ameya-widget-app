import React, { useState, useEffect, useRef } from 'react';
import { View, Button, ActivityIndicator, PermissionsAndroid, Platform, StyleSheet,TextInput,TouchableOpacity, Text, PanResponder } from 'react-native';
import { detectIntent } from '../services/VoiceAPI';
import { useNavigation } from '@react-navigation/native';
import {voiceResponse} from '../data/voiceResponse'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpeechAPI from '../services/SpeechAPI';
import TranscriptionTextArea from './ui/TranscriptionTextArea';
import TextInputNavigation from './ui/TextInputNavigation';
import { extractActivityData, isActivityRelated } from '../services/ActivityDataExtractor';
import { extractFoodData, isFoodRelated } from '../services/FoodDataExtractor';
import { extractMovementData, isMovementRelated } from '../services/MovementDataExtractor';

export default function VoiceButton({ onTranscriptionChange, onRecordingChange, onLoadingChange }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [transcription, setTranscription] = useState('');
  const currentTranscriptionRef = useRef('');
  const lastClickTime = useRef(0);
  const lastResultTime = useRef(0);
  const resultCountRef = useRef(0);
  const lastResultTextRef = useRef('');

  // Debug logging for state changes
  useEffect(() => {
    console.log('🎤 VoiceButton: Loading state changed to:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('🎤 VoiceButton: Recording state changed to:', recording);
  }, [recording]);

  const navigation = useNavigation();

  // Notify parent component of state changes
  useEffect(() => {
    if (onTranscriptionChange) {
      onTranscriptionChange(transcription);
    }
  }, [transcription, onTranscriptionChange]);

  useEffect(() => {
    if (onRecordingChange) {
      onRecordingChange(recording);
    }
  }, [recording, onRecordingChange]);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

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
    const now = Date.now();
    const timeSinceLastResult = now - lastResultTime.current;
    
    // More aggressive debouncing: ignore results that come too quickly (less than 500ms apart)
    if (timeSinceLastResult < 500) {
      console.log('🎤 VoiceButton: Result too soon, debouncing');
      return;
    }
    
    lastResultTime.current = now;
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
    
    // Only process if we have meaningful text (not empty or just whitespace)
    if (!text || text.trim() === '') {
      console.log('🎤 VoiceButton: Empty or whitespace text, ignoring');
      return;
    }
    
    const newTranscription = text.trim();
    
    // Check if this is the same result as the last one
    if (newTranscription === lastResultTextRef.current) {
      resultCountRef.current += 1;
      console.log('🎤 VoiceButton: Same result repeated', resultCountRef.current, 'times');
      
      // If we've seen the same result more than 5 times, stop the recognition
      if (resultCountRef.current > 5) {
        console.log('🎤 VoiceButton: Too many repeated results, stopping recognition');
        if (recording) {
          onStopRecord();
        }
        return;
      }
    } else {
      // New result, reset counter
      resultCountRef.current = 1;
      lastResultTextRef.current = newTranscription;
    }
    
    console.log('🎤 VoiceButton: Received speech result:', text, 'isFinal:', result?.isFinal);
    
    // Only update if we have new meaningful content
    if (newTranscription !== currentTranscriptionRef.current) {
      setTranscription(newTranscription);
      currentTranscriptionRef.current = newTranscription;
      
      if (result?.isFinal) {
        console.log('🎤 VoiceButton: Final transcription:', newTranscription);
      } else {
        console.log('🎤 VoiceButton: Partial transcription:', newTranscription);
      }
    }
    
    // If this is a final result, stop the speech recognition to prevent infinite loops
    if (result?.isFinal) {
      console.log('🎤 VoiceButton: Final result received, stopping speech recognition');
      setTimeout(() => {
        if (recording) {
          onStopRecord();
        }
      }, 1000); // Give a small delay to allow the result to be processed
    }
  };

  const onSpeechErrorHandler = (error) => {
    console.log('🎤 Speech error:', error);
    
    // Stop recording on any error
    setRecording(false);
    setLoading(false);
    
    // Don't immediately stop - let the Android module handle retries
    // Only stop if it's a critical error
    if (error && (error.includes('not authorized') || error.includes('permission'))) {
      console.log('🎤 Critical error, stopping recording');
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
    
    // Use screen-specific data extractors and navigation
    const isFood = isFoodRelated(text);
    const isMovement = isMovementRelated(text);
    const isActivity = isActivityRelated(text);
    
    
    const hasHelp = lower.includes('what can i say') || lower.includes('voice commands') || lower.includes('available commands') ||
                   lower.includes('help me') || lower.includes('what commands') || lower.includes('show commands');
    
    console.log('🧭 Screen-specific detection:', {
      isFood,
      isMovement,
      isActivity,
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
      console.log('• "Home" - Navigate to home screen');
    } else if (isFood) {
      console.log('🧭 Food-related text detected, navigating to FoodLogs');
      const foodData = extractFoodData(text);
      navigation.navigate('FoodLogs', { foodData: foodData });
    } else if (isMovement) {
      console.log('🧭 Movement-related text detected, navigating to Movements');
      const movementData = extractMovementData(text);
      navigation.navigate('Movements', { movementData: movementData });
    } else if (isActivity) {
      console.log('🧭 Activity-related text detected, navigating to Activity');
      const activityData = extractActivityData(text);
      navigation.navigate('Activity', { activityData: activityData });
    } else {
      console.log('🧭 No keywords found, navigating to Home (default)');
      navigation.navigate('Home');
    }
    
    // Don't clear transcription immediately - let user see what was transcribed
    console.log('🧭 Navigation completed, keeping transcription visible');
  };


  const onStartRecord = async () => {
    console.log('🎤 VoiceButton: Starting recording...');
    setRecording(true);
    setLoading(false); // Don't show loading, just start recording
    console.log('🎤 VoiceButton: Starting new recording session');
    
    // Reset counters for new recording session
    resultCountRef.current = 0;
    lastResultTextRef.current = '';
    lastResultTime.current = 0;
    
    try {
      await SpeechAPI.startListening();
      console.log('🎤 VoiceButton: Speech recognition started successfully');
      
      // Set a timeout to automatically stop recording after 30 seconds
      setTimeout(() => {
        if (recording) {
          console.log('🎤 VoiceButton: Auto-stopping recording after timeout');
          onStopRecord();
        }
      }, 30000);
      
    } catch (error) {
      console.error('🎤 VoiceButton: Failed to start speech recognition:', error);
      setRecording(false);
    }
  };

  const onStopRecord = async () => {
    console.log('🛑 VoiceButton: Stopping recording, final transcription:', currentTranscriptionRef.current);
    
    // Stop the recording state immediately to prevent multiple clicks
    setRecording(false);
    setLoading(false);
    
    try {
      await SpeechAPI.stopListening();
      console.log('🛑 VoiceButton: Speech recognition stopped successfully');
    } catch (error) {
      console.error('🛑 VoiceButton: Error stopping speech recognition:', error);
    }
    
    // Process navigation immediately without delay
    const finalTranscription = currentTranscriptionRef.current;
    console.log('🛑 VoiceButton: Processing final transcription:', finalTranscription);
    handleNavigation(finalTranscription);
  };

  const handleMicPress = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    
    // Prevent rapid clicking (debounce)
    if (timeSinceLastClick < 500) {
      console.log('🎤 VoiceButton: Click too soon, ignoring');
      return;
    }
    
    lastClickTime.current = now;
    console.log('🎤 VoiceButton: Mic pressed, current recording state:', recording);
    
    // Only start recording if not already recording
    if (!recording) {
      console.log('🎤 VoiceButton: Not recording, starting...');
      onStartRecord();
    }
  };

  const handleCancelRecording = async () => {
    console.log('❌ VoiceButton: Canceling recording');
    setRecording(false);
    setLoading(false);
    setTranscription('');
    currentTranscriptionRef.current = '';
    
    try {
      await SpeechAPI.stopListening();
      console.log('❌ VoiceButton: Recording canceled successfully');
    } catch (error) {
      console.error('❌ VoiceButton: Error canceling recording:', error);
    }
  };

  const clearTranscription = () => {
    console.log('🧹 VoiceButton: Clearing transcription');
    setTranscription('');
    currentTranscriptionRef.current = '';
  };

  return (
    <View style={styles.container}>
      {/* Centered Microphone Button */}
      <View style={styles.micContainer}>
        <TouchableOpacity
          style={[styles.micButton, recording && styles.micButtonActive]}
          onPress={handleMicPress}
          activeOpacity={0.7}
          disabled={recording}
        >
          <Ionicons
            name="mic"
            size={36}
            color="#E1BEE7"
          />
        </TouchableOpacity>
        
        {recording && (
          <Text style={styles.recordingText}>
            🎤 Recording... Use buttons below to stop or cancel
          </Text>
        )}
      </View>
      
      {/* Stop and Cancel Buttons - Only show when recording */}
      {recording && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={onStopRecord}
            activeOpacity={0.7}
          >
            <Ionicons name="stop" size={20} color="#FFFFFF" />
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRecording}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Clear Button - Show when not recording and has transcription */}
      {!recording && transcription && (
        <View style={styles.clearButtonContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearTranscription}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    height: 200,
  },
  micContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
    backgroundColor: '#7B1FA2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: '#E1BEE7',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  recordingText: {
    fontSize: 14,
    color: '#E1BEE7',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  clearButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
