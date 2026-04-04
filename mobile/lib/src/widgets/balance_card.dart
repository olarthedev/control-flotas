import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BalanceSummaryCard extends StatelessWidget {
  const BalanceSummaryCard({
    super.key,
    required this.title,
    required this.statusLabel,
    required this.value,
    required this.spent,
    required this.available,
    required this.utilization,
  });

  final String title;
  final String statusLabel;
  final String value;
  final String spent;
  final String available;
  final double utilization;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 22, 24, 20),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariantLight,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 22,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: AppColors.textSecondaryLight,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: AppColors.neutralBadge,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.trending_up, size: 14, color: AppColors.success),
                    const SizedBox(width: 6),
                    Text(
                      statusLabel,
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: AppColors.success,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(value, style: theme.textTheme.headlineLarge),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildStatColumn(
                  context,
                  'Gastado',
                  spent,
                  isHighlight: false,
                ),
              ),
              Container(width: 1, height: 42, color: theme.dividerColor),
              Expanded(
                child: _buildStatColumn(
                  context,
                  'Disponible',
                  available,
                  isHighlight: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: utilization,
              color: AppColors.primary,
              backgroundColor: theme.dividerColor,
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${(utilization * 100).toStringAsFixed(1)}% utilizado',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatColumn(
    BuildContext context,
    String label,
    String value, {
    required bool isHighlight,
  }) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.textTheme.bodyMedium),
          const SizedBox(height: 6),
          Text(
            value,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: isHighlight
                  ? AppColors.success
                  : theme.textTheme.bodyLarge?.color,
            ),
          ),
        ],
      ),
    );
  }
}
