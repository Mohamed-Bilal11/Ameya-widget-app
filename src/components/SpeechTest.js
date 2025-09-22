import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeModules } from 'react-native';

const SpeechTest = () => {
  const [moduleStatus, setModuleStatus] = useState('Checking...');

  useEffect(() => {
    // Check if the module is available
    const { SpeechRecognizerModule } = NativeModules;
    
    if (SpeechRecognizerModule) {
      setModuleStatus('✅ SpeechRecognizerModule is available');
      console.log('SpeechRecognizerModule methods:', Object.keys(SpeechRecognizerModule));
    } else {
      setModuleStatus('❌ SpeechRecognizerModule is NOT available');
      console.log('Available NativeModules:', Object.keys(NativeModules));
    }
  }, []);

  const testModule = async () => {
    const { SpeechRecognizerModule } = NativeModules;
    
    if (!SpeechRecognizerModule) {
      Alert.alert('Error', 'SpeechRecognizerModule is not available');
      return;
    }

    try {
      // Test if the module has the expected methods
      const methods = Object.keys(SpeechRecognizerModule);
      Alert.alert('Success', `Module has methods: ${methods.join(', ')}`);
    } catch (error) {
      Alert.alert('Error', `Failed to test module: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech Module Test</Text>
      <Text style={styles.status}>{moduleStatus}</Text>
      
      <TouchableOpacity style={styles.button} onPress={testModule}>
        <Text style={styles.buttonText}>Test Module</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpeechTest;
