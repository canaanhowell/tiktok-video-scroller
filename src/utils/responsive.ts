import { breakpoints, type Breakpoint } from '@/hooks/useBreakpoint'

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Scale a value based on viewport width
export function scaleValue(
  minValue: number,
  maxValue: number,
  minWidth: number = breakpoints.xs,
  maxWidth: number = breakpoints['2xl']
): string {
  return `clamp(${minValue}px, ${
    ((maxValue - minValue) / (maxWidth - minWidth)) * 100
  }vw + ${
    minValue - ((maxValue - minValue) / (maxWidth - minWidth)) * minWidth
  }px, ${maxValue}px)`
}

// Fluid typography helper
export function fluidType(minSize: number, maxSize: number): string {
  return scaleValue(minSize, maxSize)
}

// Fluid spacing helper
export function fluidSpace(minSpace: number, maxSpace: number): string {
  return scaleValue(minSpace, maxSpace)
}

// Get value for current breakpoint
export function getBreakpointValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint,
  defaultValue: T
): T {
  // Start from current breakpoint and work down to find a value
  const breakpointOrder: Breakpoint[] = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }
  
  return defaultValue
}

// Responsive prop helper
export function responsiveProp<T>(
  prop: T | Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint,
  defaultValue: T
): T {
  if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
    return getBreakpointValue(prop as Partial<Record<Breakpoint, T>>, currentBreakpoint, defaultValue)
  }
  return prop
}

// CSS custom properties for responsive values
export function createResponsiveVars(prefix: string) {
  return {
    // Typography
    [`--${prefix}-text-xs`]: fluidType(12, 14),
    [`--${prefix}-text-sm`]: fluidType(14, 16),
    [`--${prefix}-text-base`]: fluidType(16, 18),
    [`--${prefix}-text-lg`]: fluidType(18, 20),
    [`--${prefix}-text-xl`]: fluidType(20, 24),
    [`--${prefix}-text-2xl`]: fluidType(24, 30),
    [`--${prefix}-text-3xl`]: fluidType(30, 36),
    [`--${prefix}-text-4xl`]: fluidType(36, 48),
    [`--${prefix}-text-5xl`]: fluidType(48, 64),
    
    // Spacing
    [`--${prefix}-space-xs`]: fluidSpace(4, 8),
    [`--${prefix}-space-sm`]: fluidSpace(8, 12),
    [`--${prefix}-space-md`]: fluidSpace(16, 24),
    [`--${prefix}-space-lg`]: fluidSpace(24, 32),
    [`--${prefix}-space-xl`]: fluidSpace(32, 48),
    [`--${prefix}-space-2xl`]: fluidSpace(48, 64),
    [`--${prefix}-space-3xl`]: fluidSpace(64, 96),
  }
}

// Touch target size helper
export function getTouchTargetSize(isTouch: boolean): number {
  return isTouch ? 44 : 32 // 44px for touch, 32px for mouse
}

// Safe area padding for mobile devices
export function getSafeAreaPadding() {
  return {
    top: 'env(safe-area-inset-top, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left: 'env(safe-area-inset-left, 0px)',
  }
}