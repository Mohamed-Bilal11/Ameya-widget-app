import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  InteractionManager,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { WidgetUpdater } = NativeModules;

type FoodItem = {
  id: string;
  name: string;
};

const FoodLog = () => {
  const [food, setFood] = useState('');
  const [logs, setLogs] = useState<FoodItem[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    AsyncStorage.getItem('foodLogs').then((stored) => {
      if (stored && mountedRef.current) {
        InteractionManager.runAfterInteractions(() => {
          setLogs(JSON.parse(stored));
        });
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addFood = async () => {
    if (!food.trim()) return;

    const newLog = { id: Date.now().toString(), name: food.trim() };
    const updatedLogs = [newLog, ...logs];

    Keyboard.dismiss();
    setFood('');

    await AsyncStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
    await AsyncStorage.setItem('widget_type','food');
    const safeName = newLog?.name?.trim() || 'Unknown Meal';
    WidgetUpdater.updateWidget(`Hey! Log your Activity.`,'food');

    if (mountedRef.current) {
      InteractionManager.runAfterInteractions(() => {
        setLogs(updatedLogs);
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>🍱 Food Log</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your meal..."
          value={food}
          onChangeText={setFood}
          placeholderTextColor="#999"
        />

<View style={styles.buttonWrapper}>
  <TouchableOpacity
    style={[
      styles.button,
      !food.trim() && styles.buttonDisabled,  // lighter color when disabled
    ]}
    onPress={addFood}
    disabled={!food.trim()}
    activeOpacity={0.8}
  >
    <Text style={styles.label}>Add Meal</Text>
  </TouchableOpacity>
</View>

        <View style={styles.divider} />

        <Text style={styles.subHeader}>📋 Today's Meal</Text>

        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No meals logged yet 🥗</Text>
        ) : (
          logs.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemText}>🍽    {item.name}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FoodLog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F1E0',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#467267',
    textAlign: 'center',
    marginBottom: 40,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 16,
  },
  item: {
    backgroundColor: '#467267',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'medium'
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    height: 48,                 // ⬅️ set your exact height here
    backgroundColor: '#3F3FA6', // custom color
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonDisabled: { backgroundColor: '#3F3FA633' },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
