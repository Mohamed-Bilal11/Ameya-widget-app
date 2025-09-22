# iOS Speech Recognition Implementation

This document describes the implementation of speech recognition in your React Native app using iOS's SFSpeechRecognizer.

## Overview

The implementation includes:
- Native iOS module using SFSpeechRecognizer
- React Native bridge for JavaScript integration
- Updated SpeechAPI service with iOS support
- Example component demonstrating usage

## Files Added/Modified

### iOS Native Module
- `ios/AwesomeProject/SpeechRecognizerModule.swift` - Main Swift implementation
- `ios/AwesomeProject/SpeechRecognizerModule.m` - Objective-C bridge
- `ios/AwesomeProject/Info.plist` - Added microphone and speech recognition permissions

### JavaScript Interface
- `src/services/SpeechAPI.js` - Updated with iOS support
- `src/components/SpeechRecognitionExample.js` - Example usage component
- `src/screens/speech_test/SpeechTestScreen.tsx` - Test screen

## Features

### Speech Recognition Capabilities
- ✅ Real-time speech recognition
- ✅ Partial results (live transcription)
- ✅ Final results with confidence scores
- ✅ Error handling
- ✅ Permission management
- ✅ Start/stop listening control
- ✅ Event-based communication

### API Methods

#### `requestPermissions()`
Requests microphone and speech recognition permissions.

```javascript
const permissions = await SpeechAPI.requestPermissions();
```

#### `isAvailable()`
Checks if speech recognition is available on the device.

```javascript
const available = await SpeechAPI.isAvailable();
```

#### `startListening()`
Starts listening for speech input.

```javascript
const result = await SpeechAPI.startListening();
```

#### `stopListening()`
Stops listening for speech input.

```javascript
const result = await SpeechAPI.stopListening();
```

#### `isListening()`
Checks if currently listening.

```javascript
const listening = await SpeechAPI.isListening();
```

### Event Listeners

#### `addResultListener(callback)`
Listens for speech recognition results.

```javascript
const listener = SpeechAPI.addResultListener((result) => {
  console.log('Transcript:', result.transcript);
  console.log('Is Final:', result.isFinal);
  console.log('Confidence:', result.confidence);
});
```

#### `addErrorListener(callback)`
Listens for speech recognition errors.

```javascript
const listener = SpeechAPI.addErrorListener((error) => {
  console.error('Speech error:', error.error);
});
```

#### `addStartListener(callback)`
Listens for when speech recognition starts.

```javascript
const listener = SpeechAPI.addStartListener(() => {
  console.log('Speech recognition started');
});
```

#### `addEndListener(callback)`
Listens for when speech recognition ends.

```javascript
const listener = SpeechAPI.addEndListener(() => {
  console.log('Speech recognition ended');
});
```

## Setup Instructions

### 1. Build the iOS Project
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### 2. Grant Permissions
When you first run the app, iOS will prompt for:
- Microphone permission
- Speech recognition permission

### 3. Test the Implementation
You can test the speech recognition by:
1. Adding the `SpeechTestScreen` to your navigation
2. Using the `SpeechRecognitionExample` component
3. Integrating the `SpeechAPI` service directly

## Usage Example

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SpeechAPI from '../services/SpeechAPI';

const MyComponent = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Request permissions on mount
    SpeechAPI.requestPermissions();

    // Set up result listener
    const resultListener = SpeechAPI.addResultListener((result) => {
      setTranscript(result.transcript);
      if (result.isFinal) {
        setIsListening(false);
      }
    });

    // Set up error listener
    const errorListener = SpeechAPI.addErrorListener((error) => {
      console.error('Speech error:', error);
      setIsListening(false);
    });

    return () => {
      resultListener.remove();
      errorListener.remove();
    };
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      await SpeechAPI.stopListening();
    } else {
      await SpeechAPI.startListening();
    }
  };

  return (
    <View>
      <Text>{transcript}</Text>
      <TouchableOpacity onPress={toggleListening}>
        <Text>{isListening ? 'Stop' : 'Start'} Listening</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Important Notes

### iOS Requirements
- iOS 10.0+ required for SFSpeechRecognizer
- Device must have internet connection for speech recognition
- Microphone and speech recognition permissions must be granted

### Performance Considerations
- Speech recognition uses network resources
- Consider implementing timeout mechanisms
- Handle network connectivity issues gracefully

### Error Handling
The implementation includes comprehensive error handling for:
- Permission denials
- Network connectivity issues
- Audio session conflicts
- Speech recognition service unavailability

## Troubleshooting

### Common Issues

1. **"Speech recognition not available"**
   - Check internet connection
   - Verify iOS version (10.0+)
   - Ensure permissions are granted

2. **"Permission denied"**
   - Go to Settings > Privacy & Security > Microphone
   - Enable microphone access for your app
   - Go to Settings > Privacy & Security > Speech Recognition
   - Enable speech recognition for your app

3. **Audio session errors**
   - The app automatically handles audio session setup
   - If issues persist, check for conflicts with other audio apps

### Debug Information
Enable console logging to see detailed information about:
- Permission status
- Speech recognition availability
- Audio session setup
- Recognition results and errors

## Future Enhancements

Potential improvements:
- Language selection support
- Offline speech recognition (iOS 13+)
- Custom vocabulary support
- Audio file processing
- Multiple language detection
