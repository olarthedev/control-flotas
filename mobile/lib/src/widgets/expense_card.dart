import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class ExpenseCard extends StatelessWidget {
  const ExpenseCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.statusLabel,
    required this.statusColor,
    this.description,
    this.icon,
    this.iconColor,
  });

  final String title;
  final String subtitle;
  final String value;
  final String statusLabel;
  final Color statusColor;
  final String? description;
  final IconData? icon;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final resolvedIconColor = iconColor ?? AppColors.primary;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariantLight,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            height: 38,
            width: 38,
            decoration: BoxDecoration(
              color: resolvedIconColor.withAlpha(28),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon ?? Icons.local_parking,
              color: resolvedIconColor,
              size: 18,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyLarge?.copyWith(),
                ),
                if (description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    description!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.textTheme.bodyMedium?.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.textTheme.bodyMedium?.color,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: theme.textTheme.bodyLarge?.copyWith(),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(40),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  statusLabel,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: statusColor,
                    fontSize: 11,
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
