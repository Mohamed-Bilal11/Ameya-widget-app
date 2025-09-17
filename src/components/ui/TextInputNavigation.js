import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TextInputComponent from './TextInput';
import ActionButtons from './ActionButtons';
import { processTextNavigation } from '../../services/TextNavigationService';

const TextInputNavigation = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processTextNavigation(text.trim());
      console.log('🤖 Navigation Result:', result);
      
      // Navigate based on result
      if (result.screen) {
        navigation.navigate(result.screen);
        console.log('🧹 Clearing text input after navigation');
        setText(''); // Clear input after successful navigation
      } else {
        Alert.alert('Navigation', 'Could not determine navigation');
      }
    } catch (error) {
      console.error('Navigation Error:', error);
      Alert.alert('Error', 'Failed to process text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Text Navigation:</Text>
      
      <TextInputComponent
        value={text}
        onChangeText={setText}
        placeholder="Type your navigation request..."
        editable={!isProcessing}
        returnKeyType="done"
      />
      
      <ActionButtons
        onClear={handleClear}
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
        hasText={text.trim().length > 0}
      />
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
});

export default TextInputNavigation;
