/**
 * Typography system for consistent text styling
 */

export const typography = {
    // Font sizes
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,

    // Line heights
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
};

// Font weight
export const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

// Text styles
export const textStyles = {
    h1: {
        fontSize: typography['3xl'],
        fontWeight: fontWeight.extrabold as any,
        lineHeight: typography.tight,
    },
    h2: {
        fontSize: typography['2xl'],
        fontWeight: fontWeight.bold as any,
        lineHeight: typography.tight,
    },
    h3: {
        fontSize: typography.xl,
        fontWeight: fontWeight.bold as any,
        lineHeight: typography.normal,
    },
    h4: {
        fontSize: typography.lg,
        fontWeight: fontWeight.semibold as any,
        lineHeight: typography.normal,
    },
    body: {
        fontSize: typography.base,
        fontWeight: fontWeight.normal as any,
        lineHeight: typography.normal,
    },
    bodySmall: {
        fontSize: typography.sm,
        fontWeight: fontWeight.normal as any,
        lineHeight: typography.normal,
    },
    label: {
        fontSize: typography.sm,
        fontWeight: fontWeight.semibold as any,
        lineHeight: typography.normal,
    },
    caption: {
        fontSize: typography.xs,
        fontWeight: fontWeight.normal as any,
        lineHeight: typography.tight,
    },
};
