# ITRA ROBO

ITRA ROBO is a powerful React Native application designed for creating and managing professional designs, greetings, and business/political profiles. It offers a comprehensive suite of features for users to customize visual content, manage subscriptions, and handle payments seamlessly.

## 🚀 Features

- **Auth System**: Secure Login, Registration, and Password Recovery.
- **Dynamic Dashboards**:
  - **Home**: Overview and featured content.
  - **Greetings**: Browse and select greeting templates.
  - **Business Designs**: Specialized templates for business branding.
  - **Custom Designs**: Tools for creating bespoke visual content.
- **Design Editor**: Robust editing interface for customizing templates.
- **Profile Management**:
  - Personal User Profile.
  - **Business Profile**: Manage business-specific details.
  - **Political Profile**: Dedicated section for political branding.
- **Monetization**:
  - **Subscription Plans**: Tiered access to premium features.
  - **Integrated Payments**: Support for Razorpay and In-App Purchases (IAP).
- **Media & Sharing**:
  - Image and Video support.
  - Social sharing capabilities.
  - View Shot for capturing custom designs.
- **Push Notifications**: Real-time updates via Firebase Cloud Messaging.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev) (v0.84.1)
- **Navigation**: [React Navigation](https://reactnavigation.org) (v7)
- **UI Components**: [React Native Paper](https://reactnativepaper.com)
- **Styling**: React Native StyleSheet & Linear Gradient
- **Animations**: [Lottie](https://github.com/lottie-react-native/lottie-react-native) & [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Backend Services**: Firebase Cloud Messaging
- **Payments**: Razorpay & React Native IAP
- **Image Handling**: Fast Image, Image Picker, Image Crop Picker

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: >= 22.11.0
- **npm**: (or Yarn)
- **Android SDK**: For Android development
- **Xcode & CocoaPods**: For iOS development (macOS only)

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd roboapp
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Install CocoaPods (iOS only)**:
   ```sh
   cd ios
   pod install
   cd ..
   ```

## 🏃 Running the App

### Step 1: Start Metro

Run the following command from the root of your project:

```sh
npm start
```

### Step 2: Launch Android/iOS

Open a new terminal and run:

#### For Android:
```sh
npm run android
```

#### For iOS:
```sh
npm run ios
```

## 📦 Build Commands

- **Build Android APK**:
  ```sh
  npm run androidapk
  ```
- **Build Android App Bundle (AAB)**:
  ```sh
  npm run androidabb
  ```

## 📁 Project Structure

```
roboapp/
├── App.tsx             # Main entry point and Navigation setup
├── android/            # Native Android project files
├── ios/                # Native iOS project files
├── assets/             # Images, fonts, and animation files
└── pages/              # Application screens and logic
    ├── core/           # Common utilities and constants
    ├── features/       # Feature-specific screens (DesignEdit, Subscription, etc.)
    └── screens/        # Main tab screens (Home, Profile, etc.)
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.
