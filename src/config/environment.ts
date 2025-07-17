/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

export interface EnvironmentConfig {
  apiUrl: string
  environment: 'development' | 'staging' | 'production'
  features: {
    analytics: boolean
    subscriptions: boolean
    realTimeUpdates: boolean
    push: boolean
    videoUpload: boolean
    socialLogin: boolean
    debug: boolean
  }
  limits: {
    maxVideoSize: number // in MB
    maxVideoDuration: number // in seconds
    maxFileSize: number // in MB
    rateLimit: number // requests per minute
  }
  cdn: {
    baseUrl: string
    enabled: boolean
  }
  analytics: {
    enabled: boolean
    trackingId?: string
  }
  social: {
    twitter?: string
    instagram?: string
    support?: string
  }
}

/**
 * Get configuration based on environment
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const environment = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production'
  
  // Base configuration
  const baseConfig: EnvironmentConfig = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    environment,
    features: {
      analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      subscriptions: process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true',
      realTimeUpdates: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
      push: process.env.NEXT_PUBLIC_ENABLE_PUSH === 'true',
      videoUpload: process.env.NEXT_PUBLIC_ENABLE_VIDEO_UPLOAD === 'true',
      socialLogin: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true',
      debug: environment === 'development'
    },
    limits: {
      maxVideoSize: parseInt(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE || '100'), // 100MB default
      maxVideoDuration: parseInt(process.env.NEXT_PUBLIC_MAX_VIDEO_DURATION || '300'), // 5 minutes default
      maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10'), // 10MB default
      rateLimit: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT || '60') // 60 requests per minute
    },
    cdn: {
      baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://vz-97606b97-31d.b-cdn.net',
      enabled: process.env.NEXT_PUBLIC_CDN_ENABLED === 'true'
    },
    analytics: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID
    },
    social: {
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL,
      instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      support: process.env.NEXT_PUBLIC_SUPPORT_URL
    }
  }

  // Environment-specific overrides
  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        features: {
          ...baseConfig.features,
          debug: true,
          analytics: false // Disable analytics in development
        },
        limits: {
          ...baseConfig.limits,
          rateLimit: 1000 // Higher rate limit for development
        }
      }

    case 'staging':
      return {
        ...baseConfig,
        features: {
          ...baseConfig.features,
          debug: true,
          analytics: true
        }
      }

    case 'production':
      return {
        ...baseConfig,
        features: {
          ...baseConfig.features,
          debug: false,
          analytics: true
        }
      }

    default:
      return baseConfig
  }
}

// Export the configuration
export const config = getEnvironmentConfig()

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
  return config.features[feature]
}

/**
 * Get API URL with optional path
 */
export function getApiUrl(path?: string): string {
  const baseUrl = config.apiUrl.replace(/\/$/, '') // Remove trailing slash
  return path ? `${baseUrl}/${path.replace(/^\//, '')}` : baseUrl
}

/**
 * Get CDN URL with optional path
 */
export function getCdnUrl(path?: string): string {
  if (!config.cdn.enabled) {
    return path || ''
  }
  
  const baseUrl = config.cdn.baseUrl.replace(/\/$/, '') // Remove trailing slash
  return path ? `${baseUrl}/${path.replace(/^\//, '')}` : baseUrl
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return config.environment === 'development'
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return config.environment === 'production'
}

/**
 * Get file size limit in bytes
 */
export function getMaxFileSize(type: 'video' | 'image' | 'general' = 'general'): number {
  switch (type) {
    case 'video':
      return config.limits.maxVideoSize * 1024 * 1024 // Convert MB to bytes
    case 'image':
      return config.limits.maxFileSize * 1024 * 1024 // Convert MB to bytes
    default:
      return config.limits.maxFileSize * 1024 * 1024 // Convert MB to bytes
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, type: 'video' | 'image' | 'general' = 'general'): boolean {
  const maxSize = getMaxFileSize(type)
  return file.size <= maxSize
}

/**
 * Get environment-specific CSS classes
 */
export function getEnvironmentClasses(): string {
  const classes = [`env-${config.environment}`]
  
  if (config.features.debug) {
    classes.push('debug-mode')
  }
  
  return classes.join(' ')
}

// Log configuration in development
if (isDevelopment()) {
  console.log('🔧 Environment Configuration:', config)
}