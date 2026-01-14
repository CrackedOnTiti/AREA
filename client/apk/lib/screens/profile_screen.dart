import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import '../widgets/universal_header.dart';
import '../widgets/universal_drawer.dart';
import 'home_screen.dart';

class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  String _username = '';
  String _email = '';
  String _serverIp = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadServerIp();
    _loadUserData();
  }

  Future<void> _loadServerIp() async {
    final ip = await StorageService.getServerIp();
    if (mounted) {
      setState(() {
        _serverIp = ip;
      });
    }
  }

  Future<void> _showIpDialog() async {
    final currentIp = await StorageService.getServerIp();
    final ipController = TextEditingController(text: currentIp);

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.black,
          title: Text(
            'Server IP Configuration',
            style: TextStyle(color: Colors.white),
          ),
          content: TextField(
            controller: ipController,
            style: TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Enter server IP:port',
              hintStyle: TextStyle(color: Colors.grey),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.white),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.white, width: 2),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () async {
                await StorageService.saveServerIp(ipController.text.trim());
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Server IP updated to ${ipController.text.trim()}'),
                      backgroundColor: Colors.green,
                    ),
                  );
                  // Reload the displayed IP
                  _loadServerIp();
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
              ),
              child: Text('Save'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _loadUserData() async {
    final token = await StorageService.getToken();
    if (token == null) {
      setState(() => _isLoading = false);
      return;
    }

    final result = await ApiService.getCurrentUser(token);

    if (mounted && result['success']) {
      setState(() {
        _username = result['user']['username'] ?? '';
        _email = result['user']['email'] ?? '';
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
          // Profile content
          Expanded(
            child: _isLoading
                ? Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : SingleChildScrollView(
                    padding: EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Profile header with icon and username
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Profile icon
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                              child: Image.asset(
                                'assets/profile-icon.png',
                                fit: BoxFit.cover,
                              ),
                            ),
                            SizedBox(width: 20),
                            // Username
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _username.toUpperCase(),
                                    style: GoogleFonts.russoOne(
                                      color: Colors.white,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 40),

                        // Email field with Edit button
                        _buildInfoRow('Email', _email, () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Edit email - coming soon'),
                              backgroundColor: Colors.orange,
                            ),
                          );
                        }),

                        // Password field with Edit button
                        _buildInfoRow('Password', '••••••••', () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Edit password - coming soon'),
                              backgroundColor: Colors.orange,
                            ),
                          );
                        }),

                        // Server IP field with Edit button
                        _buildInfoRow('Server IP', _serverIp, () {
                          _showIpDialog();
                        }),

                        SizedBox(height: 40),

                        // Reset Workflows Button
                        ElevatedButton(
                          onPressed: () => _showResetWorkflowsDialog(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: Colors.white,
                            minimumSize: Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text(
                            'Reset this account\'s Workflows',
                            style: TextStyle(fontSize: 16),
                          ),
                        ),
                        SizedBox(height: 15),

                        // Reset Services Button
                        ElevatedButton(
                          onPressed: () => _showResetServicesDialog(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: Colors.white,
                            minimumSize: Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text(
                            'Reset Services',
                            style: TextStyle(fontSize: 16),
                          ),
                        ),
                        SizedBox(height: 15),

                        // Reset All Button
                        ElevatedButton(
                          onPressed: () => _showResetAllDialog(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: Colors.white,
                            minimumSize: Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text(
                            'Reset All',
                            style: TextStyle(fontSize: 16),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, VoidCallback onEditPressed) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 15),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 14,
                ),
              ),
              SizedBox(height: 5),
              Text(
                value,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          TextButton(
            onPressed: onEditPressed,
            style: TextButton.styleFrom(
              foregroundColor: Colors.white,
              side: BorderSide(color: Colors.white, width: 1),
              padding: EdgeInsets.symmetric(horizontal: 15, vertical: 8),
            ),
            child: Text('Edit'),
          ),
        ],
      ),
    );
  }

  Future<void> _showResetWorkflowsDialog() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.black,
          title: Text(
            'Reset Workflows',
            style: TextStyle(color: Colors.white),
          ),
          content: Text(
            'Are you sure you want to delete all your workflows? This action cannot be undone.',
            style: TextStyle(color: Colors.white),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                // TODO: Implement workflow reset API call
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Reset workflows - coming soon'),
                    backgroundColor: Colors.orange,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: Text('Delete All'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _showResetServicesDialog() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.black,
          title: Text(
            'Reset Services',
            style: TextStyle(color: Colors.white),
          ),
          content: Text(
            'Are you sure you want to disconnect all services? This action cannot be undone.',
            style: TextStyle(color: Colors.white),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                // TODO: Implement services reset API call
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Reset services - coming soon'),
                    backgroundColor: Colors.orange,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: Text('Disconnect All'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _showResetAllDialog() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.black,
          title: Text(
            'Reset All',
            style: TextStyle(color: Colors.white),
          ),
          content: Text(
            'Are you sure you want to reset everything? This will delete all workflows and disconnect all services. This action cannot be undone.',
            style: TextStyle(color: Colors.white),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                // TODO: Implement reset all API call
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Reset all - coming soon'),
                    backgroundColor: Colors.orange,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: Text('Reset Everything'),
            ),
          ],
        );
      },
    );
  }
}
