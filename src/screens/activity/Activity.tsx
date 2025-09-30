import React, { useState, useEffect } from 'react';
import {  StyleSheet, ScrollView, Keyboard, View } from 'react-native';
import { Text, TextInput, Button, Snackbar, Card, } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import BottomNavigation from '../../components/BottomNavigation';
import { completeCurrentScreen, getCurrentProgress } from '../../services/SequentialNavigationService';

type ActivityData = {
  originalText: string;
  type: string | null;
  value: number | null;
  unit: string | null;
  description: string | null;
  timestamp?: string;
};

type RouteParams = {
  activityData?: ActivityData;
  isMultiScreen?: boolean;
  sequenceIndex?: number;
  totalScreens?: number;
};

const { WidgetUpdater } = NativeModules;

const Activity = () => {
  const [activity, setActivity] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [autoLogged, setAutoLogged] = useState(false);
  const [isMultiScreen, setIsMultiScreen] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const route = useRoute();
  const navigation = useNavigation();

  // Load recent activities
  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    try {
      const lastActivity = await AsyncStorage.getItem('lastActivity');
      if (lastActivity) {
        setRecentActivities([{
          id: Date.now().toString(),
          description: lastActivity,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  // Handle incoming activity data from navigation
  useEffect(() => {
    const routeParams = route.params as RouteParams;
    const activityData = routeParams?.activityData;
    const isMultiScreenMode = routeParams?.isMultiScreen;
    const sequenceIndex = routeParams?.sequenceIndex;
    const totalScreens = routeParams?.totalScreens;
    
    if (isMultiScreenMode) {
      setIsMultiScreen(true);
      if (sequenceIndex !== undefined && totalScreens !== undefined) {
        setProgress({ current: sequenceIndex + 1, total: totalScreens });
      }
    }
    
    if (activityData && !autoLogged) {
      console.log('📊 Received activity data:', activityData);
      
      // Auto-populate the activity field with extracted data
      if (activityData.description) {
        setActivity(activityData.description);
        
        // Auto-log the activity if it contains specific data
        if (activityData.type && activityData.value) {
          setTimeout(() => {
            // Pass the multi-screen state directly to handleAutoLog
            handleAutoLog(activityData, isMultiScreenMode);
          }, 1000); // Small delay to show the user what's happening
        }
      }
    }
  }, [route.params, autoLogged]);

  const handleAutoLog = async (activityData: ActivityData, isMultiScreenParam?: boolean) => {
    try {
      console.log('🤖 Auto-logging activity data:', activityData);
      const shouldAdvance = isMultiScreenParam !== undefined ? isMultiScreenParam : isMultiScreen;
      const logMessage = `Hey! Log Activity: ${activityData.description}`;
      await AsyncStorage.setItem('lastActivity', activityData.description);
      await AsyncStorage.setItem('widget_text', logMessage); 
      await AsyncStorage.setItem('widget_type', 'activity'); 
      WidgetUpdater.updateWidget(logMessage, 'activity');
      
      setAutoLogged(true);
      setSnackbarVisible(true);
      console.log('✅ Auto-logged activity:', activityData.description);
      
      // If this is part of a multi-screen sequence, move to next screen
      if (shouldAdvance) {
        await completeCurrentScreen(navigation, () => {
          console.log('📊 Activity logging completed, moving to next screen');
        });
      }
    } catch (error) {
      console.error('❌ Error auto-logging activity:', error);
    }
  };

  const logActivity = async () => {
    if (!activity.trim()) return;
    console.log('📊 Manual activity logging:', activity);
    const logMessage = `Hey! Log Activity: ${activity}`;
    await AsyncStorage.setItem('lastActivity', activity);
    await AsyncStorage.setItem('widget_text', logMessage); 
    await AsyncStorage.setItem('widget_type', 'activity'); 
    WidgetUpdater.updateWidget(logMessage,'activity');
    console.log('📱 Widget updated with message:', logMessage);

    setActivity('');
    setSnackbarVisible(true);
    Keyboard.dismiss();
    
    // If this is part of a multi-screen sequence, move to next screen
    if (isMultiScreen) {
      await completeCurrentScreen(navigation, () => {
        console.log('📊 Activity logging completed, moving to next screen');
      });
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🏃‍♂️ Activity Tracker</Text>
        
        {isMultiScreen && progress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              📊 Logging Activity ({progress.current}/{progress.total})
            </Text>
          </View>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="What did you do?"
              value={activity}
              mode="outlined"
              onChangeText={setActivity}
              style={styles.input}
              theme={{
                colors: {
                  text: '#000000', // input text color
                  primary: '#DB7670', // label + focused outline
                  placeholder: '#616161', // label color (unfocused)
                },
              }}
            />
            <Button
              mode="contained"
              onPress={logActivity}
              disabled={!activity.trim()}
              style={styles.button}
              buttonColor="#DB7670"
              labelStyle={{color: '#FFFFFF', fontWeight: 'bold'}}>
              Log Activity
            </Button>
          </Card.Content>
        </Card>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <Card style={styles.recentCard}>
            <Card.Content>
              <Text style={styles.recentTitle}>📋 Recent Activities</Text>
              {recentActivities.map((item) => (
                <View key={item.id} style={styles.recentItem}>
                  <Text style={styles.recentText}>{item.description}</Text>
                  <Text style={styles.recentTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}
        >
          {autoLogged ? 'Activity auto-logged! 🎉' : 'Activity logged! 💪'}
        </Snackbar>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFE6E8',
    justifyContent: 'center',
    paddingBottom: 100, // Space for bottom navigation
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#DB7670',
  },
  progressContainer: {
    backgroundColor: '#FFE6E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DB7670',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DB7670',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 8,
  },
  snackbar: {
    backgroundColor: '#43A047',
  },
  recentCard: {
    marginTop: 20,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DB7670',
    marginBottom: 12,
  },
  recentItem: {
    backgroundColor: '#FFE6E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recentText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  recentTime: {
    fontSize: 12,
    color: '#666',
  },
});
