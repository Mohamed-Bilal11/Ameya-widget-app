import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, PermissionsAndroid ,StyleSheet,TextInput,TouchableOpacity, Text } from 'react-native';
import { startRecording, stopRecording } from '../services/Recorder';
import { transcribeAudio, detectIntent } from '../services/VoiceAPI';
import { useNavigation } from '@react-navigation/native';
import {voiceResponse} from '../data/voiceResponse'
import Voice from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceButton() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const navigation = useNavigation();
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResultsHandler;
    Voice.onSpeechError = onSpeechErrorHandler;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  const onSpeechResultsHandler = event => {
    const text = event.value[0];
    console.log('texssdast---', text)
    onStopRecord(text);
  };
  const onStartRecord = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.log('error---', error)
    }
  };
  const onStopRecord = async (text) => {
    try {
      await Voice.stop();
     // getFoodItemsForText(text);
      //setSearchText(text);
    } catch (error) {}
  };
  const onSpeechErrorHandler = event => {
    //
  };
  const askPermission = async () => {
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
  
      if (
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
       handlePress();
      } else {
        console.log('All required permissions not granted');
        return;
      }
    } catch (err) {
      console.warn(err);
      return;
    }
  }
  const handlePress = async () => {
    console.log('recording---',recording)
    // if (!recording) {
        
     // setRecording(true);
    //   await onStartRecord();
    // } else {
        
     // setRecording(false);
      setLoading(true);
      console.log('success123--')
      //const audioPath = await stopRecording();
      //console.log('audioPath---',audioPath)
      //const text = await transcribeAudio(audioPath);
      //const text = "Go to Activity page"
      
      const response = await detectIntent(search);
      //const response = voiceResponse;
      console.log('text---', response)
      //const responseText = response.choices[0].message.content;
      //console.log('textresp---', responseText)
      const { screen, filters } = JSON.parse(response);

      console.log('Screen:', screen);      // → "FoodLog"
      console.log('Filters:', filters); 
      //  console.log('resp---',response)
      if (screen == 'FoodLog') {
        navigation.navigate('FoodLogs');
      } else if (screen == 'Movements') {
        navigation.navigate('Movements');
      } else if (screen == 'Activity') {
        navigation.navigate('Activity');
      } else {
        navigation.navigate('Home');
      }

      setLoading(false);
    //}
  };

  return (
    // <View>
    //   <Button title={recording ? 'Stop' : 'Start Voice'} onPress={handlePress} />
    //   {loading && <ActivityIndicator />}
    // </View>
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter details here"
        value={search}
        onChangeText={setSearch}
      />
       {/* {search.length > 0 && (
      <TouchableOpacity style={{backgroundColor: "grey",display: 'flex',justifyContent: 'center',alignItems: 'center', padding: 3, borderRadius: 10}} onPress={() => setSearch('')}>
        <Text style={styles.clearIcon}>X</Text>
      </TouchableOpacity>
    )} */}
      {/* <TouchableOpacity onPress={onMicPress} style={styles.micButton}>
      💬
      </TouchableOpacity> */}
      {loading ? <ActivityIndicator /> : 
       <Button title={'Search'} onPress={handlePress} />
      }
    </View>
  );
  
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    bottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  micButton: {
    marginLeft: 10,
  },
  clearIcon: {
    //marginRight: 5,
    color: '#DB7670',
    fontSize: 15
  }
});
