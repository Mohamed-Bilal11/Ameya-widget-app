import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { extractActivityData, getActivitySuggestions } from '../services/ActivityDataExtractor';

/**
 * Activity Feature Demo Component
 * 
 * This component demonstrates the new activity logging feature
 * that allows users to share activity information through both
 * speech recognition and text input.
 */
const ActivityFeatureDemo = () => {
  const [selectedExample, setSelectedExample] = useState(null);
  const navigation = useNavigation();
  const suggestions = getActivitySuggestions();

  const handleExamplePress = (example) => {
    setSelectedExample(example);
    
    // Extract activity data from the example
    const activityData = extractActivityData(example);
    console.log('📊 Demo: Extracted data:', activityData);
    
    // Determine navigation screen
    let screen = 'Home';
    if (activityData.type === 'steps' || activityData.type === 'distance') {
      screen = 'Movements';
    } else if (activityData.type === 'exercise' || activityData.type === 'duration' || activityData.type === 'calories') {
      screen = 'Activity';
    } else if (activityData.type === 'food') {
      screen = 'FoodLogs';
    }
    
    // Navigate with activity data
    navigation.navigate(screen, { activityData });
  };

  const handleVoiceDemo = () => {
    // This would trigger the voice recording
    console.log('🎤 Voice demo - would start recording');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎯 Activity Logging Feature Demo</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎤 Speech Recognition</Text>
          <Text style={styles.description}>
            Click the microphone button and say something like:
          </Text>
          <Text style={styles.example}>"I completed 10,000 steps today"</Text>
          <Text style={styles.example}>"I walked 5 kilometers"</Text>
          <Text style={styles.example}>"I did yoga for 30 minutes"</Text>
          
          <Button 
            mode="contained" 
            onPress={handleVoiceDemo}
            style={styles.demoButton}
            buttonColor="#DB7670"
          >
            🎤 Try Voice Input
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>⌨️ Text Input</Text>
          <Text style={styles.description}>
            Type your activity information in the text input below:
          </Text>
          <Text style={styles.example}>"I ran for 45 minutes"</Text>
          <Text style={styles.example}>"I burned 300 calories"</Text>
          <Text style={styles.example}>"I had breakfast"</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💡 Try These Examples</Text>
          <Text style={styles.description}>
            Tap any example to see how the feature works:
          </Text>
          
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.exampleButton,
                selectedExample === suggestion && styles.selectedExample
              ]}
              onPress={() => handleExamplePress(suggestion)}
            >
              <Text style={styles.exampleText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>✨ How It Works</Text>
          <Text style={styles.featureText}>
            • <Text style={styles.bold}>Speech Recognition:</Text> Speak naturally about your activities
          </Text>
          <Text style={styles.featureText}>
            • <Text style={styles.bold}>Text Input:</Text> Type your activity information
          </Text>
          <Text style={styles.featureText}>
            • <Text style={styles.bold}>Smart Navigation:</Text> Automatically routes to the right screen
          </Text>
          <Text style={styles.featureText}>
            • <Text style={styles.bold}>Auto-Logging:</Text> Extracts and logs your activity data
          </Text>
          <Text style={styles.featureText}>
            • <Text style={styles.bold}>Data Extraction:</Text> Recognizes steps, distance, time, calories, etc.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#467267',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
    lineHeight: 20,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#DB7670',
    marginBottom: 4,
    paddingLeft: 8,
  },
  demoButton: {
    marginTop: 12,
  },
  exampleButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedExample: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1E88E5',
  },
  exampleText: {
    fontSize: 14,
    color: '#333',
  },
  featureText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ActivityFeatureDemo;
