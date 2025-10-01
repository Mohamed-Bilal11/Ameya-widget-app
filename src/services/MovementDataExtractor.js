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
  } else if (lowerText.includes('exercise')) {
    // If just "exercise" is mentioned, extract it
    data.exercise = 'exercise';
  }

  // Extract weight for weightlifting (e.g., "lifted 2kg", "bench pressed 50kg")
  const weightMatch = lowerText.match(/(?:lifted|lift|press|pressed|raised|raise|bench|squat|deadlift)\s+(\d+(?:\.\d+)?)\s*(?:kg|kgs|pounds?|lbs?)/i);
  if (weightMatch) {
    data.weight = parseFloat(weightMatch[1]);
    data.weightUnit = weightMatch[0].match(/(?:kg|kgs|pounds?|lbs?)/i)?.[0];
    if (!data.exercise) {
      data.exercise = 'weightlifting';
    }
  }

  // Extract duration
  const durationMatch = lowerText.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)/);
  if (durationMatch) {
    data.duration = parseInt(durationMatch[1]);
    data.durationUnit = durationMatch[0].match(/(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)/)[0];
  }

  // Extract intensity
  const intensityKeywords = ['easy', 'light', 'moderate', 'hard', 'intense', 'heavy', 'low', 'high'];
  for (const intensity of intensityKeywords) {
    if (lowerText.includes(intensity)) {
      data.intensity = intensity;
      break;
    }
  }

  // Extract distance (with context awareness)
  const distanceMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|miles?|m|meters?)/);
  if (distanceMatch) {
    // Check if this distance is in a walking/activity context (e.g., "walked 5km", "ran 3km")
    const walkingContextWords = ['walk', 'walked', 'walking', 'ran', 'running', 'jog', 'jogged', 'jogging'];
    const matchIndex = lowerText.indexOf(distanceMatch[0]);
    const contextBefore = lowerText.substring(Math.max(0, matchIndex - 20), matchIndex);
    
    // Check if any walking words appear before the distance
    const isWalkingContext = walkingContextWords.some(word => contextBefore.includes(word));
    
    if (!isWalkingContext && data.exercise) {
      // Only extract distance if it's NOT in a walking context AND we have an exercise
      data.distance = parseFloat(distanceMatch[1]);
      data.distanceUnit = distanceMatch[2];
    } else if (isWalkingContext) {
      console.log('💪 MovementDataExtractor: Skipping distance in walking/activity context:', distanceMatch[0]);
    }
  }

  // Always use the original user's text as description to preserve detail
  data.description = text;

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
  
  // Primary movement/exercise keywords (specific activity types)
  const specificMovementKeywords = [
    'exercise', 'exercises', 'workout', 'training', 'gym', 'sport', 'sports',
    'running', 'jogging', 'cycling', 'biking', 'swimming',
    'yoga', 'pilates', 'dancing', 'hiking', 'climbing',
    'tennis', 'basketball', 'football', 'soccer', 'boxing',
    'martial arts', 'aerobics', 'zumba', 'crossfit', 'hiit',
    'cardio', 'strength', 'weightlifting', 'lifting', 'muscle', 'muscles',
    'sit to stand', 'sit-to-stand', 'sit ups', 'push ups', 'squats'
  ];

  // Look for specific movement keywords
  const foundKeywords = specificMovementKeywords.filter(keyword => {
    // Use word boundary regex for more precise matching
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
  console.log('💪 MovementDataExtractor: Found keywords:', foundKeywords);
  
  // If no movement keywords found, return false early
  if (foundKeywords.length === 0) {
    console.log('💪 MovementDataExtractor: No movement keywords found');
    return false;
  }

  // Check if this is ONLY about steps/distance without exercise context
  // E.g., "completed 5000 steps" should go to Activity, not Movement
  const hasStepsOnly = /\b\d+\s*(?:steps?|step)\b/i.test(lowerText);
  const hasExerciseContext = foundKeywords.length > 0;
  
  // If it's just about steps/distance with no exercise mention, skip it
  if (hasStepsOnly && !hasExerciseContext) {
    console.log('💪 MovementDataExtractor: Only step data without exercise context, skipping');
    return false;
  }
  
  const isRelated = foundKeywords.length > 0;
  console.log('💪 MovementDataExtractor: Is movement related:', isRelated);
  
  return isRelated;
};
