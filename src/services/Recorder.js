import { useState } from 'react';
// import AudioRecorderPlayer, {
//     AudioEncoderAndroidType,
//     AudioSourceAndroidType,
//     AVEncoderAudioQualityIOSType,
//     AVEncodingOption,
//     RecordBackType,
//     PlayBackType,
//   } from 'react-native-audio-recorder-player';
import { requestPermissions } from 'react-native-nitro-modules';
import { Platform, Alert } from 'react-native';
import Voice from '@react-native-voice/voice';
import React, {Component} from 'react';
  


// export async function startRecording() {
//   return await recorder.startRecorder();
// }

// export async function stopRecording() {
//   return await recorder.stopRecorder();
// }

// Recording

export async function startRecording() {
    
    // Set up recording progress listener
    // try{
    //   const audioRecorderPlayer = new AudioRecorderPlayer();
    //   const result = await audioRecorderPlayer.startRecorder();
    //   console.log('Recording started:', result);
    //   return result;
    // }catch(error){
    //   console.log('Recording error:', error);
    //   return null;
    // }
    
  };
  
  export async function stopRecording()  {
    // const audioRecorderPlayer = new AudioRecorderPlayer();
    // const result = await audioRecorderPlayer.stopRecorder();
    // audioRecorderPlayer.removeRecordBackListener();
    // console.log('Recording stopped:', result);
    // return result;
    
  };
