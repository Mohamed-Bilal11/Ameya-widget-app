import { Platform, PermissionsAndroid } from 'react-native';

// No native speech recognition module available

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

export default {
  startListening: async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await requestAudioPermission();
      if (hasPermission) {
        // Android speech recognition implementation would go here
        console.log('Android speech recognition not implemented');
      }
    } else {
      // iOS speech recognition removed
      console.log('iOS speech recognition not available');
    }
  },
  stopListening: () => {
    // Speech recognition not available
    console.log('Speech recognition not available');
  },
  addResultListener: (callback) => {
    // Return dummy listener
    return { remove: () => {} };
  },
  addErrorListener: (callback) => {
    // Return dummy listener
    return { remove: () => {} };
  },
};