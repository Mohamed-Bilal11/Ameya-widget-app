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
    color: '#467267',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#467267',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    textAlign: 'left',
  },
  typingIndicator: {
    fontSize: 14,
    color: '#467267',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default TranscriptionTextArea;
