/**
 * Food Data Extractor Service
 * 
 * This service provides utilities to extract structured food data
 * from natural language text for the Food Log screen.
 */

/**
 * Extract food data from text input
 * @param {string} text - The input text to analyze
 * @returns {Object} - Structured food data
 */
export const extractFoodData = (text) => {
  const data = {
    originalText: text,
    food: null,
    quantity: null,
    unit: null,
    meal: null,
    description: null,
    timestamp: new Date().toISOString()
  };

  if (!text || typeof text !== 'string') {
    return data;
  }

  const lowerText = text.toLowerCase().trim();
  
  // Extract food items (specific foods, not meal types)
  const foodItems = [
    'apple', 'banana', 'orange', 'grapes', 'strawberry',
    'bread', 'toast', 'sandwich', 'pizza', 'pasta',
    'rice', 'chicken', 'beef', 'fish', 'salmon',
    'eggs', 'milk', 'cheese', 'yogurt', 'cereal',
    'coffee', 'tea', 'water', 'juice', 'soda',
    'salad', 'vegetables', 'carrots', 'broccoli', 'spinach',
    'nuts', 'almonds', 'walnuts', 'peanuts',
    'chocolate', 'candy', 'cake', 'cookie', 'ice cream',
    'briyani', 'biryani', 'curry', 'dal', 'roti', 'naan', 'idli'
  ];

  // Check for food items (using word boundaries for accurate matching)
  const foundFoods = [];
  for (const food of foodItems) {
    // Use word boundary regex to avoid partial matches (e.g., "ice" shouldn't match in "juice")
    const regex = new RegExp(`\\b${food.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundFoods.push(food);
    }
  }
  
  if (foundFoods.length > 0) {
    data.food = foundFoods.join(', ');
  }

  // If no specific food found, try to extract food-related phrases
  if (!data.food) {
    // Look for patterns like "had X", "ate X", "drank X"
    const foodPatterns = [
      /(?:had|ate|drank|consumed)\s+([^,.\s]+(?:\s+[^,.\s]+)*)/gi,
      /(?:for\s+)(breakfast|lunch|dinner|snack)/gi
    ];
    
    for (const pattern of foodPatterns) {
      const match = pattern.exec(lowerText);
      if (match) {
        data.food = match[1] || match[0];
        break;
      }
    }
  }

  // Extract quantities (with context awareness)
  const quantityMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:cups?|bowls?|plates?|pieces?|slices?|servings?|grams?|kg|pounds?|lbs?|ounces?|oz)/);
  if (quantityMatch) {
    // Check if this quantity is in an exercise context (e.g., "lifted 2kg", "pressed 50kg")
    const exerciseContextWords = ['lifted', 'lift', 'press', 'pressed', 'raised', 'raise', 'bench', 'squat', 'deadlift'];
    const matchIndex = lowerText.indexOf(quantityMatch[0]);
    const contextBefore = lowerText.substring(Math.max(0, matchIndex - 20), matchIndex);
    
    // Check if any exercise words appear before the quantity
    const isExerciseContext = exerciseContextWords.some(word => contextBefore.includes(word));
    
    if (!isExerciseContext) {
      // Only extract quantity if it's NOT in an exercise context
      data.quantity = parseFloat(quantityMatch[1]);
      data.unit = quantityMatch[2];
    } else {
      console.log('🍽️ FoodDataExtractor: Skipping quantity in exercise context:', quantityMatch[0]);
    }
  }

  // Extract meal types
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'snacks', 'brunch'];
  for (const meal of mealTypes) {
    const mealRegex = new RegExp(`\\b${meal}\\b`, 'i');
    if (mealRegex.test(lowerText)) {
      // Convert 'snack' to 'snacks' for consistency
      data.meal = meal === 'snack' ? 'snacks' : meal;
      break;
    }
  }

  // Always use the original user's text as description to preserve detail
  data.description = text;

  return data;
};

/**
 * Check if text contains food-related keywords
 * @param {string} text - The input text to analyze
 * @returns {boolean} - True if text is food-related
 */
export const isFoodRelated = (text) => {
  if (!text || typeof text !== 'string') {
    console.log('❌ FoodDataExtractor: Invalid text input');
    return false;
  }

  const lowerText = text.toLowerCase().trim();
  console.log('🔍 FoodDataExtractor: Checking text:', lowerText);
  
  const foodKeywords = [
    'food', 'meal', 'eat', 'ate', 'eating', 'hungry', 'breakfast', 'lunch', 'dinner',
    'snack', 'snacks', 'diet', 'nutrition', 'calories', 'protein', 'carbs', 'fat',
    'apple', 'banana', 'bread', 'chicken', 'pizza', 'pasta', 'rice', 'salad',
    'coffee', 'tea', 'water', 'juice', 'milk', 'cheese', 'yogurt', 'briyani',
    'ice cream', 'ice', 'chocolate', 'cake', 'cookie', 'candy'
  ];

  const foundKeywords = foodKeywords.filter(keyword => {
    // Use word boundary regex for more precise matching
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
  console.log('🍽️ FoodDataExtractor: Found keywords:', foundKeywords);
  
  const isRelated = foundKeywords.length > 0;
  console.log('🍽️ FoodDataExtractor: Is food related:', isRelated);
  
  return isRelated;
};
