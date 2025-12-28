# Authentication

SAAS Starter boilerplate uses Firebase Authentication for user management with role-based access control (RBAC). This document covers authentication setup, implementation, and role management.

## Authentication Provider: Firebase

Firebase Authentication provides secure, scalable user authentication with multiple sign-in methods.

### Setup

1. **Enable Firebase Authentication**
   - Go to Firebase Console → Authentication
   - Enable Email/Password provider
   - Enable Google provider (optional)
   - Configure authorized domains

2. **Configure Firebase**
   - Get Firebase config from Project Settings
   - Add to `.env.local`:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Initialize Firebase**
   - Firebase is initialized in `utils/firebase.js`
   - Services: Auth, Firestore, Storage

## Authentication Methods

### Email/Password Authentication

**Sign Up**:
```javascript
import { signUpWithEmail } from '../lib/api/auth';

const user = await signUpWithEmail(
  'user@example.com',
  'password123',
  'User Name'
);
```

**Sign In**:
```javascript
import { signInWithEmail } from '../lib/api/auth';

const user = await signInWithEmail(
  'user@example.com',
  'password123'
);
```

**Implementation**: `lib/api/auth.js`

### Google OAuth Authentication

**Sign In with Google**:
```javascript
import { signInWithGoogle } from '../lib/api/auth';

const user = await signInWithGoogle();
```

**Process**:
1. Opens Google sign-in popup
2. User authenticates with Google
3. User data saved to Firestore
4. Returns Firebase user object

## User Data Management

### User Storage

Users are stored in two places:

1. **Firebase Auth**: Authentication data
   - UID, email, display name
   - Provider information
   - Email verification status

2. **Firestore `users` Collection**: Extended user data
   ```javascript
   {
     uid: "firebase_uid",
     email: "user@example.com",
     name: "User Name",
     displayName: "User Name",
     provider: "google" | "email",
     photoURL: "url_or_null",
     emailVerified: true | false,
     lastSignIn: "Timestamp",
     createdAt: "Timestamp",
     updatedAt: "Timestamp"
   }
   ```

### Saving User to Firestore

**Function**: `saveUserToFirestore(user, provider)`

**Location**: `lib/api/auth.js`

**Process**:
1. Check if user exists
2. Update existing or create new document
3. Store provider information
4. Update timestamps

## Role-Based Access Control (RBAC)

### Role System

Roles are stored in Firestore `teams` collection, not in Firebase Auth.

**Collection**: `teams`

```javascript
{
  id: "document_id",
  email: "user@example.com",
  username: "optional_username",
  role: "admin" | "editor" | "author" | "viewer",
  createdAt: "Timestamp",
  updatedAt: "Timestamp"
}
```

### Available Roles

1. **Admin**
   - Full access to all features
   - User and team management
   - Can publish content
   - Can send emails

2. **Editor**
   - Content management (blogs, emails)
   - Can publish content
   - Can send emails
   - No user management

3. **Author**
   - Create and edit own content
   - Cannot publish
   - Cannot send emails
   - View-only for other resources

4. **Viewer**
   - Read-only access
   - Cannot create or edit
   - Cannot publish or send

### Role Configuration

**Location**: `lib/config/roles-config.js`

**Structure**:
```javascript
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  AUTHOR: "author",
  VIEWER: "viewer"
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: { ... },
  [ROLES.EDITOR]: { ... },
  // ... other roles
};
```

### Getting User Role

**Function**: `getUserRole(email, useCache)`

**Location**: `lib/utils/getUserRole.js`

**Process**:
1. Check teams collection by email
2. Return role or default to "viewer"
3. Cache result for performance

**Usage**:
```javascript
import { getUserRole } from '../lib/utils/getUserRole';

const role = await getUserRole('user@example.com');
```

### Checking Permissions

**Function**: `hasPermission(role, resource, action)`

**Location**: `lib/config/roles-config.js`

**Usage**:
```javascript
import { hasPermission } from '../lib/config/roles-config';

const canEdit = hasPermission(userRole, 'blogs', 'edit');
const canPublish = hasPermission(userRole, 'blogs', 'publish');
```

