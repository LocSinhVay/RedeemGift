/**
 * Color theme for the application
 * Follows Material Design 3 color system
 */

export const colors = {
    // Primary brand colors
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',

    // Secondary colors
    secondary: '#8b5cf6',
    secondaryLight: '#a78bfa',
    secondaryDark: '#7c3aed',

    // Accent colors
    success: '#10b981',
    successLight: '#34d399',
    successDark: '#059669',

    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',

    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',

    // Neutral colors
    background: '#f8fafc',
    backgroundAlt: '#eef2f7',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',

    // Text colors
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textLight: '#cbd5e1',

    // Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1',

    // Status
    disabled: '#d1d5db',
    overlay: 'rgba(0, 0, 0, 0.5)',
};

// Named color palettes for different components
export const componentColors = {
    button: {
        primary: colors.primary,
        secondary: colors.surfaceAlt,
        danger: colors.error,
        success: colors.success,
        disabled: colors.disabled,
    },
    badge: {
        primary: colors.primary,
        success: colors.success,
        warning: colors.warning,
        danger: colors.error,
        neutral: colors.border,
    },
    card: {
        background: colors.surface,
        border: colors.border,
    },
};
