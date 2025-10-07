# Ameya Widget App

A comprehensive wellness tracking React Native application with voice navigation, iOS widgets, and AI-powered chat functionality.

## 🌟 Features

### Core Functionality
- **🍽️ Food Logging** - Track your daily meals with voice input
- **🧘 Movement Tracking** - Log yoga, meditation, and wellness activities  
- **🚶 Activity Monitoring** - Record physical activities and exercises
- **💬 AI Chat** - Interactive voice-powered chat interface
- **🎤 Voice Navigation** - Speech recognition for hands-free interaction
- **📱 iOS Widgets** - Home screen widgets for quick access

### Technical Features
- **Cross-platform** - React Native for iOS and Android
- **Voice Recognition** - Native iOS SFSpeechRecognizer integration
- **Deep Linking** - Seamless navigation between app sections
- **Local Storage** - AsyncStorage for data persistence
- **Widget Integration** - Real-time widget updates
- **Modern UI** - React Native Paper design system

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- React Native development environment
- iOS 10.0+ (for speech recognition)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ameya-widget-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run the application**
   ```bash
   # iOS
   npx react-native run-ios
   
   # Android
   npx react-native run-android
   ```

## 📱 App Structure

### Navigation
- **Home** - Main dashboard with quick access buttons
- **Food Logs** - Meal tracking and logging
- **Movements** - Yoga and wellness activity tracking
- **Activity** - Physical exercise monitoring
- **AI Chat** - Voice-powered conversational interface

### Key Components
- `VoiceButton` - Central voice interaction component
- `SpeechAPI` - Native speech recognition service
- `WidgetUpdater` - iOS widget update bridge
- `NavigationService` - Deep linking and navigation management

## 🎤 Voice Features

### Speech Recognition
- Real-time speech-to-text conversion
- Partial results for live transcription
- Error handling and permission management
- Start/stop listening controls

### Voice Navigation
- Hands-free app navigation
- Voice commands for logging activities
- AI-powered chat interactions

## 📱 iOS Widgets

### Widget Types
- **Food Widget** - Shows recent meal logs
- **Movement Widget** - Displays wellness activities
- **Activity Widget** - Tracks physical exercises

### Widget Features
- Real-time updates from app data
- Deep linking to specific app sections
- Customizable appearance and colors
- Support for small and medium widget sizes

## 🔧 Technical Implementation

### Architecture
- **React Native 0.76.3** - Cross-platform framework
- **TypeScript** - Type-safe development
- **React Navigation** - Screen navigation
- **React Native Paper** - Material Design components
- **AsyncStorage** - Local data persistence

### Native Modules
- **SpeechRecognizerModule** - iOS speech recognition
- **WidgetUpdater** - Widget data synchronization
- **Deep Link Handling** - URL scheme navigation

### Key Dependencies
```json
{
  "@react-navigation/native": "^7.1.14",
  "react-native-paper": "^5.14.5",
  "react-native-permissions": "^5.4.1",
  "react-native-vector-icons": "^10.2.0",
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

## 🎯 Usage

### Voice Commands
1. Tap the voice button on the home screen
2. Speak your command (e.g., "Log a meal", "Track movement")
3. The app will process your speech and navigate accordingly

### Widget Setup
1. Long press on iOS home screen
2. Tap the "+" button
3. Search for "Ameya Widget"
4. Add widget to home screen
5. Widget will automatically sync with app data

### Deep Linking
The app supports deep linking with custom URL schemes:
- `awesomeproject://meal` - Navigate to Food Logs
- `awesomeproject://movement` - Navigate to Movements  
- `awesomeproject://activity` - Navigate to Activity

## 🔒 Permissions

### iOS Permissions Required
- **Microphone** - For voice recognition
- **Speech Recognition** - For speech-to-text conversion
- **App Groups** - For widget data sharing

### Permission Setup
Permissions are automatically requested when needed. Users can also manually grant permissions in:
- Settings > Privacy & Security > Microphone
- Settings > Privacy & Security > Speech Recognition

## 🐛 Troubleshooting

### Common Issues

1. **Speech Recognition Not Working**
   - Ensure microphone permissions are granted
   - Check internet connection (required for speech recognition)
   - Verify iOS version (10.0+ required)

2. **Widget Not Updating**
   - Check App Groups configuration
   - Verify widget permissions
   - Restart the app and widget

3. **Deep Linking Issues**
   - Ensure URL schemes are properly configured
   - Check navigation service initialization

### Debug Information
Enable console logging to see:
- Permission status
- Speech recognition availability
- Widget update status
- Navigation events

## 🚀 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # App screens
├── services/           # API and native services
└── data/              # Data models and types

ios/
├── MyWidget/          # iOS widget implementation
├── AwesomeProject/    # Main iOS app
└── Pods/             # CocoaPods dependencies
```

### Building for Production
```bash
# iOS
npx react-native run-ios --configuration Release

# Android
npx react-native run-android --variant=release
```

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or support, please contact the development team.

---

**Built with ❤️ using React Native**
