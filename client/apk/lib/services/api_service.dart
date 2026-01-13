import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

class ApiService {
  // Get base URL with stored IP
  static Future<String> getBaseUrl() async {
    final serverIp = await StorageService.getServerIp();
    return 'http://$serverIp/api';
  }

  // Login endpoint
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final baseUrl = await getBaseUrl();
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'token': data['token'],
          'user': data['user'],
        };
      } else {
        return {
          'success': false,
          'error': data['error'] ?? 'Login failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }

  // Register endpoint
  static Future<Map<String, dynamic>> register(
    String username,
    String email,
    String password,
  ) async {
    try {
      final baseUrl = await getBaseUrl();
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return {
          'success': true,
          'token': data['token'],
          'user': data['user'],
        };
      } else {
        return {
          'success': false,
          'error': data['error'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }

  // Get current user (with auth token)
  static Future<Map<String, dynamic>> getCurrentUser(String token) async {
    try {
      final baseUrl = await getBaseUrl();
      final response = await http.get(
        Uri.parse('$baseUrl/auth/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'user': data['user'],
        };
      } else {
        return {
          'success': false,
          'error': data['error'] ?? 'Failed to get user info',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }

  // Get dashboard stats
  static Future<Map<String, dynamic>> getDashboardStats(String token) async {
    try {
      final baseUrl = await getBaseUrl();

      // Fetch total workflows
      final totalResponse = await http.get(
        Uri.parse('$baseUrl/areas'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      // Fetch active workflows
      final activeResponse = await http.get(
        Uri.parse('$baseUrl/areas?is_active=true'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      // Fetch connected services
      final connectionsResponse = await http.get(
        Uri.parse('$baseUrl/connections'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (totalResponse.statusCode == 200 &&
          activeResponse.statusCode == 200 &&
          connectionsResponse.statusCode == 200) {

        final totalData = jsonDecode(totalResponse.body);
        final activeData = jsonDecode(activeResponse.body);
        final connectionsData = jsonDecode(connectionsResponse.body);

        // Count connected services
        int connectedCount = 0;
        if (connectionsData['connections'] != null) {
          for (var conn in connectionsData['connections']) {
            if (conn['is_connected'] == true) {
              connectedCount++;
            }
          }
        }

        return {
          'success': true,
          'total_workflows': totalData['total'] ?? 0,
          'active_workflows': activeData['total'] ?? 0,
          'connected_services': connectedCount,
        };
      } else {
        return {
          'success': false,
          'error': 'Failed to fetch dashboard stats',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: ${e.toString()}',
      };
    }
  }
}
