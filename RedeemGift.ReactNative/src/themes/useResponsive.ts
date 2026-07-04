/**
 * Hook for responsive design
 */

import { useWindowDimensions } from 'react-native';

interface ResponsiveValues {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

const BREAKPOINTS = {
    xs: 0,
    sm: 375,      // Small phones
    md: 480,      // Medium phones
    lg: 768,      // Tablets
    xl: 1024,     // Large tablets
};

export default function useResponsive() {
    const { width, height } = useWindowDimensions();

    return {
        width,
        height,
        isSmallPhone: width < BREAKPOINTS.sm,
        isMediumPhone: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
        isLargePhone: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isTablet: width >= BREAKPOINTS.lg,
        isPortrait: height > width,
        isLandscape: width > height,

        // Helper to select value based on screen size
        select: (values: ResponsiveValues) => {
            if (width >= BREAKPOINTS.xl) return values.xl;
            if (width >= BREAKPOINTS.lg) return values.lg;
            if (width >= BREAKPOINTS.md) return values.md;
            if (width >= BREAKPOINTS.sm) return values.sm;
            return values.xs;
        },
    };
}
