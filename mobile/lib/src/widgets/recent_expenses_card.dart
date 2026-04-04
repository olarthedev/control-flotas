import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

enum ExpenseStatus { pending, approved }

class ExpenseItem {
  final String title;
  final String subtitle;
  final String value;
  final ExpenseStatus status;

  const ExpenseItem({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.status,
  });
}

class RecentExpensesCard extends StatelessWidget {
  const RecentExpensesCard({super.key, required this.items});

  final List<ExpenseItem> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.surfaceVariantLight,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final isFirst = entry.key == 0;
          return Column(
            children: [
              if (!isFirst) Divider(color: AppColors.borderLight, height: 1),
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                child: _ExpenseTile(item: entry.value),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _ExpenseTile extends StatelessWidget {
  const _ExpenseTile({required this.item});

  final ExpenseItem item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isApproved = item.status == ExpenseStatus.approved;
    final statusColor = isApproved ? AppColors.success : AppColors.warning;
    final statusLabel = isApproved ? 'Aprobado' : 'Pendiente';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          height: 8,
          width: 8,
          decoration: BoxDecoration(
            color: statusColor,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.title,
                style: theme.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              Text(item.subtitle, style: theme.textTheme.bodyMedium),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(item.value, style: theme.textTheme.bodyLarge),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: statusColor.withAlpha(24),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isApproved ? Icons.check_circle_outline : Icons.access_time,
                    size: 10,
                    color: statusColor,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    statusLabel,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
