import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildProfileHeader(context),
          const SizedBox(height: 24),
          _buildStatsCard(context),
          const SizedBox(height: 24),
          _buildSectionGroup(
            context,
            children: [
              _buildPrimaryActionTile(
                context,
                icon: Icons.payments_outlined,
                title: 'Adelanto de Salario',
                subtitle: 'Solicitar préstamo',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildSectionGroup(
            context,
            children: [
              _buildGroupedActionTile(
                context,
                icon: Icons.directions_car_outlined,
                title: 'Mis Vehículos',
                subtitle: '2 registrados',
                onTap: () {},
              ),
              _buildGroupedActionTile(
                context,
                icon: Icons.credit_card_outlined,
                title: 'Método de Pago',
                subtitle: '**** 4589',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildSectionGroup(
            context,
            children: [
              _buildGroupedActionTile(
                context,
                icon: Icons.notifications_none,
                title: 'Notificaciones',
                onTap: () {},
              ),
              _buildGroupedActionTile(
                context,
                icon: Icons.shield_outlined,
                title: 'Seguridad',
                onTap: () {},
              ),
              _buildGroupedActionTile(
                context,
                icon: Icons.dark_mode_outlined,
                title: 'Apariencia',
                subtitle: 'Automático',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildSectionGroup(
            context,
            children: [
              _buildGroupedActionTile(
                context,
                icon: Icons.help_outline,
                title: 'Ayuda y Soporte',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildLogoutTile(context),
          const SizedBox(height: 18),
          Text(
            'Versión 1.0.0 (Build 24)',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.textTheme.bodyMedium?.color?.withAlpha(160),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Container(
                height: 84,
                width: 84,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryVariant],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(56),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Text(
                  'JD',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    color: Colors.white,
                    fontSize: 28,
                  ),
                ),
              ),
              Container(
                height: 30,
                width: 30,
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.surfaceVariantLight,
                    width: 1.5,
                  ),
                ),
                child: const Icon(
                  Icons.edit,
                  size: 16,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text('Juan Driver', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('juan.driver@email.com', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariantLight,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              'ID: DRV-2024-001',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondaryLight,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariantLight,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Row(
        children: [
          Expanded(child: _buildStatItem(context, '156', 'Viajes')),
          Container(
            width: 1,
            height: 70,
            color: theme.dividerColor.withAlpha(180),
          ),
          Expanded(child: _buildStatItem(context, r'$12.5M', 'Ganado')),
          Container(
            width: 1,
            height: 70,
            color: theme.dividerColor.withAlpha(180),
          ),
          Expanded(child: _buildStatItem(context, '4.9', 'Rating')),
        ],
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String value, String label) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SizedBox(
        height: 70,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              value,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.textTheme.bodySmall?.color,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionGroup(
    BuildContext context, {
    required List<Widget> children,
  }) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: theme.dividerColor.withAlpha(90)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Column(
          children: List<Widget>.generate(children.length * 2 - 1, (index) {
            if (index.isEven) {
              return children[index ~/ 2];
            }
            return Divider(
              height: 1,
              thickness: 1,
              color: theme.dividerColor.withAlpha(180),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildPrimaryActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);

    return Material(
      color: AppColors.surfaceVariantLight,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                height: 46,
                width: 46,
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(22),
                  borderRadius: BorderRadius.circular(16),
                ),
                alignment: Alignment.center,
                child: Icon(icon, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(width: 12),
                      Text(
                        subtitle,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondaryLight,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: AppColors.textSecondaryLight),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGroupedActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);

    return Material(
      color: AppColors.surfaceVariantLight,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                height: 42,
                width: 42,
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(22),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Icon(icon, color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(width: 12),
                      Text(
                        subtitle,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondaryLight,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: theme.textTheme.bodyMedium?.color,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogoutTile(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.red.withAlpha(20),
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: () {},
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Row(
            children: [
              Container(
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFE5E8),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.logout,
                  color: AppColors.error,
                  size: 22,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  'Cerrar sesión',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: AppColors.error,
                  ),
                ),
              ),
              Icon(Icons.chevron_right, color: AppColors.error.withAlpha(230)),
            ],
          ),
        ),
      ),
    );
  }
}
