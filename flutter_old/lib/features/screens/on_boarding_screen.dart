import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:mobile_app/core/theme/app_text_styles.dart';

class OnBoardingScreen extends StatefulWidget {
  const OnBoardingScreen({super.key});

  @override
  State<OnBoardingScreen> createState() => _OnBoardingScreenState();
}

class _OnBoardingScreenState extends State<OnBoardingScreen> {
  late PageController _pageController;
  Timer? _timer;
  int _currentPage = 0;
  bool _showLogin = false; // Trạng thái kiểm soát việc hiển thị khung đăng nhập

  // Dữ liệu danh sách các địa điểm du lịch
  final List<Map<String, String>> _locations = [
    {
      'title': 'Đà Nẵng',
      'description':
          'Khám phá Cầu Vàng hùng vĩ và bãi biển Mỹ Khê - một trong những bãi biển đẹp nhất hành tinh.',
      'image': 'assets/images/dn_bg.jpg',
    },
    {
      'title': 'Huế',
      'description':
          'Kinh đô cổ kính với những di sản văn hóa thế giới và vẻ đẹp mộng mơ bên dòng sông Hương.',
      'image': 'assets/images/hue_bg.jpg',
    },
    {
      'title': 'Quy Nhơn',
      'description':
          'Thiên đường biển xanh với những bãi tắm hoang sơ, Kỳ Co - Eo Gió rực rỡ dưới ánh nắng.',
      'image': 'assets/images/quynhon_bg.jpg',
    },
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _startAutoSlider();
  }

  // Hàm tự động chuyển ảnh mỗi 4 giây
  void _startAutoSlider() {
    _timer = Timer.periodic(const Duration(seconds: 4), (Timer timer) {
      if (_showLogin) {
        return;
      }

      if (_currentPage < _locations.length - 1) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }

      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 1000),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            onPageChanged: (page) => setState(() => _currentPage = page),
            itemCount: _locations.length,
            itemBuilder: (context, index) {
              return Image.asset(
                _locations[index]['image']!,
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
              );
            },
          ),

          AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(_showLogin ? 0.7 : 0.4),
                  Colors.transparent,
                  Colors.black.withOpacity(_showLogin ? 0.9 : 0.8),
                ],
              ),
            ),
            child: _showLogin
                ? BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                    child: Container(color: Colors.transparent),
                  )
                : null,
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  SizedBox(
                    width: 40,
                    height: 40,
                    child: Image.asset(
                      'assets/logo/socialtravelbooking_logo.png',
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Tên ứng dụng
                  Text(
                    'Social Travel Booking',
                    style: AppTextStyles.heading.copyWith(color: Colors.white),
                  ),
                ],
              ),
            ),
          ),

          AnimatedPositioned(
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeOutCubic,
            bottom: _showLogin ? -200 : 130,
            left: 24,
            right: 24,
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 300),
              opacity: _showLogin ? 0 : 1,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _locations[_currentPage]['title']!,
                    style: AppTextStyles.display.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _locations[_currentPage]['description']!,
                    style: AppTextStyles.caption.copyWith(
                      color: Colors.white70,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (!_showLogin)
            Positioned(
              bottom: 40,
              left: 24,
              right: 24,
              child: SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: () => setState(() => _showLogin = true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF2994A),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    'Bắt đầu ngay',
                    style: AppTextStyles.heading.copyWith(color: Colors.white),
                  ),
                ),
              ),
            ),

          AnimatedPositioned(
            duration: const Duration(milliseconds: 600),
            curve: Curves.fastOutSlowIn,
            bottom: _showLogin ? 0 : -screenSize.height,
            left: 0,
            right: 0,
            child: Container(
              height: screenSize.height * 0.87,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
              ),
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Chào mừng bạn!',
                        style: AppTextStyles.display.copyWith(
                          fontSize: 28,
                          color: const Color(0xFF003366),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      // Nút đóng khung đăng nhập để quay lại Onboarding
                      IconButton(
                        onPressed: () => setState(() => _showLogin = false),
                        icon: const Icon(Icons.close, color: Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Đăng nhập để bắt đầu hành trình của bạn',
                    style: AppTextStyles.caption.copyWith(color: Colors.grey),
                  ),
                  const SizedBox(height: 32),

                  // Form nhập liệu
                  _buildTextField(
                    label: 'Email hoặc Số điện thoại',
                    icon: Icons.email_outlined,
                  ),
                  const SizedBox(height: 20),
                  _buildTextField(
                    label: 'Mật khẩu',
                    icon: Icons.lock_outline,
                    isPassword: true,
                  ),

                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {},
                      child: const Text(
                        'Quên mật khẩu?',
                        style: TextStyle(color: Color(0xFF003366)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF003366),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Đăng nhập',
                        style: TextStyle(color: Colors.white, fontSize: 18),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),
                  const Center(
                    child: Text(
                      'Hoặc đăng nhập với',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Đăng nhập qua mạng xã hội
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildSocialIcon(Icons.g_mobiledata, Colors.red),
                      const SizedBox(width: 20),
                      _buildSocialIcon(Icons.facebook, Colors.blue),
                      const SizedBox(width: 20),
                      _buildSocialIcon(Icons.apple, Colors.black),
                    ],
                  ),

                  const Spacer(),
                  Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Chưa có tài khoản?'),
                        TextButton(
                          onPressed: () {},
                          child: const Text(
                            'Đăng ký ngay',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFF2994A),
                            ),
                          ),
                        ),
                      ],
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

  // Hàm xây dựng các ô nhập liệu (Text Field)
  Widget _buildTextField({
    required String label,
    required IconData icon,
    bool isPassword = false,
  }) {
    return TextField(
      obscureText: isPassword,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF003366)),
        filled: true,
        fillColor: Colors.grey[100],
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  // Hàm xây dựng các biểu tượng mạng xã hội
  Widget _buildSocialIcon(IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: color, size: 30),
    );
  }
}
