import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/notification_card.dart';

class NotificationEntry {
  final String title;
  final String subtitle;
  final String timestamp;
  final IconData icon;
  final Color iconColor;
  final bool isUnread;

  const NotificationEntry({
    required this.title,
    required this.subtitle,
    required this.timestamp,
    required this.icon,
    required this.iconColor,
    this.isUnread = false,
  });
}

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  static const _notifications = [
    NotificationEntry(
      title: 'Gasto aprobado',
      subtitle: 'Tu gasto de \$150.000 en Combustible ha sido aprobado.',
      timestamp: 'Hace 5 min',
      icon: Icons.check_circle,
      iconColor: Color(0xFF22C55E),
      isUnread: true,
    ),
    NotificationEntry(
      title: 'Gasto pendiente',
      subtitle: 'Tienes 1 gasto pendiente de aprobación por \$20.000.',
      timestamp: 'Hace 2 horas',
      icon: Icons.access_time,
      iconColor: Color(0xFFF59E0B),
      isUnread: true,
    ),
    NotificationEntry(
      title: 'Nuevo adelanto disponible',
      subtitle: 'Puedes solicitar un adelanto de salario hasta \$1.000.000.',
      timestamp: 'Hace 1 día',
      icon: Icons.attach_money,
      iconColor: AppColors.primary,
    ),
    NotificationEntry(
      title: 'Pago procesado',
      subtitle: 'Se ha procesado tu pago semanal de \$4.980.000.',
      timestamp: 'Hace 3 días',
      icon: Icons.check_circle,
      iconColor: Color(0xFF22C55E),
    ),
    NotificationEntry(
      title: 'Error en carga de recibo',
      subtitle: 'No se pudo cargar el recibo. Intenta nuevamente.',
      timestamp: 'Hace 4 días',
      icon: Icons.error_outline,
      iconColor: AppColors.error,
    ),
    NotificationEntry(
      title: 'Actualización de política',
      subtitle: 'Nuevas políticas de reembolso de gastos vigentes.',
      timestamp: 'Hace 1 semana',
      icon: Icons.attach_money,
      iconColor: Color(0xFF6366F1),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context),
              const SizedBox(height: 24),
              _buildNotificationList(context),
              const SizedBox(height: 24),
              _buildClearHistoryButton(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Notificaciones', style: theme.textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                '2 sin leer',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
        ),
        Row(
          children: [
            _buildIconButton(context, Icons.check, true),
            const SizedBox(width: 10),
            _buildIconButton(context, Icons.settings_outlined, false),
          ],
        ),
      ],
    );
  }

  Widget _buildIconButton(BuildContext context, IconData icon, bool isPrimary) {
    final theme = Theme.of(context);
    return Container(
      height: 54,
      width: 54,
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(18),
      ),
      alignment: Alignment.center,
      child: Icon(
        icon,
        color: isPrimary ? AppColors.primary : theme.colorScheme.onSurface,
        size: 22,
      ),
    );
  }

  Widget _buildNotificationList(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.surfaceVariantLight,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        children: _notifications.asMap().entries.map((entry) {
          final isLast = entry.key == _notifications.length - 1;
          return Column(
            children: [
              NotificationCard(
                title: entry.value.title,
                subtitle: entry.value.subtitle,
                timestamp: entry.value.timestamp,
                icon: entry.value.icon,
                iconColor: entry.value.iconColor,
                isUnread: entry.value.isUnread,
              ),
              if (!isLast)
                Divider(
                  height: 1,
                  thickness: 1,
                  indent: 18,
                  endIndent: 18,
                  color: AppColors.borderLight.withAlpha(120),
                ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildClearHistoryButton(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      height: 48,
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight.withAlpha(120)),
      ),
      child: TextButton.icon(
        onPressed: () {},
        icon: const Icon(
          Icons.delete_outline,
          color: AppColors.textSecondaryLight,
          size: 18,
        ),
        label: Text(
          'Limpiar historial',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: AppColors.textSecondaryLight,
          ),
        ),
      ),
    );
  }
}
