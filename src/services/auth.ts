/**
 * Authentication Service Layer
 * Abstract interface for authentication operations
 * Separates frontend from backend authentication implementation
 */

export interface User {
  id: string
  email: string
  name: string
  userType: 'consumer' | 'creator'
  profileImage?: string
  createdAt: string
  lastLoginAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  userType: 'consumer' | 'creator'
  profileImage?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

/**
 * Authentication Service Class
 * To be implemented by backend team with their chosen technology
 */
export class AuthService {
  
  /**
   * Login for consumer users
   */
  async loginConsumer(credentials: LoginCredentials): Promise<User> {
    // TODO: Implement via backend API
    console.log('AuthService.loginConsumer - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Login for creator users
   */
  async loginCreator(credentials: LoginCredentials): Promise<User> {
    // TODO: Implement via backend API
    console.log('AuthService.loginCreator - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Register new consumer
   */
  async registerConsumer(userData: RegisterData): Promise<User> {
    // TODO: Implement via backend API
    console.log('AuthService.registerConsumer - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Register new creator
   */
  async registerCreator(userData: RegisterData): Promise<User> {
    // TODO: Implement via backend API
    console.log('AuthService.registerCreator - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // TODO: Implement via backend API
    console.log('AuthService.logout - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    // TODO: Implement via backend API
    console.log('AuthService.getCurrentUser - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<User>): Promise<User> {
    // TODO: Implement via backend API
    console.log('AuthService.updateProfile - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    // TODO: Implement via backend API
    console.log('AuthService.refreshToken - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('AuthService.resetPassword - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    // TODO: Implement via backend API
    console.log('AuthService.verifyEmail - To be implemented by backend')
    throw new Error('AuthService not implemented - backend integration required')
  }
}

// Singleton instance for use across the application
export const authService = new AuthService()