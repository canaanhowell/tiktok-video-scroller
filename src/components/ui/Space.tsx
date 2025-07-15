import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SpaceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type SpaceDirection = 'horizontal' | 'vertical'

interface SpaceProps {
  size?: SpaceSize
  direction?: SpaceDirection
  className?: string
  children?: ReactNode
  flex?: boolean
}

const sizeStyles: Record<SpaceSize, string> = {
  xs: 'gap-[var(--space-xs)]',
  sm: 'gap-[var(--space-sm)]',
  md: 'gap-[var(--space-md)]',
  lg: 'gap-[var(--space-lg)]',
  xl: 'gap-[var(--space-xl)]',
  '2xl': 'gap-[var(--space-2xl)]',
  '3xl': 'gap-[var(--space-3xl)]',
}

const marginStyles: Record<SpaceSize, string> = {
  xs: 'h-[var(--space-xs)] w-[var(--space-xs)]',
  sm: 'h-[var(--space-sm)] w-[var(--space-sm)]',
  md: 'h-[var(--space-md)] w-[var(--space-md)]',
  lg: 'h-[var(--space-lg)] w-[var(--space-lg)]',
  xl: 'h-[var(--space-xl)] w-[var(--space-xl)]',
  '2xl': 'h-[var(--space-2xl)] w-[var(--space-2xl)]',
  '3xl': 'h-[var(--space-3xl)] w-[var(--space-3xl)]',
}

export function Space({
  size = 'md',
  direction = 'vertical',
  className,
  children,
  flex = true,
}: SpaceProps) {
  // If no children, render as spacer
  if (!children) {
    return (
      <div 
        className={cn(
          marginStyles[size],
          direction === 'horizontal' ? 'h-full' : 'w-full',
          className
        )}
        aria-hidden="true"
      />
    )
  }

  // Render as flex container
  return (
    <div
      className={cn(
        flex && 'flex',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        sizeStyles[size],
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive padding component
interface PaddingProps {
  size?: SpaceSize | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', SpaceSize>>
  top?: boolean
  right?: boolean
  bottom?: boolean
  left?: boolean
  x?: boolean
  y?: boolean
  all?: boolean
  children: ReactNode
  className?: string
}

export function Padding({
  size = 'md',
  top,
  right,
  bottom,
  left,
  x,
  y,
  all = !top && !right && !bottom && !left && !x && !y,
  children,
  className,
}: PaddingProps) {
  const getPaddingClass = (s: SpaceSize, side?: string) => {
    const prefix = side ? `p${side[0]}-` : 'p-'
    return `${prefix}[var(--space-${s})]`
  }

  const classes = []

  if (typeof size === 'string') {
    if (all) classes.push(getPaddingClass(size))
    if (top) classes.push(getPaddingClass(size, 'top'))
    if (right) classes.push(getPaddingClass(size, 'right'))
    if (bottom) classes.push(getPaddingClass(size, 'bottom'))
    if (left) classes.push(getPaddingClass(size, 'left'))
    if (x) {
      classes.push(getPaddingClass(size, 'left'))
      classes.push(getPaddingClass(size, 'right'))
    }
    if (y) {
      classes.push(getPaddingClass(size, 'top'))
      classes.push(getPaddingClass(size, 'bottom'))
    }
  }

  return (
    <div className={cn(classes, className)}>
      {children}
    </div>
  )
}