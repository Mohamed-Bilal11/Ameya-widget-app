/**
 * Movement Data Extractor Service
 * 
 * This service provides utilities to extract structured movement data
 * from natural language text for the Movements screen (exercise activities).
 * Focuses on exercise types like running, gym, yoga, cycling, etc.
 */

/**
 * Extract movement data from text input
 * @param {string} text - The input text to analyze
 * @returns {Object} - Structured movement data
 */
export const extractMovementData = (text) => {
  const data = {
    originalText: text,
    exercise: null,
    duration: null,
    intensity: null,
    description: null,
    timestamp: new Date().toISOString()
  };

  if (!text || typeof text !== 'string') {
    return data;
  }

  const lowerText = text.toLowerCase().trim();
  
  // Extract exercise types (removed walking - it goes to Activity)
  const exerciseTypes = [
    'running', 'jogging', 'cycling', 'biking', 'swimming',
    'gym', 'weightlifting', 'lifting', 'yoga', 'pilates', 'dancing',
    'hiking', 'climbing', 'tennis', 'basketball', 'football', 'soccer',
    'boxing', 'martial arts', 'karate', 'taekwondo', 'kickboxing',
    'aerobics', 'zumba', 'crossfit', 'hiit', 'cardio', 'strength training',
    'sit to stand', 'sit-to-stand', 'sit ups', 'push ups', 'squats'
  ];

  // Check for exercise types
  const foundExercises = [];
  for (const exercise of exerciseTypes) {
    if (lowerText.includes(exercise)) {
      foundExercises.push(exercise);
    }
  }
  
  if (foundExercises.length > 0) {
    data.exercise = foundExercises.join(', ');
    data.description = `Did ${foundExercises.join(', ')}`;
  } else if (lowerText.includes('exercise')) {
    // If just "exercise" is mentioned, extract it
    data.exercise = 'exercise';
    data.description = 'Completed exercise';
  }

  // Extract duration
  const durationMatch = lowerText.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)/);
  if (durationMatch) {
    data.duration = parseInt(durationMatch[1]);
    data.unit = durationMatch[2];
    if (data.exercise) {
      data.description = `Did ${data.exercise} for ${durationMatch[0]}`;
    }
  }

  // Extract intensity
  const intensityKeywords = ['easy', 'light', 'moderate', 'hard', 'intense', 'heavy', 'low', 'high'];
  for (const intensity of intensityKeywords) {
    if (lowerText.includes(intensity)) {
      data.intensity = intensity;
      break;
    }
  }

  // Extract distance
  const distanceMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|m|meters?)/);
  if (distanceMatch) {
    data.distance = parseFloat(distanceMatch[1]);
    data.distanceUnit = distanceMatch[2];
    if (data.exercise) {
      data.description = `Did ${data.exercise} for ${distanceMatch[0]}`;
    }
  }

  // If no specific exercise found, use the original text
  if (!data.exercise) {
    data.description = text;
  }

  return data;
};

/**
 * Check if text contains movement-related keywords
 * @param {string} text - The input text to analyze
 * @returns {boolean} - True if text is movement-related
 */
export const isMovementRelated = (text) => {
  if (!text || typeof text !== 'string') {
    console.log('❌ MovementDataExtractor: Invalid text input');
    return false;
  }

  const lowerText = text.toLowerCase().trim();
  console.log('🔍 MovementDataExtractor: Checking text:', lowerText);
  
  const movementKeywords = [
    'exercise', 'exercises', 'workout', 'training', 'fitness', 'gym', 'sport', 'sports',
    'running', 'cycling', 'swimming', 'yoga', 'pilates', 'dancing',
    'hiking', 'climbing', 'tennis', 'basketball', 'football', 'soccer',
    'boxing', 'martial arts', 'aerobics', 'zumba', 'crossfit', 'hiit',
    'cardio', 'strength', 'weightlifting', 'lifting', 'muscle', 'muscles',
    'sit to stand', 'sit-to-stand', 'completed', 'did', 'performed'
  ];

  const foundKeywords = movementKeywords.filter(keyword => {
    // Use word boundary regex for more precise matching
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
  console.log('💪 MovementDataExtractor: Found keywords:', foundKeywords);
  
  const isRelated = foundKeywords.length > 0;
  console.log('💪 MovementDataExtractor: Is movement related:', isRelated);
  
  return isRelated;
};
