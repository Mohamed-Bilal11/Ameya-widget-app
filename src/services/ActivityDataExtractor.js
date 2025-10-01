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
    data.description = text; // Use original user text
    return data;
  }

  // Extract heart rate data (smartwatch health metric)
  const heartRateMatch = lowerText.match(/(\d+)\s*(?:bpm|heart rate|hr)/);
  if (heartRateMatch) {
    data.type = 'heart_rate';
    data.value = parseInt(heartRateMatch[1]);
    data.unit = 'bpm';
    data.description = text; // Use original user text
    return data;
  }

  // Extract calories burned (smartwatch health metric)
  const caloriesMatch = lowerText.match(/(\d+)\s*(?:calories?|cal)/);
  if (caloriesMatch) {
    data.type = 'calories';
    data.value = parseInt(caloriesMatch[1]);
    data.unit = 'calories';
    data.description = text; // Use original user text
    return data;
  }

  // Extract walking distance (smartwatch health metric)
  const distanceMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|m|meters?)/);
  if (distanceMatch) {
    data.type = 'distance';
    data.value = parseFloat(distanceMatch[1]);
    data.unit = distanceMatch[2];
    data.description = text; // Use original user text
    return data;
  }

  // Extract sleep data (smartwatch health metric)
  const sleepMatch = lowerText.match(/(\d+)\s*(?:hours?|hrs?)\s*(?:sleep|slept)/);
  if (sleepMatch) {
    data.type = 'sleep';
    data.value = parseInt(sleepMatch[1]);
    data.unit = 'hours';
    data.description = text; // Use original user text
    return data;
  }

  // Extract general health metrics
  if (lowerText.includes('walking') || lowerText.includes('walked') || lowerText.includes('walk')) {
    data.type = 'walking';
    data.description = text; // Use original user text
    return data;
  }

  // Try to extract activity-related phrases from the text
  const activityPhrases = [
    /walked\s+(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|m|meters?)/gi,
    /burned\s+(\d+)\s*(?:calories?|cal)/gi,
    /(\d+)\s*(?:steps?|step)/gi
  ];
  
  for (const pattern of activityPhrases) {
    const match = pattern.exec(lowerText);
    if (match) {
      if (pattern.source.includes('walked')) {
        data.type = 'distance';
        data.value = parseFloat(match[1]);
        data.unit = 'km';
        data.description = text; // Use original user text
        return data;
      } else if (pattern.source.includes('burned')) {
        data.type = 'calories';
        data.value = parseInt(match[1]);
        data.unit = 'calories';
        data.description = text; // Use original user text
        return data;
      } else if (pattern.source.includes('steps')) {
        data.type = 'steps';
        data.value = parseInt(match[1]);
        data.unit = 'steps';
        data.description = text; // Use original user text
        return data;
      }
    }
  }

  // Always use the original text as description
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
    console.log('❌ ActivityDataExtractor: Invalid text input');
    return false;
  }

  const lowerText = text.toLowerCase().trim();
  console.log('🔍 ActivityDataExtractor: Checking text:', lowerText);
  
  const activityKeywords = [
    'steps', 'step', 'walked', 'walking', 'walk',
    'distance', 'km', 'kilometers', 'miles', 'meters',
    'calories', 'cal', 'burned', 'burn',
    'heart rate', 'bpm', 'hr', 'pulse',
    'sleep', 'slept', 'sleeping',
    'activity', 'activities', 'track', 'tracking', 'monitor', 'monitoring',
    'pedometer', 'fitness', 'health', 'wellness', 'smartwatch', 'watch',
    'smart watch', 'fitbit', 'apple watch', 'samsung watch', 'garmin'
  ];

  const foundKeywords = activityKeywords.filter(keyword => {
    // Use word boundary regex for more precise matching
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
  console.log('📊 ActivityDataExtractor: Found keywords:', foundKeywords);
  
  const isRelated = foundKeywords.length > 0;
  console.log('📊 ActivityDataExtractor: Is activity related:', isRelated);
  
  return isRelated;
};