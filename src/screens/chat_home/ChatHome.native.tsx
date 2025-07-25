import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Easing, PermissionsAndroid,
    Platform, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import axios from 'axios';

const audioRecorderPlayer = AudioRecorderPlayer;

function EqualizerBars({ visible }: { visible: boolean }) {
  const BAR_COUNT = 40;
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(phase, {
          toValue: 2 * Math.PI,
          duration: 1200,
          useNativeDriver: false,
          easing: Easing.linear,
        })
      ).start();
    } else {
      phase.stopAnimation();
    }
  }, [visible, phase]);

  if (!visible) return null;

  return (
    <View style={eqStyles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const barPhase = (i / BAR_COUNT) * 2 * Math.PI;
        const height = phase.interpolate({
          inputRange: [0, 2 * Math.PI],
          outputRange: [18 + 18 * Math.sin(barPhase), 18 + 18 * Math.sin(barPhase + 2 * Math.PI)],
        });
        return (
          <Animated.View
            key={i}
            style={[
              eqStyles.bar,
              { height }
            ]}
          />
        );
      })}
    </View>
  );
}

const eqStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 12,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#38bdf8',
    marginHorizontal: 1,
  },
});

export default function ChatHome() {
 // const [recording, setRecording] = useState(false);
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const audioPath = useRef(
    Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/record.m4a`,
      android: `${RNFS.DocumentDirectoryPath}/record.mp4`,
    })
  ).current;

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
    }
  };

  const startRecording = async () => {
    await requestPermissions();
    setRecording(true);
    await audioRecorderPlayer.startRecorder(audioPath);
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    uploadToWhisper(result);
  };

  const uploadToWhisper = async (filePath) => {
    const formData = new FormData();
    formData.append('file', {
      uri: `file://${filePath}`,
      type: 'audio/mp4',
      name: 'audio.mp4',
    });
    formData.append('model', 'whisper-1');
    console.log('url--',filePath)
    try {
        const res = await axios.post(
            'http://<YOUR_LOCAL_IP>:3001/transcribe',
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
            }
          );
      const text = res.data.text;
      addMessage(text, 'user');
      fakeAIResponse(text);
    } catch (err) {
      console.error('Whisper API error:', err);
    }
  };

  const addMessage = (text, role) => {
    setMessages((prev) => [...prev, { text, role }]);
  };

  const fakeAIResponse = (userText) => {
    setTimeout(() => {
      addMessage(`You said: "${userText}"`, 'ai');
    }, 1500);
  };

  // Example: toggle recording for demo
  // Remove this and use your real recording logic
  useEffect(() => {
    startRecording();
  }, []);

  return (
    <LinearGradient
      colors={['#111', '#1a237e', '#1976d2']}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <View style={styles.liveContainer}>
            <Feather name="activity" size={16} color="#fff" />
            <Text style={styles.liveText}>Live</Text>
          </View>
          <TouchableOpacity style={styles.topIcon}>
            <Feather name="video-off" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Animated Equalizer only while recording */}
        <View style={styles.equalizerBarContainer}>
          <EqualizerBars visible={recording} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <Feather name="video" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Feather name="upload" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Feather name="pause" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={recording ? stopRecording : startRecording}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: 16,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
  },
  liveText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
  topIcon: {
    alignSelf: 'flex-end',
  },
  equalizerBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 110,
    alignItems: 'center',
    zIndex: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,30,40,0.8)',
    borderRadius: 32,
    padding: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222b',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  endButton: {
    backgroundColor: '#e53935',
  },
});
