// Color system for True Harmonic
export const colors = {
  primary: '#ffffff',      // White
  secondary: '#66686b',    // Charcoal grey
  accent: '#f4c82d',       // Yellow
  
  // Derived colors
  text: {
    primary: '#000000',
    secondary: '#66686b',
    white: '#ffffff',
    muted: '#9ca3af'
  },
  
  border: {
    light: '#e5e7eb',      // gray-200
    medium: '#9ca3af',     // gray-400
    dark: '#4b5563'        // gray-600
  }
}

// Tailwind class mappings
export const colorClasses = {
  // Backgrounds
  bgPrimary: 'bg-true-harmonic-primary',
  bgSecondary: 'bg-true-harmonic-secondary',
  bgAccent: 'bg-true-harmonic-accent',
  
  // Text
  textPrimary: 'text-black',
  textSecondary: 'text-true-harmonic-secondary',
  textWhite: 'text-white',
  
  // Borders
  borderLight: 'border-gray-200',
  borderMedium: 'border-gray-400',
  borderDark: 'border-gray-600',
  
  // Hover states
  hoverSecondary: 'hover:bg-true-harmonic-secondary/80',
  hoverAccent: 'hover:bg-true-harmonic-accent/90'
}