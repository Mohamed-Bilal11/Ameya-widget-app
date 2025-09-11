import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

const { SpeechRecognizerModule } = NativeModules;
const speechEvents = new NativeEventEmitter(SpeechRecognizerModule);

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
    const hasPermission = await requestAudioPermission();
    if (hasPermission) {
      SpeechRecognizerModule.startListening();
    }
  },
  stopListening: () => SpeechRecognizerModule.stopListening(),
  addResultListener: (callback) => speechEvents.addListener('onSpeechResults', callback),
  addErrorListener: (callback) => speechEvents.addListener('onSpeechError', callback),
};