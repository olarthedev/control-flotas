import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class ExpenseCard extends StatelessWidget {
  const ExpenseCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.statusLabel,
  });

  final String title;
  final String subtitle;
  final String value;
  final String statusLabel;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(31),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.local_parking, color: AppColors.primary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: theme.textTheme.bodyLarge),
                const SizedBox(height: 6),
                Text(subtitle, style: theme.textTheme.bodyMedium),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(value, style: theme.textTheme.bodyLarge),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.warning.withAlpha(46),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  statusLabel,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: AppColors.warning,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
