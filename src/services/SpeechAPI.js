import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

const { SpeechRecognizerModule } = NativeModules;

// Guard: Only create NativeEventEmitter if the module exists
let speechEvents;
if (SpeechRecognizerModule) {
  speechEvents = new NativeEventEmitter(SpeechRecognizerModule);
} else {
  // Dummy event emitter to avoid crash
  speechEvents = {
    addListener: () => ({ remove: () => {} })
  };
}

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
      if (hasPermission && SpeechRecognizerModule) {
        SpeechRecognizerModule.startListening();
      }
    } else if (SpeechRecognizerModule) {
      SpeechRecognizerModule.startListening();
    }
  },
  stopListening: () => {
    if (Platform.OS === 'android') {
      if (SpeechRecognizerModule) SpeechRecognizerModule.stopListening();
    } else if (SpeechRecognizerModule) {
      SpeechRecognizerModule.stopListening();
    }
  },
  addResultListener: (callback) => speechEvents.addListener('onSpeechResults', callback),
  addErrorListener: (callback) => speechEvents.addListener('onSpeechError', callback),
};