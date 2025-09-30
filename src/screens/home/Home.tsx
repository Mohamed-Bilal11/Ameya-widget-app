import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';

type Props = NativeStackScreenProps<any, 'Home'>;

const Home: React.FC<Props> = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    todaySteps: 0,
    targetSteps: 10000,
    mealsLogged: 0,
    activitiesLogged: 0,
    movementsLogged: 0,
  });
  const [recentLogs, setRecentLogs] = useState({
    foodLogs: [],
    activityLogs: [],
    movementLogs: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent activity data
      const lastActivity = await AsyncStorage.getItem('lastActivity');
      const lastMovement = await AsyncStorage.getItem('lastMovement');
      const foodLogs = await AsyncStorage.getItem('foodLogs');
      
      // Parse food logs to count today's meals
      let mealsCount = 0;
      let foodLogsData = [];
      if (foodLogs) {
        foodLogsData = JSON.parse(foodLogs);
        mealsCount = foodLogsData.length;
      }

      // Load recent logs for display
      setRecentLogs({
        foodLogs: foodLogsData.slice(0, 3), // Show last 3 food logs
        activityLogs: lastActivity ? [{ description: lastActivity, timestamp: new Date().toISOString() }] : [],
        movementLogs: lastMovement ? [{ description: lastMovement, timestamp: new Date().toISOString() }] : []
      });

      // Simulate some progress data (in a real app, this would come from your backend)
      setDashboardData({
        todaySteps: Math.floor(Math.random() * 5000) + 3000, // Random steps between 3000-8000
        targetSteps: 10000,
        mealsLogged: mealsCount,
        activitiesLogged: lastActivity ? 1 : 0,
        movementsLogged: lastMovement ? 1 : 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const stepsProgress = dashboardData.todaySteps / dashboardData.targetSteps;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>👋 Welcome Back!</Text>
          <Text style={styles.subtitle}>Here's your wellness progress today</Text>

          {/* Steps Progress Card */}
          <Card style={styles.progressCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>🚶 Today's Steps</Text>
              <Text style={styles.stepsText}>{dashboardData.todaySteps.toLocaleString()} / {dashboardData.targetSteps.toLocaleString()}</Text>
              <ProgressBar 
                progress={stepsProgress} 
                color="#467267" 
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(stepsProgress * 100)}% of daily goal
              </Text>
            </Card.Content>
          </Card>

          {/* Activity Summary Cards */}
          <View style={styles.summaryGrid}>
            <Card style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
              <Card.Content style={styles.summaryContent}>
                <Text style={styles.summaryNumber}>{dashboardData.mealsLogged}</Text>
                <Text style={styles.summaryLabel}>Meals Logged</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#FFE6E8' }]}>
              <Card.Content style={styles.summaryContent}>
                <Text style={styles.summaryNumber}>{dashboardData.activitiesLogged}</Text>
                <Text style={styles.summaryLabel}>Activities</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: '#E8F5E8' }]}>
              <Card.Content style={styles.summaryContent}>
                <Text style={styles.summaryNumber}>{dashboardData.movementsLogged}</Text>
                <Text style={styles.summaryLabel}>Movements</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Recent Logs */}
          <Card style={styles.recentLogsCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>📋 Recent Logs</Text>
              
              {/* Food Logs */}
              {recentLogs.foodLogs.length > 0 && (
                <View style={styles.logSection}>
                  <Text style={styles.logSectionTitle}>🍽️ Food</Text>
                  {recentLogs.foodLogs.map((log, index) => (
                    <View key={index} style={styles.logItem}>
                      <Text style={styles.logText}>{log.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Activity Logs */}
              {recentLogs.activityLogs.length > 0 && (
                <View style={styles.logSection}>
                  <Text style={styles.logSectionTitle}>📊 Activity</Text>
                  {recentLogs.activityLogs.map((log, index) => (
                    <View key={index} style={styles.logItem}>
                      <Text style={styles.logText}>{log.description}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Movement Logs */}
              {recentLogs.movementLogs.length > 0 && (
                <View style={styles.logSection}>
                  <Text style={styles.logSectionTitle}>💪 Movement</Text>
                  {recentLogs.movementLogs.map((log, index) => (
                    <View key={index} style={styles.logItem}>
                      <Text style={styles.logText}>{log.description}</Text>
                    </View>
                  ))}
                </View>
              )}

              {recentLogs.foodLogs.length === 0 && recentLogs.activityLogs.length === 0 && recentLogs.movementLogs.length === 0 && (
                <Text style={styles.noLogsText}>No recent logs. Start logging your activities!</Text>
              )}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
              <Text style={styles.quickActionsText}>
                Use the microphone button below to quickly log your activities, or tap any tab to navigate to specific sections.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default Home;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1B2E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for bottom navigation
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1B2E',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#E8EAF6',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B39DDB',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold'
  },
  progressCard: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#2D2B55',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E8EAF6',
    marginBottom: 12,
  },
  stepsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E1BEE7',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#B39DDB',
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#2D2B55',
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E1BEE7',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#B39DDB',
    textAlign: 'center',
  },
  quickActionsCard: {
    elevation: 2,
    borderRadius: 16,
    backgroundColor: '#2D2B55',
  },
  quickActionsText: {
    fontSize: 14,
    color: '#B39DDB',
    lineHeight: 20,
    textAlign: 'center',
  },
  recentLogsCard: {
    marginBottom: 20,
    elevation: 2,
    borderRadius: 16,
    backgroundColor: '#2D2B55',
  },
  logSection: {
    marginBottom: 12,
  },
  logSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E1BEE7',
    marginBottom: 8,
  },
  logItem: {
    backgroundColor: '#1A1B2E',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  logText: {
    fontSize: 14,
    color: '#B39DDB',
  },
  noLogsText: {
    fontSize: 14,
    color: '#B39DDB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
