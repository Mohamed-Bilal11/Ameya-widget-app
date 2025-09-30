import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VoiceButton from '../../components/VoiceButton';
import TextInputNavigation from '../../components/ui/TextInputNavigation';
import TranscriptionTextArea from '../../components/ui/TranscriptionTextArea';

const MicInput = () => {
  const [activeTab, setActiveTab] = useState('voice'); // 'voice' or 'text'
  const [transcription, setTranscription] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>🎤 Voice & Text Input</Text>
          <Text style={styles.subtitle}>Share your activities easily</Text>
        </View>

        {/* Input Method Selector */}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[styles.selectorButton, activeTab === 'voice' && styles.activeSelector]}
            onPress={() => setActiveTab('voice')}
          >
            <Ionicons 
              name="mic" 
              size={24} 
              color={activeTab === 'voice' ? '#FFFFFF' : '#467267'} 
            />
            <Text style={[styles.selectorText, activeTab === 'voice' && styles.activeSelectorText]}>
              Voice
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.selectorButton, activeTab === 'text' && styles.activeSelector]}
            onPress={() => setActiveTab('text')}
          >
            <Ionicons 
              name="create" 
              size={24} 
              color={activeTab === 'text' ? '#FFFFFF' : '#467267'} 
            />
            <Text style={[styles.selectorText, activeTab === 'text' && styles.activeSelectorText]}>
              Text
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {activeTab === 'voice' ? (
            <View style={styles.voiceSection}>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionTitle}>Voice Input</Text>
                <Text style={styles.instructionText}>
                  Click the microphone to start recording, then click it again to stop.
                </Text>
                
                <View style={styles.voiceButtonWrapper}>
                  <VoiceButton 
                    onTranscriptionChange={setTranscription}
                    onRecordingChange={setRecording}
                    onLoadingChange={setLoading}
                  />
                </View>
                
                {/* Transcription at bottom of instruction card */}
                <View style={styles.transcriptionSection}>
                  {/* <Text style={styles.transcriptionLabel}>Transcription:</Text> */}
                  <TranscriptionTextArea 
                    transcription={transcription} 
                    isLoading={loading || recording} 
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.textSection}>
              <View style={styles.instructionCard}>
                <Ionicons name="create" size={24} color="#467267" />
                <Text style={styles.instructionTitle}>Text Input</Text>
                <Text style={styles.instructionText}>
                  Type your activity information in the text field below.
                </Text>
                
                <View style={styles.textInputWrapper}>
                  <TextInputNavigation />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Quick Examples */}
        {/* <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>💡 Try these examples:</Text>
          <View style={styles.examplesGrid}>
            <View style={styles.exampleCard}>
              <Text style={styles.exampleText}>"I completed 10,000 steps"</Text>
            </View>
            <View style={styles.exampleCard}>
              <Text style={styles.exampleText}>"I walked 5 kilometers"</Text>
            </View>
            <View style={styles.exampleCard}>
              <Text style={styles.exampleText}>"I did yoga for 30 minutes"</Text>
            </View>
            <View style={styles.exampleCard}>
              <Text style={styles.exampleText}>"I had breakfast"</Text>
            </View>
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B2E',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E8EAF6',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B39DDB',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#2D2B55',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeSelector: {
    backgroundColor: '#7B1FA2',
    elevation: 2,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E1BEE7',
    marginLeft: 8,
  },
  activeSelectorText: {
    color: '#FFFFFF',
  },
  mainContent: {
    marginBottom: 32,
  },
  voiceSection: {
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
  },
  instructionCard: {
    backgroundColor: '#2D2B55',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    // marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    // width: '100%',
    height: '90%',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E8EAF6',
    marginTop: 8,
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 13,
    color: '#B39DDB',
    textAlign: 'center',
    lineHeight: 18,
  },
  voiceButtonWrapper: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  transcriptionSection: {
    width: '100%',
    marginTop: 50,
  },
  transcriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8EAF6',
    marginBottom: 8,
  },
  textInputWrapper: {
    width: '100%',
    marginTop: 80,
  },
  examplesSection: {
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#467267',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MicInput;

