# Frontend Refactoring Instructions for Backend Integration

## Overview
Refactor the existing TikTok-style video sharing app frontend to work seamlessly with a separate backend codebase. The goal is to create a clean separation between frontend UI and backend logic while preparing for a robust video platform with dual user types and comprehensive analytics.

## Core Refactoring Requirements

### 1. Remove All Existing Backend Code
- **Audit and remove**: Delete any existing backend logic, API calls, database connections, or server-side code from the current codebase
- **Clean dependencies**: Remove backend-related packages from package.json that are no longer needed
- **Eliminate imports**: Find and remove any imports of backend SDKs or server-side libraries

### 2. Implement Service Layer Architecture
Create a dedicated `src/services/` directory with the following service files:

#### Authentication Services (`src/services/auth.js`)
```javascript
// Abstract interface for authentication operations
export class AuthService {
  async loginConsumer(email, password) { /* Implementation via backend */ }
  async loginCreator(email, password) { /* Implementation via backend */ }
  async registerConsumer(userData) { /* Implementation via backend */ }
  async registerCreator(userData) { /* Implementation via backend */ }
  async logout() { /* Implementation via backend */ }
  async getCurrentUser() { /* Implementation via backend */ }
  async updateProfile(userId, profileData) { /* Implementation via backend */ }
}
```

#### Video Services (`src/services/videos.js`)
```javascript
export class VideoService {
  async getVideoFeed(userId, filters) { /* Fetch personalized video feed */ }
  async uploadVideo(videoData, metadata) { /* Handle video uploads for creators */ }
  async getVideoMetadata(videoId) { /* Fetch video performance data */ }
  async updateVideoMetadata(videoId, metadata) { /* Update video info */ }
  async deleteVideo(videoId) { /* Remove video */ }
  async getCreatorVideos(creatorId) { /* Get all videos by creator */ }
}
```

#### Analytics Services (`src/services/analytics.js`)
```javascript
export class AnalyticsService {
  async trackVideoView(userId, videoId, viewData) { /* Track viewing habits */ }
  async trackVideoInteraction(userId, videoId, interactionType) { /* Track likes/saves */ }
  async getViewingHistory(userId) { /* Get user's viewing patterns */ }
  async getVideoPerformance(videoId) { /* Get video analytics */ }
  async getCategoryPerformance(creatorId) { /* Track category success */ }
  async generateAnalyticsReport(userId, timeframe) { /* Generate reports */ }
}
```

#### User Services (`src/services/users.js`)
```javascript
export class UserService {
  async getUserProfile(userId) { /* Get user profile data */ }
  async getSavedVideos(userId) { /* Get user's saved videos */ }
  async saveVideo(userId, videoId) { /* Save video to user's collection */ }
  async unsaveVideo(userId, videoId) { /* Remove from saved videos */ }
  async followCreator(userId, creatorId) { /* Follow functionality */ }
  async getSubscriptionData(userId) { /* Get subscription info */ }
  async updateSubscription(userId, subscriptionData) { /* Manage subscriptions */ }
}
```

### 3. Create Configuration Layer
Establish `src/config/` directory:

#### Backend Configuration (`src/config/backend.js`)
```javascript
// Abstract backend client initialization
export class BackendConfig {
  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    this.apiKey = process.env.REACT_APP_API_KEY;
    // Other configuration options
  }
  
  // Method to initialize backend client (to be implemented)
  async initializeClient() { /* Backend-specific initialization */ }
}
```

#### Environment Configuration (`src/config/environment.js`)
```javascript
export const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  environment: process.env.NODE_ENV,
  features: {
    analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    subscriptions: process.env.REACT_APP_ENABLE_SUBSCRIPTIONS === 'true'
  }
};
```

### 4. Refactor Components for Service Integration

#### Update Authentication Components
- Modify login/register forms to use `AuthService`
- Implement separate login flows for consumers vs creators
- Add user type detection and routing

#### Update Video Components
- Refactor video player to use `VideoService` and `AnalyticsService`
- Implement thumbs up/save functionality using `UserService`
- Add creator-specific video management features

#### Create User Portal Components
- **Consumer Portal**: Viewing history, saved videos, subscription management
- **Creator Portal**: Uploaded videos, analytics dashboard, performance metrics

### 5. Implement State Management
Create centralized state management for:
- User authentication state
- Video feed state
- User preferences and settings
- Analytics data

Use Context API or Redux to manage state without hardcoding backend calls.

### 6. Update Directory Structure
Create new directory components wherever is needed to align with new frontend + service layer framework, but dont change the structure so much that it disrupts the existing video scroller. Example:
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── video/           # Video player and related components
│   ├── user/            # User profile and portal components
│   └── common/          # Shared UI components
├── pages/               # Page-level components
│   ├── consumer/        # Consumer-specific pages
│   ├── creator/         # Creator-specific pages
│   └── auth/           # Authentication pages
├── services/            # Backend service layer
├── config/              # Configuration and setup
├── hooks/               # Custom React hooks
├── utils/               # General utilities
├── styles/              # CSS and styling
└── types/              # TypeScript type definitions (if using TS)
```

## Implementation Guidelines

### Data Flow Architecture
1. **Components** → call → **Custom Hooks** → call → **Services** → communicate with → **Backend**
2. Ensure no direct backend calls from components
3. All backend interactions must go through the service layer

### Error Handling
- Implement consistent error handling across all services
- Create error boundary components for graceful failure handling
- Add retry logic for failed API calls

### Loading States
- Implement loading states for all async operations
- Add skeleton loaders for better user experience
- Handle offline scenarios gracefully

### Security Considerations
- Never expose API keys or sensitive configuration in frontend code
- Implement proper authentication token handling
- Add input validation and sanitization

## User Experience Features to Implement

### Consumer Features
- Personalized video feed based on viewing history
- Save/unsave videos functionality
- Viewing history and analytics
- Subscription management interface
- Creator following system

### Creator Features
- Video upload and management interface
- Analytics dashboard showing video performance
- Category performance tracking
- Subscriber management
- Revenue/subscription analytics

### Shared Features
- User authentication with role-based access
- Profile management
- Settings and preferences
- Responsive design for mobile/desktop

## Testing Strategy
- Write unit tests for all service methods
- Create mock implementations for backend services
- Test component integration with service layer
- Implement end-to-end testing scenarios

## Environment Variables Required
Create `.env.example` file with:
```
REACT_APP_API_URL=
REACT_APP_API_KEY=
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_SUBSCRIPTIONS=true
```

## Success Criteria
After refactoring, the frontend should:
1. Have zero direct backend dependencies
2. Be able to switch backends by only modifying the service layer
3. Support both consumer and creator user journeys
4. Have comprehensive analytics tracking capabilities
5. Be fully testable with mock backend services
6. Follow the established directory structure and separation of concerns

## Next Steps
Once refactoring is complete, the backend team can implement the service layer interfaces using their chosen technology stack, ensuring seamless integration with the frontend.