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
import { useRoute, useNavigation } from '@react-navigation/native';
import BottomNavigation from '../../components/BottomNavigation';
import { completeCurrentScreen, getCurrentProgress } from '../../services/SequentialNavigationService';

type FoodData = {
  originalText: string;
  food: string | null;
  quantity: number | null;
  unit: string | null;
  meal: string | null;
  description: string | null;
  timestamp?: string;
};

type RouteParams = {
  foodData?: FoodData;
  isMultiScreen?: boolean;
  sequenceIndex?: number;
  totalScreens?: number;
};

const { WidgetUpdater } = NativeModules;

type FoodItem = {
  id: string;
  name: string;
};

const FoodLog = () => {
  const [food, setFood] = useState('');
  const [logs, setLogs] = useState<FoodItem[]>([]);
  const [autoLogged, setAutoLogged] = useState(false);
  const [isMultiScreen, setIsMultiScreen] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  const mountedRef = useRef(true);
  const route = useRoute();
  const navigation = useNavigation();

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

  // Handle incoming food data from navigation
  useEffect(() => {
    const routeParams = route.params as RouteParams;
    const foodData = routeParams?.foodData;
    const isMultiScreenMode = routeParams?.isMultiScreen;
    const sequenceIndex = routeParams?.sequenceIndex;
    const totalScreens = routeParams?.totalScreens;
    
    console.log('🍽️ FoodLog: Route params:', {
      foodData: !!foodData,
      isMultiScreenMode,
      sequenceIndex,
      totalScreens
    });
    
    if (isMultiScreenMode) {
      console.log('🍽️ FoodLog: Setting multi-screen mode');
      setIsMultiScreen(true);
      if (sequenceIndex !== undefined && totalScreens !== undefined) {
        setProgress({ current: sequenceIndex + 1, total: totalScreens });
        console.log('🍽️ FoodLog: Set progress:', { current: sequenceIndex + 1, total: totalScreens });
      }
    }
    
    if (foodData && !autoLogged) {
      console.log('📊 Received food data:', foodData);
      
      // Auto-populate the food field with extracted data
      if (foodData.description) {
        setFood(foodData.description);
        
        // Auto-log the food if it contains specific data
        if (foodData.food || foodData.meal) {
          setTimeout(() => {
            // Pass the multi-screen state directly to handleAutoLog
            handleAutoLog(foodData, isMultiScreenMode);
          }, 1000); // Small delay to show the user what's happening
        }
      }
    }
  }, [route.params, autoLogged]);

  const handleAutoLog = async (foodData: FoodData, isMultiScreenParam?: boolean) => {
    try {
      console.log('🤖 Auto-logging food data:', foodData);
      const shouldAdvance = isMultiScreenParam !== undefined ? isMultiScreenParam : isMultiScreen;
      console.log('🤖 FoodLog: isMultiScreen state:', isMultiScreen, 'isMultiScreenParam:', isMultiScreenParam, 'shouldAdvance:', shouldAdvance);
      const newLog = { id: Date.now().toString(), name: foodData.description?.trim() || foodData.originalText };
      const updatedLogs = [newLog, ...logs];

      await AsyncStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
      await AsyncStorage.setItem('widget_type', 'food');
      WidgetUpdater.updateWidget(`Hey! Log Food: ${foodData.description}`, 'food');
      
      if (mountedRef.current) {
        InteractionManager.runAfterInteractions(() => {
          setLogs(updatedLogs);
        });
      }
      
      setAutoLogged(true);
      setFood('');
      console.log('✅ Auto-logged food:', foodData.description);
      
      // If this is part of a multi-screen sequence, move to next screen
      console.log('🔄 FoodLog: Checking if multi-screen:', shouldAdvance);
      if (shouldAdvance) {
        console.log('🚀 FoodLog: Calling completeCurrentScreen');
        await completeCurrentScreen(navigation, () => {
          console.log('🍽️ Food logging completed, moving to next screen');
        });
      } else {
        console.log('❌ FoodLog: Not in multi-screen mode, staying on current screen');
      }
    } catch (error) {
      console.error('❌ Error auto-logging food:', error);
    }
  };

  const addFood = async () => {
    if (!food.trim()) return;

    console.log('🍽️ Manual food logging:', food);
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
    
    // If this is part of a multi-screen sequence, move to next screen
    if (isMultiScreen) {
      await completeCurrentScreen(navigation, () => {
        console.log('🍽️ Food logging completed, moving to next screen');
      });
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>🍱 Food Log</Text>
          
          {isMultiScreen && progress && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                🍽️ Logging Food ({progress.current}/{progress.total})
              </Text>
            </View>
          )}

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
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
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
    paddingBottom: 100, // Space for bottom navigation
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#467267',
    textAlign: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    textAlign: 'center',
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
