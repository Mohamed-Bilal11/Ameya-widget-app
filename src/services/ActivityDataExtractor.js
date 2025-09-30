/**
 * Activity Data Extractor Service
 * 
 * This service provides utilities to extract structured activity data
 * from natural language text for the Activity screen (smartwatch health metrics).
 * Focuses on health data like steps, heart rate, calories, sleep, walking, etc.
 */

/**
 * Extract activity data from text input
 * @param {string} text - The input text to analyze
 * @returns {Object} - Structured activity data
 */
export const extractActivityData = (text) => {
  const data = {
    originalText: text,
    type: null,
    value: null,
    unit: null,
    description: null,
    timestamp: new Date().toISOString()
  };

  if (!text || typeof text !== 'string') {
    return data;
  }

  const lowerText = text.toLowerCase().trim();
  
  // Extract steps data (smartwatch health metric)
  const stepsMatch = lowerText.match(/(\d+)\s*(?:steps?|step)/);
  if (stepsMatch) {
    data.type = 'steps';
    data.value = parseInt(stepsMatch[1]);
    data.unit = 'steps';
    data.description = `Walked ${stepsMatch[1]} steps`;
    return data;
  }

  // Extract heart rate data (smartwatch health metric)
  const heartRateMatch = lowerText.match(/(\d+)\s*(?:bpm|heart rate|hr)/);
  if (heartRateMatch) {
    data.type = 'heart_rate';
    data.value = parseInt(heartRateMatch[1]);
    data.unit = 'bpm';
    data.description = `Heart rate: ${heartRateMatch[1]} bpm`;
    return data;
  }

  // Extract calories burned (smartwatch health metric)
  const caloriesMatch = lowerText.match(/(\d+)\s*(?:calories?|cal)/);
  if (caloriesMatch) {
    data.type = 'calories';
    data.value = parseInt(caloriesMatch[1]);
    data.unit = 'calories';
    data.description = `Burned ${caloriesMatch[1]} calories`;
    return data;
  }

  // Extract walking distance (smartwatch health metric)
  const distanceMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|m|meters?)/);
  if (distanceMatch) {
    data.type = 'distance';
    data.value = parseFloat(distanceMatch[1]);
    data.unit = distanceMatch[2];
    data.description = `Walked ${distanceMatch[0]}`;
    return data;
  }

  // Extract sleep data (smartwatch health metric)
  const sleepMatch = lowerText.match(/(\d+)\s*(?:hours?|hrs?)\s*(?:sleep|slept)/);
  if (sleepMatch) {
    data.type = 'sleep';
    data.value = parseInt(sleepMatch[1]);
    data.unit = 'hours';
    data.description = `Slept ${sleepMatch[1]} hours`;
    return data;
  }

  // Extract general health metrics
  if (lowerText.includes('walking') || lowerText.includes('walked')) {
    data.type = 'walking';
    data.description = 'Walking activity recorded';
    return data;
  }

  // If no specific data found, return the original text as description
  data.description = text;
  return data;
};

/**
 * Check if text contains activity-related keywords
 * @param {string} text - The input text to analyze
 * @returns {boolean} - True if text is activity-related
 */
export const isActivityRelated = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const lowerText = text.toLowerCase().trim();
  
  const activityKeywords = [
    'steps', 'step', 'walked', 'walking', 'walk',
    'distance', 'km', 'kilometers', 'miles', 'meters', 'm',
    'calories', 'cal', 'burned', 'burn',
    'heart rate', 'bpm', 'hr', 'pulse',
    'sleep', 'slept', 'sleeping',
    'activity', 'activities', 'track', 'tracking', 'monitor', 'monitoring',
    'pedometer', 'fitness', 'health', 'wellness', 'smartwatch', 'watch'
  ];

  return activityKeywords.some(keyword => lowerText.includes(keyword));
};