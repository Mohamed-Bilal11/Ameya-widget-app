import React from 'react';
import { View, TextInput, StyleSheet, Keyboard } from 'react-native';

const TextInputComponent = ({ value, onChangeText, placeholder, editable = true, multiline = true, returnKeyType = 'done' }) => {
  const onSubmitEditing = () => {
    if(returnKeyType === 'done') {
      Keyboard.dismiss();
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.textInput, !editable && styles.disabledInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={3}
        editable={editable}
        textAlignVertical="top"
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 12,
    borderColor: '#467267',
    borderRadius:8,
  },
  textInput: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    minHeight: 80,
    maxHeight: 120,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: '#f1f3f4',
  },
});

export default TextInputComponent;
