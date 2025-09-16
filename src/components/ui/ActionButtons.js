import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ActionButtons = ({ onClear, onSubmit, isProcessing, hasText }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.clearButton, isProcessing && styles.disabledButton]}
        onPress={onClear}
        disabled={isProcessing}
      >
        <Ionicons name="close-circle" size={20} color="#666" />
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.submitButton, 
          isProcessing && styles.disabledButton,
          !hasText && styles.disabledButton
        ]}
        onPress={onSubmit}
        disabled={isProcessing || !hasText}
      >
        <Ionicons 
          name={isProcessing ? "hourglass" : "send"} 
          size={20} 
          color="#fff" 
        />
        <Text style={styles.submitButtonText}>
          {isProcessing ? 'Processing...' : 'Navigate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#467267',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  submitButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ActionButtons;
