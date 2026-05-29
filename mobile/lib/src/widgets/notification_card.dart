import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class NotificationCard extends StatelessWidget {
  const NotificationCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.timestamp,
    required this.icon,
    required this.iconColor,
    required this.isUnread,
  });

  final String title;
  final String subtitle;
  final String timestamp;
  final IconData icon;
  final Color iconColor;
  final bool isUnread;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariantLight,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 38,
            width: 38,
            decoration: BoxDecoration(
              color: iconColor.withAlpha(30),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyLarge?.copyWith(),
                ),
                const SizedBox(height: 2),
                Text(subtitle, style: theme.textTheme.bodyMedium),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                timestamp,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.textTheme.bodyMedium?.color,
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: 4),
              if (isUnread)
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
