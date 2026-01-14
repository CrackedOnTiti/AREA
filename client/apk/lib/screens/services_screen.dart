import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import '../widgets/universal_header.dart';
import '../widgets/universal_drawer.dart';
import 'home_screen.dart';

class ServicesScreen extends StatefulWidget {
  @override
  _ServicesScreenState createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  List<Map<String, dynamic>> _services = [];
  bool _isLoading = true;
  String? _swipedServiceName;

  // Map service names to icon assets
  final Map<String, String> _serviceIcons = {
    'gmail': 'assets/gmail-icon.png',
    'drive': 'assets/googleDrive-icon.png',
    'facebook': 'assets/facebook2-icon.png',
    'github': 'assets/github-icon.png',
    'spotify': 'assets/spotify-icon.png',
  };

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    final token = await StorageService.getToken();
    if (token == null) {
      setState(() => _isLoading = false);
      return;
    }

    final result = await ApiService.getServices(token);

    if (mounted && result['success']) {
      // Filter to only show OAuth services
      final allServices = result['services'] as List;
      final oauthServices = allServices
          .where((service) => service['requires_oauth'] == true)
          .toList();

      setState(() {
        _services = List<Map<String, dynamic>>.from(oauthServices);
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.black,
      endDrawer: UniversalDrawer(),
      body: Column(
        children: [
          // Universal header
          UniversalHeader(
            scaffoldKey: _scaffoldKey,
            onLogoTap: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => HomeScreen()),
                (route) => false,
              );
            },
          ),
          // Services list
          Expanded(
            child: _isLoading
                ? Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : _services.isEmpty
                    ? Center(
                        child: Text(
                          'No services available',
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadServices,
                        color: Colors.white,
                        backgroundColor: Colors.black,
                        child: ListView.builder(
                          padding: EdgeInsets.all(20),
                          itemCount: _services.length,
                          itemBuilder: (context, index) {
                            final service = _services[index];
                            return _buildServiceCard(service);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(Map<String, dynamic> service) {
    final serviceName = service['name'] ?? '';
    final displayName = service['display_name'] ?? serviceName;
    final description = service['description'] ?? '';
    final isConnected = service['is_connected'] ?? false;
    final iconPath = _serviceIcons[serviceName] ?? 'assets/profile-icon.png';
    final isSwiped = _swipedServiceName == serviceName;

    return Container(
      margin: EdgeInsets.only(bottom: 15),
      child: Stack(
        children: [
          // Background buttons (revealed when swiped)
          Container(
            height: 100,
            decoration: BoxDecoration(
              color: Colors.black,
              border: Border.all(color: Colors.white, width: 1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // Vertical circular buttons
                Container(
                  margin: EdgeInsets.only(right: 15),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Connect/Disconnect button (top)
                      GestureDetector(
                        onTap: () {
                          setState(() => _swipedServiceName = null);
                          _handleConnectionToggle(service);
                        },
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isConnected ? Colors.red : Colors.green,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isConnected ? Icons.close : Icons.check,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                      // Details button (bottom)
                      GestureDetector(
                        onTap: () {
                          setState(() => _swipedServiceName = null);
                          _showServiceDetails(service);
                        },
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.grey[800],
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.assignment,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Foreground card (slides to reveal background)
          GestureDetector(
            onTap: () {
              setState(() {
                if (isSwiped) {
                  _swipedServiceName = null;
                } else {
                  _swipedServiceName = serviceName;
                }
              });
            },
            child: AnimatedContainer(
              duration: Duration(milliseconds: 200),
              transform: Matrix4.translationValues(isSwiped ? -70 : 0, 0, 0),
              height: 100,
              child: Container(
                padding: EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.black,
                  border: Border.all(color: Colors.white, width: 1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    // Service icon
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: Colors.grey[900],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: EdgeInsets.all(8),
                      child: Image.asset(
                        iconPath,
                        fit: BoxFit.contain,
                      ),
                    ),
                    SizedBox(width: 15),
                    // Service info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            displayName,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 5),
                          Text(
                            description,
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    SizedBox(width: 10),
                    // Connection status
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isConnected ? Colors.green : Colors.grey[800],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        isConnected ? 'Connected' : 'Not Connected',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleConnectionToggle(Map<String, dynamic> service) {
    final displayName = service['display_name'] ?? '';
    final isConnected = service['is_connected'] ?? false;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isConnected
              ? 'Disconnect $displayName - OAuth not implemented yet'
              : 'Connect $displayName - OAuth not implemented yet',
        ),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _showServiceDetails(Map<String, dynamic> service) {
    final displayName = service['display_name'] ?? '';
    final description = service['description'] ?? '';

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.black,
          title: Text(
            displayName,
            style: TextStyle(color: Colors.white),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                description,
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              SizedBox(height: 20),
              Text(
                'Available actions and reactions will be shown here once implemented.',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Close', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
