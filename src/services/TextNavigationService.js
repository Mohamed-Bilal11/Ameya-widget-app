import { detectIntent } from './VoiceAPI';

// Navigation mapping
const NAVIGATION_MAP = {
  'FoodLog': 'FoodLogs',
  'Movements': 'Movements',
  'Activity': 'Activity',
  'Home': 'Home'
};

// Fallback keywords for when OpenAI fails
const FALLBACK_KEYWORDS = {
  food: ['food', 'meal', 'eat', 'diet', 'breakfast', 'lunch', 'dinner', 'snack'],
  activity: ['activity', 'exercise', 'workout', 'fitness', 'gym', 'sport'],
  movement: ['movement', 'steps', 'walk', 'run', 'jog', 'hike', 'travel']
};

export const processTextNavigation = async (text) => {
  try {
    console.log('🤖 Processing text with VoiceAPI:', text);
    
    // Use the existing VoiceAPI detectIntent function
    const openAIResponse = await detectIntent(text);
    console.log('🤖 OpenAI Response:', openAIResponse);
    
    // Parse the JSON response
    const result = JSON.parse(openAIResponse);
    
    // Map the screen name
    const screen = NAVIGATION_MAP[result.screen] || 'Home';
    
    return {
      screen,
      filters: result.filters || null,
      confidence: 0.9,
      reasoning: `OpenAI determined: ${result.screen}`,
      source: 'openai'
    };
    
  } catch (error) {
    console.warn('OpenAI failed, using fallback:', error);
    return fallbackNavigation(text);
  }
};

const fallbackNavigation = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for food-related keywords
  for (const keyword of FALLBACK_KEYWORDS.food) {
    if (lowerText.includes(keyword)) {
      return {
        screen: 'FoodLogs',
        filters: null,
        confidence: 0.8,
        reasoning: `Found food keyword: ${keyword}`,
        source: 'fallback'
      };
    }
  }

  // Check for activity-related keywords
  for (const keyword of FALLBACK_KEYWORDS.activity) {
    if (lowerText.includes(keyword)) {
      return {
        screen: 'Activity',
        filters: null,
        confidence: 0.8,
        reasoning: `Found activity keyword: ${keyword}`,
        source: 'fallback'
      };
    }
  }

  // Check for movement-related keywords
  for (const keyword of FALLBACK_KEYWORDS.movement) {
    if (lowerText.includes(keyword)) {
      return {
        screen: 'Movements',
        filters: null,
        confidence: 0.8,
        reasoning: `Found movement keyword: ${keyword}`,
        source: 'fallback'
      };
    }
  }

  // Default to Home
  return {
    screen: 'Home',
    filters: null,
    confidence: 0.5,
    reasoning: 'No specific keywords found, defaulting to Home',
    source: 'fallback'
  };
};

// Utility function to get navigation suggestions
export const getNavigationSuggestions = () => {
  return [
    "Log my breakfast",
    "Track my workout", 
    "Record my steps",
    "Add food to diary",
    "Log exercise activity",
    "Show me the main menu"
  ];
};
