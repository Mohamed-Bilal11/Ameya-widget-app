# Activity Logging Feature

## Overview

This feature allows users to share activity information through both speech recognition and text input, then automatically navigates to the appropriate screen and logs the data.

## Features

### 🎤 Speech Recognition
- Users can click the microphone button and speak naturally about their activities
- The system extracts structured data from speech (steps, distance, time, calories, etc.)
- Automatically navigates to the appropriate screen based on the activity type

### ⌨️ Text Input
- Users can type activity information in the text input field
- Same data extraction and navigation logic as speech recognition
- Supports natural language input

### 🧠 Smart Data Extraction
The system can extract and understand:
- **Steps**: "I completed 10,000 steps"
- **Distance**: "I walked 5 kilometers"
- **Time**: "I exercised for 30 minutes"
- **Exercise Types**: "I did yoga", "I went to the gym"
- **Calories**: "I burned 300 calories"
- **Food**: "I had breakfast", "I ate lunch"

### 🧭 Automatic Navigation
Based on the extracted data, the system navigates to:
- **Movements Screen**: For steps, distance, walking, running
- **Activity Screen**: For exercise, gym, yoga, calories, duration
- **Food Logs Screen**: For meals, food, eating
- **Home Screen**: For general navigation

### 📊 Auto-Logging
When specific data is detected (numbers, measurements), the system:
1. Pre-populates the input field with the extracted information
2. Automatically logs the activity after a short delay
3. Shows a success message to the user

## Implementation Details

### Components Updated

#### VoiceButton.js
- Enhanced `handleNavigation` function to extract activity data
- Added `extractActivityData` function for speech text processing
- Passes activity data to navigation screens

#### TextInputNavigation.js
- Enhanced `handleSubmit` function to extract activity data
- Uses the same data extraction logic as speech recognition
- Passes activity data to navigation screens

#### Activity.tsx
- Added `useEffect` to handle incoming activity data
- Auto-populates the activity field with extracted data
- Auto-logs activities with specific data (numbers, measurements)
- Shows different success messages for auto-logged vs manual entries

#### Movements.tsx
- Added `useEffect` to handle incoming activity data
- Auto-populates the exercise field with extracted data
- Auto-logs movements with specific data
- Enhanced snackbar messages

#### FoodLog.tsx
- Added `useEffect` to handle incoming activity data
- Auto-populates the food field with extracted data
- Auto-logs food entries with specific data
- Updates the food logs list automatically

### New Service: ActivityDataExtractor.js

Centralized service for activity data extraction with functions:
- `extractActivityData(text)`: Main extraction function
- `getNavigationScreen(activityData)`: Determines navigation target
- `formatActivityData(activityData)`: Formats data for display
- `hasSpecificData(activityData)`: Checks for measurable data
- `getActivitySuggestions()`: Returns example phrases

## Usage Examples

### Speech Recognition
1. User clicks microphone button
2. User says: "I completed 10,000 steps today"
3. System extracts: `{type: 'steps', value: 10000, unit: 'steps'}`
4. System navigates to Movements screen
5. System auto-logs the activity

### Text Input
1. User types: "I did yoga for 45 minutes"
2. System extracts: `{type: 'duration', value: 45, unit: 'minutes'}`
3. System navigates to Activity screen
4. System auto-logs the activity

### Supported Phrases
- "I completed 10,000 steps"
- "I walked 5 kilometers"
- "I ran for 30 minutes"
- "I did yoga for 45 minutes"
- "I burned 300 calories"
- "I went to the gym"
- "I had breakfast"
- "I ate lunch"

## Technical Implementation

### Data Structure
```javascript
{
  originalText: string,
  type: string | null,        // 'steps', 'distance', 'duration', 'exercise', 'calories', 'food'
  value: number | null,       // Numeric value if applicable
  unit: string | null,        // 'steps', 'km', 'minutes', 'calories'
  description: string | null, // Human-readable description
  timestamp: string          // ISO timestamp
}
```

### Navigation Flow
1. User provides input (speech or text)
2. System extracts activity data
3. System determines target screen based on data type
4. System navigates with activity data as parameter
5. Target screen receives and processes the data
6. Screen auto-populates and optionally auto-logs

### Error Handling
- Graceful fallback for unrecognized input
- Type safety with TypeScript interfaces
- Console logging for debugging
- User-friendly error messages

## Benefits

1. **Improved User Experience**: Natural language input instead of manual form filling
2. **Faster Data Entry**: Auto-logging reduces manual steps
3. **Smart Navigation**: Automatic routing to appropriate screens
4. **Flexible Input**: Both speech and text input supported
5. **Data Accuracy**: Structured extraction from natural language
6. **Consistent Interface**: Same logic for both input methods

## Future Enhancements

- Machine learning for better data extraction
- Voice feedback for confirmation
- Batch activity logging
- Integration with fitness trackers
- Advanced analytics and insights
