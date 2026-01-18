# Mobile Client (Android APK)

## Overview

The AREA mobile client is a native Android application built with Flutter. It provides the same functionality as the web client, allowing users to manage workflows, connect services, and monitor automations on the go.

## Tech Stack

- **Framework:** Flutter 3.24.5
- **Language:** Dart (SDK >=3.0.0 <4.0.0)
- **Platform:** Android (min SDK 21)

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `google_fonts` | ^6.1.0 | Custom typography |
| `http` | ^1.1.0 | API communication |
| `shared_preferences` | ^2.2.2 | Local storage for auth tokens |
| `webview_flutter` | ^4.4.2 | OAuth authentication flows |

---

## Project Structure

```
client/apk/
├── lib/
│   ├── main.dart              # App entry point
│   ├── screens/               # UI screens
│   │   ├── admin_screen.dart
│   │   ├── create_workflow_screen.dart
│   │   ├── home_screen.dart
│   │   ├── login_screen.dart
│   │   ├── oauth_webview_screen.dart
│   │   ├── profile_screen.dart
│   │   ├── register_screen.dart
│   │   └── services_screen.dart
│   ├── services/              # Business logic
│   │   ├── api_service.dart   # REST API client
│   │   └── storage_service.dart
│   └── widgets/               # Reusable components
│       ├── universal_drawer.dart
│       └── universal_header.dart
├── assets/
│   └── area-icon.png          # App launcher icon
├── android/                   # Android native config
└── pubspec.yaml               # Dependencies
```

---

## Screens

### Login Screen
- Email/username and password authentication
- Google OAuth login via WebView
- Facebook OAuth login via WebView
- Link to registration

### Register Screen
- New user registration form
- Password validation (8+ chars, uppercase, lowercase, special char)
- Auto-login after registration

### Home Screen/Dash
- Dashboard with active workflows
- Quick stats and recent activity
- Navigation to other screens

### Services Screen
- List of available services (Gmail, Drive, Facebook, GitHub, Spotify)
- OAuth connection status for each service
- Connect/disconnect services via WebView

### Create Workflow Screen
- Action selection from connected services
- Reaction selection
- Configuration forms for action/reaction parameters
- Workflow naming and activation

### Profile Screen
- User information display
- Email update
- Account deletion
- Logout

### Admin Screen
- User management (admin only)
- View all users and their workflows
- System statistics

### OAuth WebView Screen
- Embedded browser for OAuth flows
- Handles callback URLs and token extraction
- Returns to app after successful authentication

---

## API Integration

The mobile app communicates with the Flask backend at `http://localhost:8080` (configurable).

### Authentication Flow

1. User enters credentials or initiates OAuth
2. App receives JWT token
3. Token stored in `SharedPreferences`
4. Token included in all subsequent API requests

### API Service

The `api_service.dart` handles all HTTP communication:

```dart
// Example API call structure
Future<Response> get(String endpoint) async {
  final token = await StorageService.getToken();
  return http.get(
    Uri.parse('$baseUrl$endpoint'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );
}
```

---

## Building the APK

### Using Docker (Recommended)

The APK is automatically built when running Docker Compose:

```bash
docker-compose up --build
```

The APK will be available at:
- **Web download:** `http://localhost:8081/client.apk`
- **Container path:** `/build/client.apk`

### Manual Build

Prerequisites:
- Flutter SDK 3.24.5
- Android SDK (API 34)
- Java 17

```bash
cd client/apk

# Install dependencies
flutter pub get

# Generate launcher icons
flutter pub run flutter_launcher_icons

# Build release APK
flutter build apk --release

# APK location
ls build/app/outputs/flutter-apk/app-release.apk
```

---

## Docker Build Configuration

The mobile build uses a dedicated Dockerfile (`client/Dockerfile.mobile`) with:

- **Base image:** Ubuntu 22.04
- **Flutter version:** 3.24.5 (pinned for stability)
- **Android SDK:** API 34, Build Tools 34.0.0
- **Java:** OpenJDK 17
- **Gradle memory:** 4GB (`-Xmx4096m`)

### Build Optimization

Gradle is configured for faster builds:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseSerialGC
org.gradle.daemon=false
org.gradle.parallel=false
```

> **Note:** If your machine has limited RAM, modify `-Xmx4096m` in `client/Dockerfile.mobile`.

---

## APK Download

The APK can be downloaded from the web client:

1. Navigate to `http://localhost:8081`
2. Click the download button or navigate to `/client.apk`
3. Install on Android device (enable "Unknown sources" in settings)

### Direct Download

```bash
curl -O http://localhost:8081/client.apk
```

---

## Configuration

### API Base URL

The API base URL is configured in `api_service.dart`. For production, update this to your server's public URL.

### App Icon

The launcher icon is configured in `pubspec.yaml`:

```yaml
flutter_launcher_icons:
  android: true
  ios: false
  image_path: "assets/area-icon.png"
  min_sdk_android: 21
```

To update the icon:
1. Replace `assets/area-icon.png` with your icon (1024x1024 recommended)
2. Run `flutter pub run flutter_launcher_icons`
3. Rebuild the APK

---

## Troubleshooting

### APK Not Updating

If the APK shows old content after rebuilding:

```bash
# Clear all Docker caches and volumes
docker builder prune -f
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### OAuth Login Fails

- Ensure the server is running and accessible
- Check that OAuth redirect URIs include mobile callback URLs
- Verify WebView has internet permission in AndroidManifest.xml

### Build Fails

- Ensure sufficient disk space (Flutter build requires ~10GB)
- Check Gradle memory settings if build runs out of memory
- Verify Android SDK licenses are accepted

---

## Related Documentation

- [Tech Stack](./tech-stack.md)
- [Configuration](./configuration.md)
- [API Authentication](./api-authentication.md)
