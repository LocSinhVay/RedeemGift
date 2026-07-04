/**
 * Central export for all theme utilities
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export { default as useResponsive } from './useResponsive';

import { colors } from './colors';
import { spacing } from './spacing';
import { typography, textStyles } from './typography';

export const theme = {
    colors,
    spacing,
    typography,
    textStyles,
};
