import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/expense_card.dart';
import '../widgets/section_header.dart';

class _ExpenseEntry {
  final String title;
  final String subtitle;
  final String value;
  final String statusLabel;
  final String? description;
  final IconData icon;
  final Color iconColor;
  final Color statusColor;

  const _ExpenseEntry({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.statusLabel,
    this.description,
    required this.icon,
    required this.iconColor,
    required this.statusColor,
  });
}

class ExpensesScreen extends StatelessWidget {
  const ExpensesScreen({super.key});

  static const _expenseItems = [
    _ExpenseEntry(
      title: 'Parqueadero',
      subtitle: '22 de Feb · ABC-123',
      value: r'$20.000',
      statusLabel: 'Pendiente',
      icon: Icons.local_parking,
      iconColor: Color(0xFFF59E0B),
      statusColor: AppColors.warning,
    ),
    _ExpenseEntry(
      title: 'Peaje',
      subtitle: '23 de Feb · ABC-123',
      value: r'$40.000',
      statusLabel: 'Pendiente',
      description: 'Autopista norte',
      icon: Icons.toll,
      iconColor: Color(0xFFFB923C),
      statusColor: AppColors.warning,
    ),
    _ExpenseEntry(
      title: 'Hotel',
      subtitle: '24 de Feb · ABC-123',
      value: r'$166.000',
      statusLabel: 'Aprobado',
      icon: Icons.hotel,
      iconColor: Color(0xFF6366F1),
      statusColor: AppColors.success,
    ),
    _ExpenseEntry(
      title: 'Combustible',
      subtitle: '21 de Feb · ABC-123',
      value: r'$150.000',
      statusLabel: 'Aprobado',
      icon: Icons.local_gas_station,
      iconColor: Color(0xFF2563EB),
      statusColor: AppColors.success,
    ),
    _ExpenseEntry(
      title: 'Mantenimiento',
      subtitle: '20 de Feb · XYZ-789',
      value: r'$85.000',
      statusLabel: 'Aprobado',
      icon: Icons.build_circle_outlined,
      iconColor: Color(0xFF8B5CF6),
      statusColor: AppColors.success,
    ),
    _ExpenseEntry(
      title: 'Alimentación',
      subtitle: '19 de Feb · ABC-123',
      value: r'$35.000',
      statusLabel: 'Aprobado',
      icon: Icons.restaurant_menu,
      iconColor: Color(0xFFEC4899),
      statusColor: AppColors.success,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const ClampingScrollPhysics(),
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(context),
                    const SizedBox(height: 24),
                    _buildSummaryCards(context),
                    const SizedBox(height: 20),
                    _buildPeriodChip(context),
                    const SizedBox(height: 24),
                    const SectionHeader(title: 'Historial de gastos'),
                    const SizedBox(height: 18),
                    _buildExpenseTable(context),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Gastos', style: theme.textTheme.headlineMedium),
            const SizedBox(height: 6),
            Text(
              'Revisa los gastos de la semana',
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
        Row(
          children: [
            _buildIconButton(context, Icons.filter_list),
            const SizedBox(width: 10),
            _buildIconButton(context, Icons.swap_vert),
          ],
        ),
      ],
    );
  }

  Widget _buildIconButton(BuildContext context, IconData iconData) {
    final theme = Theme.of(context);
    return Container(
      height: 48,
      width: 48,
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
      ),
      alignment: Alignment.center,
      child: Icon(iconData, color: theme.colorScheme.primary),
    );
  }

  Widget _buildExpenseTable(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
      ),
      child: Column(
        children: [
          ..._expenseItems.asMap().entries.map((entry) {
            final isLast = entry.key == _expenseItems.length - 1;
            final item = entry.value;
            return Column(
              children: [
                ExpenseCard(
                  title: item.title,
                  subtitle: item.subtitle,
                  value: item.value,
                  description: item.description,
                  statusLabel: item.statusLabel,
                  statusColor: item.statusColor,
                  icon: item.icon,
                  iconColor: item.iconColor,
                ),
                if (!isLast)
                  Divider(
                    height: 1,
                    thickness: 1,
                    indent: 80,
                    endIndent: 16,
                    color: theme.dividerColor.withAlpha(56),
                  ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSummaryCards(BuildContext context) {
    return SizedBox(
      height: 170,
      child: ListView(
        padding: const EdgeInsets.only(left: 14, right: 14),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        children: [
          _buildSummaryTile(
            context,
            icon: Icons.trending_down,
            label: 'Total Gastado',
            value: r'$496.000',
            color: AppColors.primary,
          ),
          const SizedBox(width: 12),
          _buildSummaryTile(
            context,
            icon: Icons.receipt_long,
            label: 'Pendiente',
            value: r'$60.000',
            color: AppColors.warning,
          ),
          const SizedBox(width: 12),
          _buildSummaryTile(
            context,
            icon: Icons.trending_up,
            label: 'Aprobado',
            value: r'$436.000',
            color: AppColors.success,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryTile(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    final theme = Theme.of(context);
    return Container(
      width: 190,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withAlpha(20),
            blurRadius: 24,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 46,
            width: 46,
            decoration: BoxDecoration(
              color: color.withAlpha(25),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 18),
          Text(
            label.toUpperCase(),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.textTheme.bodySmall?.color,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const Spacer(),
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontSize: 24,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodChip(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          const Icon(Icons.calendar_month, color: AppColors.primary),
          const SizedBox(width: 12),
          Text('Febrero 2024', style: theme.textTheme.bodyLarge),
          const Spacer(),
          Icon(Icons.swap_vert, color: theme.colorScheme.primary),
        ],
      ),
    );
  }
}
