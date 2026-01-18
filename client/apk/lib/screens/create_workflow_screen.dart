import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../widgets/universal_header.dart';
import '../widgets/universal_drawer.dart';
import 'home_screen.dart';

class CreateWorkflowScreen extends StatefulWidget {
  @override
  _CreateWorkflowScreenState createState() => _CreateWorkflowScreenState();
}

class _CreateWorkflowScreenState extends State<CreateWorkflowScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _nameController = TextEditingController();

  List<Map<String, dynamic>> _services = [];
  List<Map<String, dynamic>> _connections = [];
  bool _isLoading = true;
  bool _isCreating = false;

  // Flat lists of all actions/reactions with service info
  List<Map<String, dynamic>> _allActions = [];
  List<Map<String, dynamic>> _allReactions = [];

  // Connected service names (lowercase for matching)
  Set<String> _connectedServices = {};

  // Selected IDs
  int? _selectedActionId;
  int? _selectedReactionId;

  // Config values
  Map<String, TextEditingController> _actionConfigControllers = {};
  Map<String, TextEditingController> _reactionConfigControllers = {};

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _actionConfigControllers.values.forEach((c) => c.dispose());
    _reactionConfigControllers.values.forEach((c) => c.dispose());
    super.dispose();
  }

  Future<void> _loadServices() async {
    final token = await StorageService.getToken();
    if (token == null) {
      setState(() => _isLoading = false);
      return;
    }

    // Load both services and connections
    final servicesResult = await ApiService.getServices(token);
    final connectionsResult = await ApiService.getConnections(token);

    if (mounted) {
      setState(() {
        if (servicesResult['success']) {
          _services = List<Map<String, dynamic>>.from(servicesResult['services'] ?? []);
          _buildFlatLists();
        }
        if (connectionsResult['success']) {
          _connections = List<Map<String, dynamic>>.from(connectionsResult['connections'] ?? []);
          _buildConnectedServices();
        }
        _isLoading = false;
      });
    }
  }

  void _buildConnectedServices() {
    _connectedServices = {};
    for (var conn in _connections) {
      if (conn['is_connected'] == true) {
        // Store service name in lowercase for case-insensitive matching
        final serviceName = (conn['service_name'] ?? '').toString().toLowerCase();
        _connectedServices.add(serviceName);
      }
    }
  }

  void _buildFlatLists() {
    _allActions = [];
    _allReactions = [];

    for (var service in _services) {
      final serviceDisplayName = service['display_name'] ?? service['name'] ?? '';
      final serviceInternalName = (service['name'] ?? '').toString().toLowerCase();
      final actions = List<Map<String, dynamic>>.from(service['actions'] ?? []);
      final reactions = List<Map<String, dynamic>>.from(service['reactions'] ?? []);

      for (var action in actions) {
        _allActions.add({
          ...action,
          '_service_display_name': serviceDisplayName,
          '_service_internal_name': serviceInternalName,
          '_display': '$serviceDisplayName: ${action['display_name'] ?? action['name']}',
        });
      }

      for (var reaction in reactions) {
        _allReactions.add({
          ...reaction,
          '_service_display_name': serviceDisplayName,
          '_service_internal_name': serviceInternalName,
          '_display': '$serviceDisplayName: ${reaction['display_name'] ?? reaction['name']}',
        });
      }
    }
  }

  bool _isServiceConnected(String serviceInternalName) {
    return _connectedServices.contains(serviceInternalName.toLowerCase());
  }

  Map<String, dynamic>? _getActionById(int? id) {
    if (id == null) return null;
    try {
      return _allActions.firstWhere((a) => a['id'] == id);
    } catch (e) {
      return null;
    }
  }

  Map<String, dynamic>? _getReactionById(int? id) {
    if (id == null) return null;
    try {
      return _allReactions.firstWhere((r) => r['id'] == id);
    } catch (e) {
      return null;
    }
  }

  void _onActionChanged(int? actionId) {
    // Dispose old controllers
    _actionConfigControllers.values.forEach((c) => c.dispose());
    _actionConfigControllers = {};

    setState(() {
      _selectedActionId = actionId;

      // Create new controllers for config schema
      final action = _getActionById(actionId);
      if (action != null && action['config_schema'] != null) {
        final schema = action['config_schema'] as Map<String, dynamic>;
        final properties = schema['properties'] as Map<String, dynamic>? ?? {};

        for (var key in properties.keys) {
          _actionConfigControllers[key] = TextEditingController();
        }
      }
    });
  }

  void _onReactionChanged(int? reactionId) {
    // Dispose old controllers
    _reactionConfigControllers.values.forEach((c) => c.dispose());
    _reactionConfigControllers = {};

    setState(() {
      _selectedReactionId = reactionId;

      // Create new controllers for config schema
      final reaction = _getReactionById(reactionId);
      if (reaction != null && reaction['config_schema'] != null) {
        final schema = reaction['config_schema'] as Map<String, dynamic>;
        final properties = schema['properties'] as Map<String, dynamic>? ?? {};

        for (var key in properties.keys) {
          _reactionConfigControllers[key] = TextEditingController();
        }
      }
    });
  }

  Widget _buildConfigFields(
    Map<String, dynamic>? item,
    Map<String, TextEditingController> controllers,
    String label,
  ) {
    if (item == null || item['config_schema'] == null) {
      return SizedBox.shrink();
    }

    final schema = item['config_schema'] as Map<String, dynamic>;
    final properties = schema['properties'] as Map<String, dynamic>? ?? {};

    if (properties.isEmpty) {
      return SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 15),
        Text(
          '$label Configuration',
          style: TextStyle(
            color: Colors.grey,
            fontSize: 14,
          ),
        ),
        SizedBox(height: 10),
        ...properties.entries.map((entry) {
          final key = entry.key;
          final prop = entry.value as Map<String, dynamic>;
          final description = prop['description'] ?? key;
          final isTextArea = (prop['maxLength'] ?? 0) > 200;

          return Padding(
            padding: EdgeInsets.only(bottom: 10),
            child: TextField(
              controller: controllers[key],
              maxLines: isTextArea ? 3 : 1,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: key,
                hintText: description,
                labelStyle: TextStyle(color: Colors.grey),
                hintStyle: TextStyle(color: Colors.grey[600]),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white),
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.white, width: 2),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Map<String, dynamic> _getConfigValues(Map<String, TextEditingController> controllers) {
    Map<String, dynamic> config = {};
    controllers.forEach((key, controller) {
      config[key] = controller.text;
    });
    return config;
  }

  Future<void> _createWorkflow() async {
    final name = _nameController.text.trim();

    if (name.isEmpty) {
      _showError('Please enter a workflow name');
      return;
    }

    if (_selectedActionId == null) {
      _showError('Please select an action');
      return;
    }

    if (_selectedReactionId == null) {
      _showError('Please select a reaction');
      return;
    }

    // Check if required services are connected
    final action = _getActionById(_selectedActionId);
    final reaction = _getReactionById(_selectedReactionId);

    if (action != null) {
      final actionService = action['_service_internal_name'] as String;
      if (!_isServiceConnected(actionService)) {
        final displayName = action['_service_display_name'] ?? actionService;
        _showError('You must connect to $displayName first to use this action');
        return;
      }
    }

    if (reaction != null) {
      final reactionService = reaction['_service_internal_name'] as String;
      if (!_isServiceConnected(reactionService)) {
        final displayName = reaction['_service_display_name'] ?? reactionService;
        _showError('You must connect to $displayName first to use this reaction');
        return;
      }
    }

    setState(() => _isCreating = true);

    final token = await StorageService.getToken();
    if (token == null) {
      _showError('Not authenticated');
      setState(() => _isCreating = false);
      return;
    }

    final actionConfig = _getConfigValues(_actionConfigControllers);
    final reactionConfig = _getConfigValues(_reactionConfigControllers);

    final result = await ApiService.createWorkflow(
      token,
      name,
      _selectedActionId!,
      _selectedReactionId!,
      actionConfig,
      reactionConfig,
    );

    setState(() => _isCreating = false);

    if (result['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Workflow created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // Return true to indicate refresh needed
      }
    } else {
      _showError(result['error'] ?? 'Failed to create workflow');
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedAction = _getActionById(_selectedActionId);
    final selectedReaction = _getReactionById(_selectedReactionId);

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
                        // Title
                        Text(
                          'Create Workflow',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 30),

                        // Workflow Name
                        Text(
                          'Workflow Name',
                          style: TextStyle(color: Colors.grey, fontSize: 14),
                        ),
                        SizedBox(height: 10),
                        TextField(
                          controller: _nameController,
                          style: TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'Enter workflow name',
                            hintStyle: TextStyle(color: Colors.grey[600]),
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.white),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.white, width: 2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                        SizedBox(height: 30),

                        // Action Section
                        Text(
                          'Action (Trigger)',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 10),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 15),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButton<int>(
                            value: _selectedActionId,
                            hint: Text(
                              _connectedServices.isEmpty
                                  ? 'Connect a service first...'
                                  : 'Select an action...',
                              style: TextStyle(color: Colors.grey),
                            ),
                            isExpanded: true,
                            dropdownColor: Colors.black,
                            underline: SizedBox(),
                            items: _allActions
                                .where((action) => _isServiceConnected(
                                      action['_service_internal_name'] as String,
                                    ))
                                .map((action) {
                              return DropdownMenuItem<int>(
                                value: action['id'] as int,
                                child: Text(
                                  action['_display'] as String,
                                  style: TextStyle(color: Colors.white),
                                ),
                              );
                            }).toList(),
                            onChanged: _onActionChanged,
                          ),
                        ),
                        _buildConfigFields(selectedAction, _actionConfigControllers, 'Action'),
                        SizedBox(height: 30),

                        // Reaction Section
                        Text(
                          'Reaction (Response)',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 10),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 15),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButton<int>(
                            value: _selectedReactionId,
                            hint: Text(
                              _connectedServices.isEmpty
                                  ? 'Connect a service first...'
                                  : 'Select a reaction...',
                              style: TextStyle(color: Colors.grey),
                            ),
                            isExpanded: true,
                            dropdownColor: Colors.black,
                            underline: SizedBox(),
                            items: _allReactions
                                .where((reaction) => _isServiceConnected(
                                      reaction['_service_internal_name'] as String,
                                    ))
                                .map((reaction) {
                              return DropdownMenuItem<int>(
                                value: reaction['id'] as int,
                                child: Text(
                                  reaction['_display'] as String,
                                  style: TextStyle(color: Colors.white),
                                ),
                              );
                            }).toList(),
                            onChanged: _onReactionChanged,
                          ),
                        ),
                        _buildConfigFields(selectedReaction, _reactionConfigControllers, 'Reaction'),
                        SizedBox(height: 40),

                        // Create Button
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: _isCreating ? null : _createWorkflow,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: _isCreating
                                ? SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                                    ),
                                  )
                                : Text(
                                    'Create Workflow',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                        ),
                        SizedBox(height: 20),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
