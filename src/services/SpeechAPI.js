import { Platform, PermissionsAndroid, NativeModules, NativeEventEmitter } from 'react-native';

const { SpeechRecognizer } = NativeModules;

// Event emitter for iOS speech recognition events
const speechEventEmitter = Platform.OS === 'ios' ? new NativeEventEmitter(SpeechRecognizer) : null;

// Global callback for speech results (to avoid event emitter issues)
let globalSpeechResultCallback = null;

console.log('🎤 SpeechAPI initialized:');
console.log('🎤 Platform:', Platform.OS);
console.log('🎤 SpeechRecognizer module:', SpeechRecognizer);
console.log('🎤 SpeechEventEmitter:', speechEventEmitter);

const requestAudioPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'This app needs access to your microphone for speech recognition.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const requestIOSPermissions = async () => {
  if (Platform.OS === 'ios' && SpeechRecognizer) {
    try {
      const result = await SpeechRecognizer.requestPermissions();
      return result;
    } catch (error) {
      console.error('iOS permission request failed:', error);
      throw error;
    }
  } else if (Platform.OS === 'ios' && !SpeechRecognizer) {
    console.error('SpeechRecognizer is not available. Make sure the native module is properly linked.');
    throw new Error('SpeechRecognizer is not available');
  }
  return null;
};

export default {
  // Set global callback for speech results
  setGlobalSpeechResultCallback: (callback) => {
    globalSpeechResultCallback = callback;
    console.log('🎤 Global speech result callback set:', !!callback);
  },

  // Request permissions for speech recognition
  requestPermissions: async () => {
    if (Platform.OS === 'android') {
      return await requestAudioPermission();
    } else if (Platform.OS === 'ios') {
      return await requestIOSPermissions();
    }
    return false;
  },

  // Check if speech recognition is available
  isAvailable: async () => {
    if (Platform.OS === 'ios' && SpeechRecognizer) {
      try {
        const result = await SpeechRecognizer.isAvailable();
        return result;
      } catch (error) {
        console.error('Error checking iOS speech availability:', error);
        return false;
      }
    }
    return false;
  },

  // Start listening for speech
  startListening: async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await requestAudioPermission();
      if (hasPermission) {
        // Android speech recognition implementation would go here
        console.log('Android speech recognition not implemented');
        return { status: 'not_implemented' };
      }
      return { status: 'permission_denied' };
    } else if (Platform.OS === 'ios' && SpeechRecognizer) {
      try {
        // First ensure permissions are granted
        const hasPermission = await SpeechRecognizer.requestPermissions();
        if (!hasPermission) {
          throw new Error('Speech recognition permission not granted');
        }
        
        const result = await SpeechRecognizer.startListening();
        return result;
      } catch (error) {
        console.error('iOS speech recognition start failed:', error);
        throw error;
      }
    }
    return { status: 'not_available' };
  },

  // Stop listening for speech
  stopListening: async () => {
    if (Platform.OS === 'ios' && SpeechRecognizer) {
      try {
        const result = await SpeechRecognizer.stopListening();
        return result;
      } catch (error) {
        console.error('iOS speech recognition stop failed:', error);
        throw error;
      }
    }
    console.log('Speech recognition not available');
    return { status: 'not_available' };
  },

  // Check if currently listening
  isListening: async () => {
    if (Platform.OS === 'ios' && SpeechRecognizer) {
      try {
        const result = await SpeechRecognizer.isListening();
        return result;
      } catch (error) {
        console.error('Error checking iOS listening status:', error);
        return false;
      }
    }
    return false;
  },

  // Add listener for speech recognition results
  addResultListener: (callback) => {
    console.log('🎤 Adding result listener, Platform:', Platform.OS, 'speechEventEmitter:', !!speechEventEmitter);
    if (Platform.OS === 'ios' && speechEventEmitter) {
      const subscription = speechEventEmitter.addListener('onSpeechResult', (result) => {
        console.log('🎤 Result listener callback triggered:', result);
        callback(result);
        // Also call global callback if set
        if (globalSpeechResultCallback) {
          console.log('🎤 Calling global speech result callback');
          globalSpeechResultCallback(result);
        }
      });
      console.log('🎤 Result listener added successfully');
      return {
        remove: () => subscription.remove()
      };
    }
    // Return dummy listener for other platforms
    return { remove: () => {} };
  },

  // Add listener for speech recognition errors
  addErrorListener: (callback) => {
    if (Platform.OS === 'ios' && speechEventEmitter) {
      const subscription = speechEventEmitter.addListener('onSpeechError', callback);
      return {
        remove: () => subscription.remove()
      };
    }
    // Return dummy listener for other platforms
    return { remove: () => {} };
  },

  // Add listener for speech recognition start
  addStartListener: (callback) => {
    console.log('🎤 Adding start listener');
    if (Platform.OS === 'ios' && speechEventEmitter) {
      const subscription = speechEventEmitter.addListener('onSpeechStart', (data) => {
        console.log('🎤 Start listener callback triggered:', data);
        callback(data);
      });
      return {
        remove: () => subscription.remove()
      };
    }
    // Return dummy listener for other platforms
    return { remove: () => {} };
  },

  // Add listener for speech recognition end
  addEndListener: (callback) => {
    console.log('🎤 Adding end listener');
    if (Platform.OS === 'ios' && speechEventEmitter) {
      const subscription = speechEventEmitter.addListener('onSpeechEnd', (data) => {
        console.log('🎤 End listener callback triggered:', data);
        callback(data);
      });
      return {
        remove: () => subscription.remove()
      };
    }
    // Return dummy listener for other platforms
    return { remove: () => {} };
  },
};