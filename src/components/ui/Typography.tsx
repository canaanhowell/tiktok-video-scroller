import { ReactNode, ElementType } from 'react'
import { cn } from '@/lib/utils'

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline'
type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold'

interface TypographyProps {
  variant?: TypographyVariant
  weight?: TypographyWeight
  children: ReactNode
  className?: string
  as?: ElementType
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-[length:var(--text-5xl)] leading-tight tracking-tight',
  h2: 'text-[length:var(--text-4xl)] leading-tight tracking-tight',
  h3: 'text-[length:var(--text-3xl)] leading-snug',
  h4: 'text-[length:var(--text-2xl)] leading-snug',
  h5: 'text-[length:var(--text-xl)] leading-normal',
  h6: 'text-[length:var(--text-lg)] leading-normal',
  body: 'text-[length:var(--text-base)] leading-relaxed',
  caption: 'text-[length:var(--text-sm)] leading-normal',
  overline: 'text-[length:var(--text-xs)] leading-normal uppercase tracking-wider',
}

const weightStyles: Record<TypographyWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const defaultTags: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  caption: 'p',
  overline: 'p',
}

export function Typography({
  variant = 'body',
  weight = 'normal',
  children,
  className,
  as,
}: TypographyProps) {
  const Component = as || defaultTags[variant]
  
  return (
    <Component
      className={cn(
        variantStyles[variant],
        weightStyles[weight],
        className
      )}
    >
      {children}
    </Component>
  )
}