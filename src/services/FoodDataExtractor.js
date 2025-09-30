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
  
  // Extract food items
  const foodItems = [
    'breakfast', 'lunch', 'dinner', 'snack', 'meal',
    'apple', 'banana', 'orange', 'grapes', 'strawberry',
    'bread', 'toast', 'sandwich', 'pizza', 'pasta',
    'rice', 'chicken', 'beef', 'fish', 'salmon',
    'eggs', 'milk', 'cheese', 'yogurt', 'cereal',
    'coffee', 'tea', 'water', 'juice', 'soda',
    'salad', 'vegetables', 'carrots', 'broccoli', 'spinach',
    'nuts', 'almonds', 'walnuts', 'peanuts',
    'chocolate', 'candy', 'cake', 'cookie', 'ice cream'
  ];

  // Check for food items
  for (const food of foodItems) {
    if (lowerText.includes(food)) {
      data.food = food;
      data.description = `Had ${food}`;
      break;
    }
  }

  // Extract quantities
  const quantityMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:cups?|bowls?|plates?|pieces?|slices?|servings?|grams?|kg|pounds?|lbs?|ounces?|oz)/);
  if (quantityMatch) {
    data.quantity = parseFloat(quantityMatch[1]);
    data.unit = quantityMatch[2];
    if (data.food) {
      data.description = `Had ${quantityMatch[0]} of ${data.food}`;
    }
  }

  // Extract meal types
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'brunch'];
  for (const meal of mealTypes) {
    if (lowerText.includes(meal)) {
      data.meal = meal;
      if (!data.description) {
        data.description = `Had ${meal}`;
      }
      break;
    }
  }

  // If no specific food found, use the original text
  if (!data.food && !data.meal) {
    data.description = text;
  }

  return data;
};

/**
 * Check if text contains food-related keywords
 * @param {string} text - The input text to analyze
 * @returns {boolean} - True if text is food-related
 */
export const isFoodRelated = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const lowerText = text.toLowerCase().trim();
  
  const foodKeywords = [
    'food', 'meal', 'eat', 'ate', 'eating', 'hungry', 'breakfast', 'lunch', 'dinner',
    'snack', 'diet', 'nutrition', 'calories', 'protein', 'carbs', 'fat',
    'apple', 'banana', 'bread', 'chicken', 'pizza', 'pasta', 'rice', 'salad',
    'coffee', 'tea', 'water', 'juice', 'milk', 'cheese', 'yogurt'
  ];

  return foodKeywords.some(keyword => lowerText.includes(keyword));
};
