import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * VoiceButtonDemo Component
 * 
 * A simple demo component showing the new click-to-start/click-to-stop behavior
 * for the microphone button.
 */
const VoiceButtonDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMicPress = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsLoading(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>🎤 Voice Input Demo</Text>
        <Text style={styles.description}>
          Click the microphone to start recording, then click it again to stop.
        </Text>
        
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && styles.micButtonActive
            ]}
            onPress={handleMicPress}
            disabled={isLoading}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color={isRecording ? '#DB7670' : '#467267'}
            />
          </TouchableOpacity>
          
          {isRecording && (
            <Text style={styles.recordingText}>
              🎤 Recording... Click the mic again to stop
            </Text>
          )}
          
          {isLoading && (
            <Text style={styles.processingText}>
              ⏳ Processing your speech...
            </Text>
          )}
        </View>
        
        <Text style={styles.instructionText}>
          {isRecording 
            ? 'Speak now, then click the mic again to stop'
            : isLoading 
            ? 'Processing your input...'
            : 'Click the microphone to start recording'
          }
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
  recordingText: {
    fontSize: 14,
    color: '#DB7670',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  processingText: {
    fontSize: 14,
    color: '#467267',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default VoiceButtonDemo;
