import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'home_screen.dart';

class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _ipController = TextEditingController();

  String _username = '';
  String _email = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadServerIp();
    _loadUserData();
  }

  @override
  void dispose() {
    _ipController.dispose();
    super.dispose();
  }

  Future<void> _loadServerIp() async {
    final ip = await StorageService.getServerIp();
    _ipController.text = ip;
  }

  Future<void> _saveServerIp() async {
    await StorageService.saveServerIp(_ipController.text.trim());
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Server IP updated to ${_ipController.text.trim()}'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _handleLogout(BuildContext context) async {
    await StorageService.deleteToken();
    if (context.mounted) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => LoginScreen(),
          transitionDuration: Duration.zero,
          reverseTransitionDuration: Duration.zero,
        ),
      );
    }
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
      endDrawer: Drawer(
        backgroundColor: Colors.black,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white, width: 1),
          ),
          child: SafeArea(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // IP Configuration Section
                Text(
                  'Server IP',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 10),
                TextField(
                  controller: _ipController,
                  style: TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Enter server IP',
                    hintStyle: TextStyle(color: Colors.grey),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.white, width: 2),
                    ),
                  ),
                ),
                SizedBox(height: 10),
                ElevatedButton(
                  onPressed: _saveServerIp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    minimumSize: Size(double.infinity, 40),
                  ),
                  child: Text('Save IP'),
                ),
                SizedBox(height: 20),

                // Divider
                Divider(color: Colors.white, thickness: 1),
                SizedBox(height: 20),

                // Services Section
                InkWell(
                  onTap: () {
                    print('Services tapped');
                    // TODO: Navigate to services screen
                  },
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Services',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 20),

                // Divider
                Divider(color: Colors.white, thickness: 1),
                SizedBox(height: 20),

                // Profile Section
                InkWell(
                  onTap: () {
                    Navigator.pop(context); // Close drawer, already on profile
                  },
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Profile',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 20),

                // Divider
                Divider(color: Colors.white, thickness: 1),

                Spacer(),

                // Logout Button at the bottom
                ElevatedButton(
                  onPressed: () => _handleLogout(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    minimumSize: Size(double.infinity, 50),
                  ),
                  child: Text('Logout', style: TextStyle(fontSize: 16)),
                ),
              ],
            ),
          ),
        ),
      ),
      ),
      body: Column(
        children: [
          // Universal header (same as home screen)
          Container(
            width: double.infinity,
            height: 80,
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 15,
              bottom: 15,
            ),
            decoration: BoxDecoration(
              color: Colors.black,
              border: Border.all(color: Colors.white, width: 1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // AREA logo on the left - tap to go to dashboard and reload
                GestureDetector(
                  onTap: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (context) => HomeScreen()),
                      (route) => false,
                    );
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 3, vertical: 3),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: Text(
                      'AR\nEA',
                      style: GoogleFonts.russoOne(
                        fontSize: 20,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        height: 0.8,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ),
                // Hamburger menu icon on the right
                InkWell(
                  onTap: () {
                    _scaffoldKey.currentState?.openEndDrawer();
                  },
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 25,
                          height: 3,
                          color: Colors.white,
                        ),
                        SizedBox(height: 4),
                        Container(
                          width: 25,
                          height: 3,
                          color: Colors.white,
                        ),
                        SizedBox(height: 4),
                        Container(
                          width: 25,
                          height: 3,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
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
