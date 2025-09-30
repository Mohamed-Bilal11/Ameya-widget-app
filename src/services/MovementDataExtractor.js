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
  
  // Extract exercise types
  const exerciseTypes = [
    'running', 'jogging', 'walking', 'cycling', 'biking', 'swimming',
    'gym', 'weightlifting', 'lifting', 'yoga', 'pilates', 'dancing',
    'hiking', 'climbing', 'tennis', 'basketball', 'football', 'soccer',
    'boxing', 'martial arts', 'karate', 'taekwondo', 'kickboxing',
    'aerobics', 'zumba', 'crossfit', 'hiit', 'cardio', 'strength training'
  ];

  // Check for exercise types
  for (const exercise of exerciseTypes) {
    if (lowerText.includes(exercise)) {
      data.exercise = exercise;
      data.description = `Did ${exercise}`;
      break;
    }
  }

  // Extract duration
  const durationMatch = lowerText.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)/);
  if (durationMatch) {
    data.duration = parseInt(durationMatch[1]);
    data.unit = durationMatch[2];
    if (data.exercise) {
      data.description = `Did ${exercise} for ${durationMatch[0]}`;
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
    return false;
  }

  const lowerText = text.toLowerCase().trim();
  
  const movementKeywords = [
    'exercise', 'workout', 'training', 'fitness', 'gym', 'sport', 'sports',
    'running', 'walking', 'cycling', 'swimming', 'yoga', 'pilates', 'dancing',
    'hiking', 'climbing', 'tennis', 'basketball', 'football', 'soccer',
    'boxing', 'martial arts', 'aerobics', 'zumba', 'crossfit', 'hiit',
    'cardio', 'strength', 'weightlifting', 'lifting', 'muscle', 'muscles'
  ];

  return movementKeywords.some(keyword => lowerText.includes(keyword));
};
