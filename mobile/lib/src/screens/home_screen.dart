import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/advance_card.dart';
import '../widgets/balance_card.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/recent_expenses_card.dart';
import '../widgets/section_header.dart';
import 'expenses_screen.dart';
import 'notifications_screen.dart';

const _weeklyBalance = r'$5.000.000';
const _spentAmount = r'$290.000';
const _availableAmount = r'$4.710.000';
const _utilizationValue = 0.058;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void _onNavigationItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  static const _recentExpenses = [
    ExpenseItem(
      title: 'Parqueadero',
      subtitle: '22 de Feb · ABC-123',
      value: r'$20.000',
      status: ExpenseStatus.pending,
    ),
    ExpenseItem(
      title: 'Combustible',
      subtitle: '21 de Feb · ABC-123',
      value: r'$150.000',
      status: ExpenseStatus.approved,
    ),
    ExpenseItem(
      title: 'Mantenimiento',
      subtitle: '20 de Feb · XYZ-789',
      value: r'$85.000',
      status: ExpenseStatus.approved,
    ),
    ExpenseItem(
      title: 'Alimentación',
      subtitle: '19 de Feb · ABC-123',
      value: r'$35.000',
      status: ExpenseStatus.approved,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(child: _buildCurrentPage(context)),
            BottomNavigation(
              currentIndex: _selectedIndex,
              onTap: _onNavigationItemTapped,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentPage(BuildContext context) {
    switch (_selectedIndex) {
      case 1:
        return const ExpensesScreen();
      case 2:
        return const NotificationsScreen();
      case 3:
        return _buildPlaceholder(context, 'Perfil');
      default:
        return _buildHomeContent(context);
    }
  }

  Widget _buildPlaceholder(BuildContext context, String title) {
    return Center(
      child: Text(title, style: Theme.of(context).textTheme.headlineSmall),
    );
  }

  Widget _buildHomeContent(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          const SizedBox(height: 24),
          BalanceSummaryCard(
            title: 'Saldo Semanal',
            statusLabel: 'Activo',
            value: _weeklyBalance,
            spent: _spentAmount,
            available: _availableAmount,
            utilization: _utilizationValue,
          ),
          const SizedBox(height: 24),
          _buildActionButton(context),
          const SizedBox(height: 18),
          const AdvanceCard(
            title: 'INICIAR RUTA',
            description: 'Registra tu ruta diaria y cambios de vehículo',
            icon: Icons.navigation,
          ),
          const SizedBox(height: 28),
          const SectionHeader(
            title: 'GASTOS RECIENTES',
            actionLabel: 'Ver todo',
          ),
          const SizedBox(height: 16),
          const RecentExpensesCard(items: _recentExpenses),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hola,', style: theme.textTheme.titleMedium),
              const SizedBox(height: 6),
              Text('Conductor', style: theme.textTheme.headlineMedium),
            ],
          ),
        ),
        Container(
          height: 46,
          width: 46,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.primaryVariant],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withAlpha(61),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Text(
            'JD',
            style: theme.textTheme.labelLarge?.copyWith(color: Colors.white),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: () {},
        icon: const Icon(Icons.add, size: 20),
        label: const Text('Registrar Gasto'),
        style: ButtonStyle(
          backgroundColor: WidgetStatePropertyAll(AppColors.primary),
          foregroundColor: WidgetStatePropertyAll(Colors.white),
          shadowColor: WidgetStatePropertyAll(const Color(0x26000000)),
          elevation: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.pressed)) {
              return 4.0;
            }
            return 8.0;
          }),
          overlayColor: WidgetStatePropertyAll(const Color(0x1EFFFFFF)),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          textStyle: WidgetStatePropertyAll(
            const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }
}
