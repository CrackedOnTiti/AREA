import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/storage_service.dart';
import 'dart:convert';

class OAuthWebViewScreen extends StatefulWidget {
  final String provider; // google or facebook
  final String title;

  const OAuthWebViewScreen({
    Key? key,
    required this.provider,
    required this.title,
  }) : super(key: key);

  @override
  _OAuthWebViewScreenState createState() => _OAuthWebViewScreenState();
}

class _OAuthWebViewScreenState extends State<OAuthWebViewScreen> {
  late WebViewController _controller;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  Future<void> _initializeWebView() async {
    final serverIp = await StorageService.getServerIp();
    final oauthUrl = 'http://$serverIp/api/auth/${widget.provider}/login';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            print('Page started loading: $url');
          },
          onPageFinished: (String url) async {
            setState(() => _isLoading = false);
            print('Page finished loading: $url');

            // Check if we're on the callback page
            if (url.contains('/api/auth/${widget.provider}/callback')) {
              // Give it a moment to finish processing
              await Future.delayed(Duration(milliseconds: 500));

              // Try to extract response from page content
              try {
                final content = await _controller.runJavaScriptReturningResult(
                  'document.body.innerText',
                );
                print('Page content: $content');

                // Parse the response
                final responseText = content.toString().replaceAll('"', '');
                if (responseText.contains('token')) {
                  try {
                    final jsonData = jsonDecode(responseText);
                    if (jsonData['token'] != null) {
                      _handleSuccess(jsonData);
                      return;
                    }
                  } catch (e) {
                    print('Error parsing JSON: $e');
                  }
                }

                // If can't parse -> success and close
                await Future.delayed(Duration(milliseconds: 1000));
                if (mounted) {
                  Navigator.pop(context, {'success': true, 'needsRefresh': true});
                }
              } catch (e) {
                print('Error extracting page content: $e');
              }
            }
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _isLoading = false;
              _errorMessage = 'Error loading page: ${error.description}';
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(oauthUrl));

    setState(() {});
  }

  void _handleSuccess(Map<String, dynamic> data) async {
    await StorageService.saveToken(data['token']);
    if (data['user'] != null) {
      await StorageService.saveUserData(
        data['user']['username'] ?? '',
        data['user']['email'] ?? '',
      );
    }

    if (mounted) {
      Navigator.pop(context, {'success': true, 'token': data['token']});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text(
          widget.title,
          style: TextStyle(color: Colors.white),
        ),
        leading: IconButton(
          icon: Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          if (_errorMessage != null)
            Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _errorMessage!,
                      style: TextStyle(color: Colors.red, fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text('Close'),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
