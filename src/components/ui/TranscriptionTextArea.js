import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TranscriptionTextArea = ({ transcription, isLoading }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Transcription:</Text>
      <View style={styles.textArea}>
        <Text style={styles.text}>
          {transcription || (isLoading ? 'Start speaking...' : 'No speech detected yet')}
        </Text>
        {isLoading && transcription && (
          <Text style={styles.typingIndicator}>Listening...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8EAF6',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#1A1B2E',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#7B1FA2',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#E8EAF6',
    lineHeight: 22,
    textAlign: 'left',
  },
  typingIndicator: {
    fontSize: 14,
    color: '#B39DDB',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default TranscriptionTextArea;
