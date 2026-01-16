import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../widgets/universal_header.dart';
import '../widgets/universal_drawer.dart';
import 'home_screen.dart';

class AdminScreen extends StatefulWidget {
  @override
  _AdminScreenState createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  List<Map<String, dynamic>> _users = [];
  bool _isLoading = true;
  String? _selectedUserId;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    final token = await StorageService.getToken();
    if (token == null) {
      setState(() => _isLoading = false);
      return;
    }

    final result = await ApiService.getAdminUsers(token);

    if (mounted) {
      setState(() {
        if (result['success']) {
          _users = List<Map<String, dynamic>>.from(result['users'] ?? []);
        }
        _isLoading = false;
      });
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
          // Title
          Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              'Admin Panel',
              style: TextStyle(
                color: Colors.red,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          // Users list
          Expanded(
            child: _isLoading
                ? Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : _users.isEmpty
                    ? Center(
                        child: Text(
                          'No users found',
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadUsers,
                        color: Colors.white,
                        backgroundColor: Colors.black,
                        child: ListView.builder(
                          padding: EdgeInsets.symmetric(horizontal: 20),
                          itemCount: _users.length,
                          itemBuilder: (context, index) {
                            final user = _users[index];
                            return _buildUserCard(user);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    final userId = user['id']?.toString() ?? '';
    final username = user['username'] ?? '';
    final email = user['email'] ?? '';
    final workflowCount = user['workflow_count'] ?? 0;
    final isExpanded = _selectedUserId == userId;

    return Container(
      margin: EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border.all(color: Colors.white, width: 1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          // User info row
          InkWell(
            onTap: () {
              setState(() {
                _selectedUserId = isExpanded ? null : userId;
              });
            },
            child: Padding(
              padding: EdgeInsets.all(15),
              child: Row(
                children: [
                  // User icon
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.grey[900],
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Icon(
                      Icons.person,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                  SizedBox(width: 15),
                  // User details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          username,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 5),
                        Text(
                          email,
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Workflow count badge
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: workflowCount > 0 ? Colors.green : Colors.grey[800],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$workflowCount workflows',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                  // Expand arrow
                  Icon(
                    isExpanded ? Icons.expand_less : Icons.expand_more,
                    color: Colors.white,
                  ),
                ],
              ),
            ),
          ),
          // Expanded workflows section
          if (isExpanded) ...[
            Divider(color: Colors.white, thickness: 1, height: 1),
            _buildWorkflowsSection(user),
          ],
        ],
      ),
    );
  }

  Widget _buildWorkflowsSection(Map<String, dynamic> user) {
    final workflows = List<Map<String, dynamic>>.from(user['workflows'] ?? []);

    if (workflows.isEmpty) {
      return Padding(
        padding: EdgeInsets.all(15),
        child: Text(
          'No workflows',
          style: TextStyle(color: Colors.grey, fontSize: 14),
        ),
      );
    }

    return Column(
      children: workflows.map((workflow) {
        final name = workflow['name'] ?? 'Unnamed workflow';
        final isActive = workflow['is_active'] ?? false;
        final workflowId = workflow['id'];

        return Container(
          padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: Colors.grey[800]!, width: 1),
            ),
          ),
          child: Row(
            children: [
              // Workflow status indicator
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: isActive ? Colors.green : Colors.red,
                  shape: BoxShape.circle,
                ),
              ),
              SizedBox(width: 15),
              // Workflow name
              Expanded(
                child: Text(
                  name,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                ),
              ),
              // Toggle button
              Switch(
                value: isActive,
                onChanged: (value) => _toggleWorkflow(workflowId, value),
                activeColor: Colors.green,
                inactiveThumbColor: Colors.red,
              ),
              // Delete button
              IconButton(
                icon: Icon(Icons.delete, color: Colors.red, size: 20),
                onPressed: () => _deleteWorkflow(workflowId),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Future<void> _toggleWorkflow(int workflowId, bool isActive) async {
    final token = await StorageService.getToken();
    if (token == null) return;

    final result = await ApiService.toggleWorkflow(token, workflowId, isActive);

    if (result['success']) {
      _loadUsers(); // Refresh
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? 'Failed to toggle workflow'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _deleteWorkflow(int workflowId) async {
    // Show confirmation dialog
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.black,
        title: Text('Delete Workflow', style: TextStyle(color: Colors.white)),
        content: Text(
          'Are you sure you want to delete this workflow?',
          style: TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final token = await StorageService.getToken();
    if (token == null) return;

    final result = await ApiService.deleteWorkflow(token, workflowId);

    if (result['success']) {
      _loadUsers(); // Refresh
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Workflow deleted'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? 'Failed to delete workflow'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
