import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/register_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: LoginScreen(),
    );
  }
}

class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [

                      // AREA box on left
                Transform.scale(
                  scale: 1.5,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 5, vertical: 5),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white, width: 3),
                    ),
                    child: Text(
                      'AR\nEA',
                      style: GoogleFonts.russoOne(
                        fontSize: 48,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        height: 0.8,
                        letterSpacing: 5,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 60),

                // Login form on right
                Expanded(
                  child: Stack(
                    children: [
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Email field
                          TextField(
                            style: TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Email',
                              hintStyle: TextStyle(color: Colors.grey),
                              enabledBorder: UnderlineInputBorder(
                                borderSide: BorderSide(color: Colors.white),
                              ),
                              focusedBorder: UnderlineInputBorder(
                                borderSide: BorderSide(color: Colors.white),
                              ),
                            ),
                          ),
                          SizedBox(height: 20),

                          // Password field
                          TextField(
                            obscureText: true,
                            style: TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Password',
                              hintStyle: TextStyle(color: Colors.grey),
                              enabledBorder: UnderlineInputBorder(
                                borderSide: BorderSide(color: Colors.white),
                              ),
                              focusedBorder: UnderlineInputBorder(
                                borderSide: BorderSide(color: Colors.white),
                              ),
                            ),
                          ),
                          SizedBox(height: 40),

                          // Login button
                          ElevatedButton(
                            onPressed: () {
                              print('Login pressed');
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: Colors.black,
                              minimumSize: Size(double.infinity, 50),
                            ),
                            child: Text('Login', style: TextStyle(fontSize: 18)),
                          ),
                        ],
                      ),

                      // OAuth icons - positioned independently below button
                      Positioned(
                        bottom: 250,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            MouseRegion(
                              cursor: SystemMouseCursors.click,
                              child: GestureDetector(
                                onTap: () {
                                  print('Google login pressed');
                                },
                                child: Opacity(
                                  opacity: 1.0,
                                  child: Image.asset(
                                    'assets/google-icon.png',
                                    width: 50,
                                    height: 50,
                                    filterQuality: FilterQuality.high,
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(width: 20),
                            MouseRegion(
                              cursor: SystemMouseCursors.click,
                              child: GestureDetector(
                                onTap: () {
                                  print('Facebook login pressed');
                                },
                                child: Opacity(
                                  opacity: 1.0,
                                  child: Image.asset(
                                    'assets/facebook-icon.png',
                                    width: 50,
                                    height: 50,
                                    filterQuality: FilterQuality.high,
                                  ),
                                ),
                              ),
                            ),
                          ],
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
      Padding(
        padding: EdgeInsets.only(bottom: 20),
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => RegisterScreen()),
              );
            },
            child: Text(
              'Create a Account | Forgot password',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 12,
                fontWeight: FontWeight.w300,
                decoration: TextDecoration.underline,
                decorationColor: Colors.grey.withOpacity(0),
              ),
            ),
          ),
        ),
      ),
    ],
  ),
),
    );
  }
}
