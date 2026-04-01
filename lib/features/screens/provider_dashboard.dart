import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ProviderDashboard extends StatelessWidget {
  const ProviderDashboard({Key? key}) : super(key: key);

  // Màu sắc chủ đạo
  final Color primaryColor = const Color(0xFF003366);
  final Color accentColor = const Color(0xFFF2994A);
  final Color backgroundColor = const Color(0xFFF5F7FA);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                // Phần Header màu xanh đậm
                Container(
                  height: 220,
                  width: double.infinity,
                  decoration: BoxDecoration(color: primaryColor),
                  padding: const EdgeInsets.only(top: 60, left: 24, right: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Provider Dashboard',
                                style: GoogleFonts.quicksand(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Welcome back, Travel Pro',
                                style: GoogleFonts.quicksand(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                          // Biểu tượng thông báo
                          Stack(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.notifications_none,
                                  color: Colors.white,
                                ),
                              ),
                              Positioned(
                                right: 2,
                                top: 2,
                                child: Container(
                                  height: 10,
                                  width: 10,
                                  decoration: const BoxDecoration(
                                    color: Colors.orange,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Thẻ doanh thu màu cam (Revenue Card)
                Positioned(
                  top: 130,
                  left: 20,
                  right: 20,
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: accentColor,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: accentColor.withOpacity(0.3),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "This Week's Revenue",
                              style: GoogleFonts.quicksand(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const Icon(Icons.trending_up, color: Colors.white),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "163.2M VND",
                          style: GoogleFonts.quicksand(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            "↗ +18.7% vs last week",
                            style: GoogleFonts.quicksand(
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
              ],
            ),

            const SizedBox(height: 120), // Tạo khoảng trống cho thẻ đè lên
            // ----- PHẦN THÔNG SỐ (STATS) -----
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  _buildStatCard(
                    'Today\'s Rev',
                    '35.7M VND',
                    '+12.5%',
                    Icons.attach_money,
                    Colors.green,
                  ),
                  const SizedBox(width: 12),
                  _buildStatCard(
                    'New Bookings',
                    '18',
                    '+8',
                    Icons.shopping_bag_outlined,
                    Colors.blue,
                  ),
                  const SizedBox(width: 12),
                  _buildStatCard(
                    'Active Services',
                    '12',
                    '3 pending',
                    Icons.inventory_2_outlined,
                    Colors.purple,
                  ),
                ],
              ),
            ),

            // ----- PHẦN QUICK ACTIONS -----
            _buildSectionTitle('Quick Actions', null),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      'Add Service',
                      Icons.add,
                      primaryColor,
                      Colors.white,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      'View Orders',
                      Icons.visibility_outlined,
                      Colors.white,
                      Colors.black87,
                      iconColor: accentColor,
                    ),
                  ),
                ],
              ),
            ),

            // ----- PHẦN RECENT ACTIVITY -----
            _buildSectionTitle('Recent Activity', 'View All'),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _buildActivityTile(
                    'New Booking Request',
                    'Nguyen Van A booked Ha Long Bay Cruise',
                    '5 mins ago',
                    Icons.shopping_bag,
                    Colors.blue.shade50,
                    Colors.blue,
                  ),
                  _buildActivityTile(
                    'Payment Received',
                    '5.0M VND from Tran Thi B',
                    '1 hour ago',
                    Icons.attach_money,
                    Colors.green.shade50,
                    Colors.green,
                  ),
                  _buildActivityTile(
                    'Service Review',
                    'New 5-star review on Hoi An Tour',
                    '3 hours ago',
                    Icons.trending_up,
                    Colors.orange.shade50,
                    Colors.orange,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  // Widget tiêu đề các phần
  Widget _buildSectionTitle(String title, String? actionText) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.quicksand(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF2D3142),
            ),
          ),
          if (actionText != null)
            Text(
              actionText,
              style: GoogleFonts.quicksand(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.blue,
              ),
            ),
        ],
      ),
    );
  }

  // Widget Thẻ thông số nhỏ
  Widget _buildStatCard(
    String title,
    String value,
    String sub,
    IconData icon,
    Color color,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.withOpacity(0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: GoogleFonts.quicksand(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: GoogleFonts.quicksand(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              sub,
              style: GoogleFonts.quicksand(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  // Widget Nút hành động nhanh
  Widget _buildActionButton(
    String title,
    IconData icon,
    Color bg,
    Color textCol, {
    Color? iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        boxShadow: bg == Colors.white
            ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]
            : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: iconColor ?? textCol, size: 20),
          const SizedBox(width: 10),
          Text(
            title,
            style: GoogleFonts.quicksand(
              color: textCol,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }

  // Widget dòng hoạt động gần đây
  Widget _buildActivityTile(
    String title,
    String desc,
    String time,
    IconData icon,
    Color bgIcon,
    Color iconCol,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: bgIcon, shape: BoxShape.circle),
            child: Icon(icon, color: iconCol, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.quicksand(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: GoogleFonts.quicksand(
                    color: Colors.grey,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      time,
                      style: GoogleFonts.quicksand(
                        color: Colors.grey,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
