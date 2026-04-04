import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF6366F1);
  static const Color primaryVariant = Color(0xFF4F46E5);
  static const Color success = Color(0xFF15803D);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFFF5D63);

  static const Color backgroundLight = Color(0xFFFFFFFF);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceVariantLight = Color(0xFFF1F4F9);
  static const Color borderLight = Color(0xFFCBD5E1);
  static const Color textPrimaryLight = Color(0xFF0D1729);
  static const Color textSecondaryLight = Color(0xFF4B5563);
  static const Color labelLight = Color(0xFF94A3B8);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color neutralBadge = Color(0xFFE7EDF7);

  static const Color backgroundDark = Color(0xFF080B1F);
  static const Color surfaceDark = Color(0xFF0F1534);
  static const Color cardDark = Color(0xFF141B39);
  static const Color borderDark = Color(0xFF1C274D);
  static const Color textPrimaryDark = Color(0xFFE6E8FF);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
}

class AppTheme {
  AppTheme._();

  static final ColorScheme _lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.primary,
    onPrimary: Colors.white,
    secondary: AppColors.primaryVariant,
    onSecondary: Colors.white,
    error: AppColors.error,
    onError: Colors.white,
    surface: AppColors.surfaceLight,
    onSurface: AppColors.textPrimaryLight,
    surfaceContainerHighest: AppColors.surfaceVariantLight,
  );

  static final ColorScheme _darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.primary,
    onPrimary: Colors.white,
    secondary: AppColors.primaryVariant,
    onSecondary: Colors.white,
    error: AppColors.error,
    onError: Colors.white,
    surface: AppColors.surfaceDark,
    onSurface: AppColors.textPrimaryDark,
    surfaceContainerHighest: AppColors.surfaceDark,
  );

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: _lightColorScheme,
    scaffoldBackgroundColor: AppColors.backgroundLight,
    primaryColor: AppColors.primary,
    appBarTheme: const AppBarTheme(
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      backgroundColor: AppColors.backgroundLight,
      iconTheme: IconThemeData(color: AppColors.textPrimaryLight),
      titleTextStyle: TextStyle(
        color: AppColors.textPrimaryLight,
        fontSize: 20,
        fontWeight: FontWeight.w700,
      ),
    ),
    cardColor: AppColors.cardLight,
    shadowColor: const Color(0x14000000),
    dividerColor: AppColors.borderLight,
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        color: AppColors.textPrimaryLight,
        fontSize: 32,
        fontWeight: FontWeight.w800,
        height: 1.1,
      ),
      headlineMedium: TextStyle(
        color: AppColors.textPrimaryLight,
        fontSize: 28,
        fontWeight: FontWeight.w700,
        height: 1.1,
      ),
      headlineSmall: TextStyle(
        color: AppColors.textPrimaryLight,
        fontSize: 26,
        fontWeight: FontWeight.w700,
      ),
      titleMedium: TextStyle(
        color: AppColors.textSecondaryLight,
        fontSize: 15,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: TextStyle(
        color: AppColors.textPrimaryLight,
        fontSize: 16,
        fontWeight: FontWeight.w700,
      ),
      bodyMedium: TextStyle(
        color: AppColors.textSecondaryLight,
        fontSize: 14,
        height: 1.4,
      ),
      labelLarge: TextStyle(
        color: AppColors.textPrimaryLight,
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
      ),
      labelSmall: TextStyle(color: AppColors.labelLight, fontSize: 12),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: _darkColorScheme,
    scaffoldBackgroundColor: AppColors.backgroundDark,
    primaryColor: AppColors.primary,
    appBarTheme: const AppBarTheme(
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      backgroundColor: AppColors.backgroundDark,
      iconTheme: IconThemeData(color: AppColors.textPrimaryDark),
      titleTextStyle: TextStyle(
        color: AppColors.textPrimaryDark,
        fontSize: 20,
        fontWeight: FontWeight.w700,
      ),
    ),
    cardColor: AppColors.cardDark,
    dividerColor: AppColors.borderDark,
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        color: AppColors.textPrimaryDark,
        fontSize: 32,
        fontWeight: FontWeight.w800,
      ),
      headlineMedium: TextStyle(
        color: AppColors.textPrimaryDark,
        fontSize: 28,
        fontWeight: FontWeight.w700,
      ),
      headlineSmall: TextStyle(
        color: AppColors.textPrimaryDark,
        fontSize: 24,
        fontWeight: FontWeight.w700,
      ),
      titleMedium: TextStyle(
        color: AppColors.textSecondaryDark,
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: TextStyle(
        color: AppColors.textPrimaryDark,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
      bodyMedium: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
      labelLarge: TextStyle(
        color: AppColors.textPrimaryDark,
        fontSize: 12,
        fontWeight: FontWeight.w700,
      ),
    ),
  );
}
