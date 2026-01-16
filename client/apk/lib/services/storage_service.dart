import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _serverIpKey = 'server_ip';
  static const String _defaultIp = '10.102.254.28:8080';

  // Save authentication token
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // Get saved token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Delete token (logout)
  static Future<void> deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Save user data
  static Future<void> saveUserData(String username, String email, {int? userId}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, '$username|$email|${userId ?? 0}');
  }

  // Get user data
  static Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_userKey);
    if (data != null) {
      final parts = data.split('|');
      if (parts.length >= 2) {
        return {
          'username': parts[0],
          'email': parts[1],
          'id': parts.length > 2 ? int.tryParse(parts[2]) ?? 0 : 0,
        };
      }
    }
    return null;
  }

  // Check if current user is admin
  static Future<bool> isAdmin() async {
    final userData = await getUserData();
    if (userData != null) {
      return userData['id'] == 1 && userData['username'] == 'admin';
    }
    return false;
  }

  // Save server IP
  static Future<void> saveServerIp(String ip) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_serverIpKey, ip);
  }

  // Get server IP (returns default if not set)
  static Future<String> getServerIp() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_serverIpKey) ?? _defaultIp;
  }
}
