/**
 * Sequential Navigation Service
 * 
 * This service handles multi-screen sequential navigation for complex voice inputs
 * that contain multiple types of data (food, activity, movement).
 */

/**
 * Extract all types of data from a single text input
 * @param {string} text - The input text to analyze
 * @returns {Object} - Object containing all detected data types
 */
// Helper function to clean up repeated words and improve text quality
const cleanRepeatedWords = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Split into words and remove consecutive duplicates
  const words = text.split(/\s+/);
  const cleanedWords = [];
  
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i].toLowerCase();
    const lastWord = cleanedWords[cleanedWords.length - 1]?.toLowerCase();
    
    // Only add if it's not the same as the previous word
    if (currentWord !== lastWord) {
      cleanedWords.push(words[i]);
    }
  }
  
  // Join and clean up extra spaces
  let cleaned = cleanedWords.join(' ').trim();
  
  // Remove extra "and" words that might be left over
  cleaned = cleaned.replace(/\s+and\s+and\s+/g, ' and ');
  
  return cleaned;
};

export const extractAllDataTypes = (text) => {
  const result = {
    foodData: null,
    activityData: null,
    movementData: null,
    screens: []
  };

  if (!text || typeof text !== 'string') {
    console.log('❌ SequentialNavigationService: Invalid text input');
    return result;
  }

  // Clean up repeated words before processing
  const cleanedText = cleanRepeatedWords(text);
  console.log('🔍 SequentialNavigationService: Original text:', text);
  console.log('🔍 SequentialNavigationService: Cleaned text:', cleanedText);

  // Import the individual extractors
  const { extractFoodData, isFoodRelated } = require('./FoodDataExtractor');
  const { extractActivityData, isActivityRelated } = require('./ActivityDataExtractor');
  const { extractMovementData, isMovementRelated } = require('./MovementDataExtractor');

  // Check for food-related content
  const isFood = isFoodRelated(cleanedText);
  console.log('🍽️ Food detection:', isFood);
  if (isFood) {
    result.foodData = extractFoodData(cleanedText);
    result.screens.push({
      name: 'FoodLogs',
      dataKey: 'foodData',
      data: result.foodData,
      title: '🍽️ Food Logging'
    });
    console.log('🍽️ Added food screen:', result.foodData);
  }

  // Check for activity-related content
  const isActivity = isActivityRelated(cleanedText);
  console.log('📊 Activity detection:', isActivity);
  if (isActivity) {
    result.activityData = extractActivityData(cleanedText);
    result.screens.push({
      name: 'Activity',
      dataKey: 'activityData',
      data: result.activityData,
      title: '📊 Activity Logging'
    });
    console.log('📊 Added activity screen:', result.activityData);
  }

  // Check for movement-related content
  const isMovement = isMovementRelated(cleanedText);
  console.log('💪 Movement detection:', isMovement);
  if (isMovement) {
    result.movementData = extractMovementData(cleanedText);
    result.screens.push({
      name: 'Movements',
      dataKey: 'movementData',
      data: result.movementData,
      title: '💪 Movement Logging'
    });
    console.log('💪 Added movement screen:', result.movementData);
  }

  console.log('🚀 SequentialNavigationService: Final result:', {
    screens: result.screens.length,
    screenNames: result.screens.map(s => s.name),
    foodData: result.foodData,
    activityData: result.activityData,
    movementData: result.movementData
  });

  return result;
};

/**
 * Start sequential navigation through multiple screens
 * @param {Object} navigation - React Navigation object
 * @param {Array} screens - Array of screen objects to navigate through
 */
export const startSequentialNavigation = (navigation, screens) => {
  if (!screens || screens.length === 0) {
    console.log('❌ No screens to navigate to');
    return;
  }

  console.log('🚀 Starting sequential navigation through', screens.length, 'screens');
  console.log('📱 Screens to navigate:', screens.map(s => ({ name: s.name, title: s.title })));
  
  // Navigate to the first screen with sequence information
  const firstScreen = screens[0];
  console.log('🎯 Navigating to first screen:', firstScreen.name, 'with data:', firstScreen.data);
  
  navigation.navigate(firstScreen.name, {
    [firstScreen.dataKey]: firstScreen.data,
    isMultiScreen: true,
    sequenceIndex: 0,
    totalScreens: screens.length,
    allScreens: screens
  });
};

/**
 * Complete current screen and move to next in sequence
 * @param {Object} navigation - React Navigation object
 * @param {Function} onComplete - Callback when sequence is complete
 */
export const completeCurrentScreen = (navigation, onComplete) => {
  console.log('🔄 completeCurrentScreen called');
  
  try {
    // Get current route params to check if we're in a sequence
    const currentRoute = navigation.getState()?.routes[navigation.getState()?.index];
    const params = currentRoute?.params;
    
    console.log('🔄 completeCurrentScreen: Current route:', currentRoute?.name);
    console.log('🔄 completeCurrentScreen: Route params:', params);
    
    if (!params?.isMultiScreen) {
      console.log('❌ Not in multi-screen mode');
      return;
    }

    const currentIndex = params.sequenceIndex || 0;
    const totalScreens = params.totalScreens || 0;
    const allScreens = params.allScreens || [];

    console.log(`📱 Completed screen ${currentIndex + 1}/${totalScreens}`);
    console.log('📋 All screens:', allScreens.map(s => s.name));

    // Check if there are more screens to navigate to
    const nextIndex = currentIndex + 1;
    console.log(`🔍 Next index: ${nextIndex}, Total screens: ${allScreens.length}`);
    
    if (nextIndex < allScreens.length) {
      const nextScreen = allScreens[nextIndex];
      console.log(`➡️ Navigating to next screen: ${nextScreen.name} with data:`, nextScreen.data);
      console.log(`➡️ Next screen dataKey: ${nextScreen.dataKey}`);
      
      // Navigate to next screen with updated sequence info
      const navigationParams = {
        [nextScreen.dataKey]: nextScreen.data,
        isMultiScreen: true,
        sequenceIndex: nextIndex,
        totalScreens: totalScreens,
        allScreens: allScreens
      };
      
      console.log(`➡️ Navigation params:`, navigationParams);
      navigation.navigate(nextScreen.name, navigationParams);
    } else {
      console.log('✅ Sequential navigation complete! Navigating to home...');
      // Navigate to home page after completing all logs
      navigation.navigate('Home');
      if (onComplete) {
        onComplete();
      }
    }
  } catch (error) {
    console.error('❌ Error in completeCurrentScreen:', error);
  }
};

/**
 * Get current progress in the sequence
 * @param {Object} route - Current route object
 * @returns {Object|null} - Progress object or null if not in sequence
 */
export const getCurrentProgress = (route) => {
  const params = route?.params;
  if (!params?.isMultiScreen) {
    return null;
  }

  return {
    current: (params.sequenceIndex || 0) + 1,
    total: params.totalScreens || 0,
    currentScreen: params.allScreens?.[params.sequenceIndex]?.title || 'Unknown'
  };
};