## Authentication State

### Listening to Auth Changes

**Function**: `onAuthStateChange(callback)`

**Location**: `lib/api/auth.js`

**Usage**:
```javascript
import { onAuthStateChange } from '../lib/api/auth';

const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    // User is signed in
    console.log('User:', user.email);
  } else {
    // User is signed out
  }
});

// Cleanup
unsubscribe();
```

### Getting Current User

**Function**: `getCurrentUser()`

**Location**: `lib/api/auth.js`

**Usage**:
```javascript
import { getCurrentUser } from '../lib/api/auth';

const user = await getCurrentUser();
if (user) {
  console.log('Current user:', user.email);
}
```

## Session Management

### Cookies

User session data is stored in cookies for persistence.

**Location**: `lib/utils/cookies.js`

**Functions**:
```javascript
// Set user cookie
setUserCookie(userData)

// Get user cookie
getUserCookie()

// Remove user cookie
removeUserCookie()
```

**Cookie Structure**:
```javascript
{
  uid: "firebase_uid",
  email: "user@example.com",
  displayName: "User Name",
  photoURL: "url_or_null",
  provider: "google" | "email"
}
```

## Sign Out

**Function**: `signOutUser()`

**Location**: `lib/api/auth.js`

**Usage**:
```javascript
import { signOutUser } from '../lib/api/auth';

await signOutUser();
// User is signed out
// Cookie is removed
// State is cleared
```

## Admin Panel Authentication

### Login Modal

**Component**: `lib/ui/LoginModal.jsx`

**Features**:
- Email/Password sign in
- Google sign in
- Sign up option
- Error handling
- Loading states

### Protected Routes

Admin routes check authentication:

1. Check Firebase Auth state
2. Get user role from teams collection
3. Check permissions
4. Redirect if unauthorized

**Implementation**: `app/admin/index.jsx`

## Email Verification

### Checking Verification

```javascript
const user = auth.currentUser;
if (user && user.emailVerified) {
  // Email is verified
}
```

### Sending Verification Email

Firebase automatically sends verification emails on sign up. You can also send manually:

```javascript
import { sendEmailVerification } from 'firebase/auth';

await sendEmailVerification(auth.currentUser);
```

## Password Reset

### Sending Reset Email

```javascript
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../utils/firebase';

await sendPasswordResetEmail(auth, 'user@example.com');
```

## Security Best Practices

1. **Environment Variables**: Never commit Firebase config
2. **HTTPS**: Always use HTTPS in production
3. **Email Verification**: Verify emails for sensitive operations
4. **Role Validation**: Always check roles server-side
5. **Session Management**: Use secure cookies
6. **Error Handling**: Don't expose sensitive error details
7. **Rate Limiting**: Implement rate limiting for auth endpoints

## Firebase Security Rules

### Firestore Rules

Example rules for user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Read own data, write own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Teams: Read if authenticated, write if admin
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && get(/databases/$(database)/documents/teams/$(request.auth.token.email)).data.role == 'admin';
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **User not found in teams**: Add user to teams collection with role
2. **Role not updating**: Clear cache or wait for refresh
3. **Sign in fails**: Check Firebase config and enabled providers
4. **Cookie not persisting**: Check cookie settings and domain

### Debugging

```javascript
// Check current user
console.log(auth.currentUser);

// Check user role
const role = await getUserRole('user@example.com');
console.log('Role:', role);

// Check permissions
const canEdit = hasPermission(role, 'blogs', 'edit');
console.log('Can edit:', canEdit);
```

## Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## API Functions Reference

**Location**: `lib/api/auth.js`

- `signInWithGoogle()`: Sign in with Google
- `signInWithEmail(email, password)`: Sign in with email
- `signUpWithEmail(email, password, displayName)`: Sign up
- `signOutUser()`: Sign out
- `getCurrentUser()`: Get current user
- `onAuthStateChange(callback)`: Listen to auth changes
- `saveUserToFirestore(user, provider)`: Save user data
- `getUserFromFirestore(uid)`: Get user from Firestore

