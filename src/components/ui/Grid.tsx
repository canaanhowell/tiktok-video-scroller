import { ReactNode, ElementType } from 'react'
import { cn } from '@/lib/utils'

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none'
type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

interface GridProps {
  cols?: GridCols | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', GridCols>>
  gap?: GridGap
  gapX?: GridGap
  gapY?: GridGap
  children: ReactNode
  className?: string
  as?: ElementType
}

const colStyles: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
  none: 'grid-cols-none',
}

const gapStyles: Record<GridGap, string> = {
  xs: 'gap-[var(--grid-gap-xs)]',
  sm: 'gap-[var(--grid-gap-sm)]',
  md: 'gap-[var(--grid-gap-md)]',
  lg: 'gap-[var(--grid-gap-lg)]',
  xl: 'gap-[var(--space-xl)]',
  '2xl': 'gap-[var(--space-2xl)]',
  '3xl': 'gap-[var(--space-3xl)]',
}

const gapXStyles: Record<GridGap, string> = {
  xs: 'gap-x-[var(--grid-gap-xs)]',
  sm: 'gap-x-[var(--grid-gap-sm)]',
  md: 'gap-x-[var(--grid-gap-md)]',
  lg: 'gap-x-[var(--grid-gap-lg)]',
  xl: 'gap-x-[var(--space-xl)]',
  '2xl': 'gap-x-[var(--space-2xl)]',
  '3xl': 'gap-x-[var(--space-3xl)]',
}

const gapYStyles: Record<GridGap, string> = {
  xs: 'gap-y-[var(--grid-gap-xs)]',
  sm: 'gap-y-[var(--grid-gap-sm)]',
  md: 'gap-y-[var(--grid-gap-md)]',
  lg: 'gap-y-[var(--grid-gap-lg)]',
  xl: 'gap-y-[var(--space-xl)]',
  '2xl': 'gap-y-[var(--space-2xl)]',
  '3xl': 'gap-y-[var(--space-3xl)]',
}

export function Grid({
  cols = 12,
  gap,
  gapX,
  gapY,
  children,
  className,
  as: Component = 'div',
}: GridProps) {
  const classes = ['grid']

  // Handle responsive columns
  if (typeof cols === 'number' || cols === 'none') {
    classes.push(colStyles[cols])
  } else {
    // Responsive columns
    if (cols.xs) classes.push(colStyles[cols.xs])
    if (cols.sm) classes.push(`sm:${colStyles[cols.sm]}`)
    if (cols.md) classes.push(`md:${colStyles[cols.md]}`)
    if (cols.lg) classes.push(`lg:${colStyles[cols.lg]}`)
    if (cols.xl) classes.push(`xl:${colStyles[cols.xl]}`)
    if (cols['2xl']) classes.push(`2xl:${colStyles[cols['2xl']]}`)
  }

  // Handle gaps
  if (gap) {
    classes.push(gapStyles[gap])
  } else {
    if (gapX) classes.push(gapXStyles[gapX])
    if (gapY) classes.push(gapYStyles[gapY])
  }

  return (
    <Component className={cn(classes, className)}>
      {children}
    </Component>
  )
}

// Grid Item Component
interface GridItemProps {
  span?: number | 'auto' | 'full'
  start?: number | 'auto'
  end?: number | 'auto'
  children: ReactNode
  className?: string
  as?: ElementType
}

export function GridItem({
  span,
  start,
  end,
  children,
  className,
  as: Component = 'div',
}: GridItemProps) {
  const classes = []

  if (span === 'full') {
    classes.push('col-span-full')
  } else if (span === 'auto') {
    classes.push('col-auto')
  } else if (span) {
    classes.push(`col-span-${span}`)
  }

  if (start === 'auto') {
    classes.push('col-start-auto')
  } else if (start) {
    classes.push(`col-start-${start}`)
  }

  if (end === 'auto') {
    classes.push('col-end-auto')
  } else if (end) {
    classes.push(`col-end-${end}`)
  }

  return (
    <Component className={cn(classes, className)}>
      {children}
    </Component>
  )
}

// Container Component
interface ContainerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'fluid'
  children: ReactNode
  className?: string
  as?: ElementType
}

const containerStyles: Record<NonNullable<ContainerProps['size']>, string> = {
  xs: 'max-w-[var(--container-xs)]',
  sm: 'max-w-[var(--container-sm)]',
  md: 'max-w-[var(--container-md)]',
  lg: 'max-w-[var(--container-lg)]',
  xl: 'max-w-[var(--container-xl)]',
  '2xl': 'max-w-[var(--container-2xl)]',
  '3xl': 'max-w-[var(--container-3xl)]',
  fluid: 'max-w-full',
}

export function Container({
  size = 'xl',
  children,
  className,
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component 
      className={cn(
        'mx-auto px-[var(--space-md)] w-full',
        containerStyles[size],
        className
      )}
    >
      {children}
    </Component>
  )
}