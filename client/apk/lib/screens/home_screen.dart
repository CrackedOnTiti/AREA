import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _ipController = TextEditingController();

  int _totalWorkflows = 0;
  int _activeWorkflows = 0;
  int _connectedServices = 0;
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    _loadServerIp();
    _loadDashboardStats();
  }

  Future<void> _loadServerIp() async {
    final ip = await StorageService.getServerIp();
    _ipController.text = ip;
  }

  Future<void> _loadDashboardStats() async {
    final token = await StorageService.getToken();
    if (token == null) {
      setState(() => _isLoadingStats = false);
      return;
    }

    final result = await ApiService.getDashboardStats(token);

    if (mounted && result['success']) {
      setState(() {
        _totalWorkflows = result['total_workflows'];
        _activeWorkflows = result['active_workflows'];
        _connectedServices = result['connected_services'];
        _isLoadingStats = false;
      });
    } else {
      setState(() => _isLoadingStats = false);
    }
  }

  @override
  void dispose() {
    _ipController.dispose();
    super.dispose();
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
                GestureDetector(
                  onTap: () {
                    print('Services tapped');
                    // TODO: Navigate to services screen
                  },
                  child: Text(
                    'Services',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                SizedBox(height: 20),

                // Divider
                Divider(color: Colors.white, thickness: 1),
                SizedBox(height: 20),

                // Profile Section
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => ProfileScreen()),
                    );
                  },
                  child: Text(
                    'Profile',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          print('Create workflow pressed');
          // TODO: Navigate to workflow creation screen
        },
        backgroundColor: Colors.white,
        shape: CircleBorder(),
        child: Text(
          '+',
          style: TextStyle(
            color: Colors.black,
            fontSize: 36,
            fontWeight: FontWeight.w300,
          ),
        ),
      ),
      body: Column(
        children: [
          // Top header container (no SafeArea to stick to very top)
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
                  // AREA logo on the left
                  Container(
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
          // Rest of the screen
          Expanded(
              child: RefreshIndicator(
                onRefresh: _loadDashboardStats,
                color: Colors.white,
                backgroundColor: Colors.black,
                child: SingleChildScrollView(
                  physics: AlwaysScrollableScrollPhysics(),
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Column(
                    children: [
                      // Total Workflows Card
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          border: Border.all(color: Colors.white, width: 1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Total Workflows',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 14,
                              ),
                            ),
                            SizedBox(height: 10),
                            _isLoadingStats
                                ? SizedBox(
                                    height: 36,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(
                                    '$_totalWorkflows',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ],
                        ),
                      ),
                      SizedBox(height: 20),

                      // Active Workflows Card
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          border: Border.all(color: Colors.white, width: 1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Active Workflows',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 14,
                              ),
                            ),
                            SizedBox(height: 10),
                            _isLoadingStats
                                ? SizedBox(
                                    height: 36,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(
                                    '$_activeWorkflows',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ],
                        ),
                      ),
                      SizedBox(height: 20),

                      // Connected Services Card
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          border: Border.all(color: Colors.white, width: 1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Connected Services',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 14,
                              ),
                            ),
                            SizedBox(height: 10),
                            _isLoadingStats
                                ? SizedBox(
                                    height: 36,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(
                                    '$_connectedServices',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          ],
        ),
    );
  }
}
