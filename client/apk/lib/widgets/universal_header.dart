import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class UniversalHeader extends StatelessWidget {
  final GlobalKey<ScaffoldState> scaffoldKey;
  final VoidCallback? onLogoTap;

  const UniversalHeader({
    Key? key,
    required this.scaffoldKey,
    this.onLogoTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
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
          GestureDetector(
            onTap: onLogoTap,
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
              scaffoldKey.currentState?.openEndDrawer();
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
    );
  }
}
