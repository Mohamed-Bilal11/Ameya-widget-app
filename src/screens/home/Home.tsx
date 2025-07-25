import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Home: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome Back!</Text>
      <Text style={styles.subtitle}>Let’s track your wellness journey</Text>

      <Card style={styles.card}>
        <View style={styles.buttonWrapper}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('FoodLogs')}
            style={[styles.button, { backgroundColor: '#467267' }]}
            labelStyle={styles.buttonLabel}
          >
            🍽️ Food Logs
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Movements')}
            style={[styles.button, { backgroundColor: '#4996F6' }]}
            labelStyle={styles.buttonLabel}
          >
            🧘 Movements
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Activity')}
            style={[styles.button, { backgroundColor: '#DB7670' }]}
            labelStyle={styles.buttonLabel}
          >
            🚶 Activity
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('ChatHome')}
            style={[styles.button, { backgroundColor: '#7c3aed' }]}
            labelStyle={styles.buttonLabel}
          >
            💬 AI Chat
          </Button>
        </View>
      </Card>
    </View>
  );
};

export default Home;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F1E0',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 50,
    fontWeight: 'bold'
  },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonWrapper: {
    gap: 16,
  },
  button: {
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'center',
    marginTop: 40,
    opacity: 0.9,
  },
});
