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
import { signUpWithEmail } from "../lib/api/auth";

const user = await signUpWithEmail(
	"user@example.com",
	"password123",
	"User Name"
);
```

**Sign In**:

```javascript
import { signInWithEmail } from "../lib/api/auth";

const user = await signInWithEmail("user@example.com", "password123");
```

**Implementation**: `lib/api/auth.js`

### Google OAuth Authentication

**Sign In with Google**:

```javascript
import { signInWithGoogle } from "../lib/api/auth";

const user = await signInWithGoogle();
```

**Process**:

1. Opens Google sign-in popup
2. User authenticates with Google
3. User data saved to Firestore
4. Returns Firebase user object

## Supabase Authentication (Alternative)

SAAS Starter also supports Supabase Authentication as an alternative to Firebase. Supabase provides PostgreSQL database with built-in authentication.

### Supabase Google OAuth Setup

**Sign In with Google**:

```javascript
import { signInWithGoogle } from "../lib/api/auth";

const user = await signInWithGoogle();
```

**Process**:

1. Redirects to Google OAuth
2. User authenticates with Google
3. Supabase handles OAuth callback
4. User data saved to Supabase `users` table
5. Redirects to `/auth/callback` in your app

### Configuring Supabase Google OAuth

#### Step 1: Get Your Supabase Callback URL

Your Supabase project has a callback URL in this format:

- Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Find it in: Supabase Dashboard → Settings → API → Project URL
- Example: If your project URL is `https://abcdefgh.supabase.co`, the callback is `https://abcdefgh.supabase.co/auth/v1/callback`

#### Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to: **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client ID (or edit existing):
   - **Application type**: Web application
   - **Name**: Your app name
   - **Authorized JavaScript origins**:
     - `https://YOUR_PROJECT_REF.supabase.co`
     - `http://localhost:3000` (for local development)
   - **Authorized redirect URIs** (⚠️ **IMPORTANT**):
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
5. Save and copy the **Client ID** and **Client Secret**

#### Step 3: Configure OAuth Consent Screen

1. In Google Cloud Console: **APIs & Services** → **OAuth consent screen**
2. Configure:
   - **User Type**: External (or Internal if using Google Workspace)
   - **App name**, support email, developer contact
   - **Scopes**: Add `email`, `profile`, `openid`
   - **Test users**: Add your email (if in Testing mode)
3. Save

#### Step 4: Configure Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Google** provider
3. Enter:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
4. Save

#### Step 5: Configure Supabase URL Settings

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` (usually auto-added)

#### Step 6: Verify Environment Variables

Ensure `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_anon_key
```

### Troubleshooting Supabase Google Login

#### "Access blocked: Authorization Error"

This error occurs when the redirect URI doesn't match between Google Cloud Console and Supabase.

**Solution**:

1. Verify the redirect URI in Google Cloud Console exactly matches: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
2. Ensure no trailing slashes or typos
3. The redirect URI must be the **Supabase callback URL**, not your app's callback
4. Your app's `/auth/callback` is handled after Supabase processes the OAuth

#### OAuth Consent Screen Issues

**Problem**: "This app isn't verified" or access denied

**Solution**:

- If in **Testing mode**, add your email as a test user in Google Cloud Console
- Publish the app if you want public access
- Wait 5-10 minutes after changes (Google can take time to propagate)

#### Redirect Mismatch

**Problem**: Redirect URI mismatch error

**Solution**:

- The redirect URI in Google Cloud Console must be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- This is **NOT** your app's callback URL
- Supabase handles the OAuth flow first, then redirects to your app's `/auth/callback`

#### Still Not Working?

1. **Wait 5-10 minutes** after making changes (Google can take time to propagate)
2. **Clear browser cache and cookies**
3. **Check browser console** for specific error messages
4. **Verify Client ID and Secret** are correct in Supabase Dashboard
5. **Check Supabase logs** in Dashboard → Logs → Auth

### Quick Checklist for Supabase Google OAuth

- [ ] Google OAuth Client ID created in Google Cloud Console
- [ ] Redirect URI added in Google Cloud Console: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Google provider enabled in Supabase Dashboard
- [ ] Client ID and Secret added to Supabase Dashboard
- [ ] Supabase URL Configuration set correctly
- [ ] Environment variables set in `.env.local`
- [ ] Waited a few minutes after changes

### Important Notes

- The redirect URI in Google Cloud Console **must** be the Supabase callback URL (`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`), not your app's callback URL
- Supabase handles the OAuth flow and then redirects to your app's `/auth/callback`
- Always wait a few minutes after making changes in Google Cloud Console
- Test users must be added if your OAuth app is in Testing mode

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
import { getUserRole } from "../lib/utils/getUserRole";

const role = await getUserRole("user@example.com");
```

### Checking Permissions

**Function**: `hasPermission(role, resource, action)`

**Location**: `lib/config/roles-config.js`

**Usage**:

```javascript
import { hasPermission } from "../lib/config/roles-config";

const canEdit = hasPermission(userRole, "blogs", "edit");
const canPublish = hasPermission(userRole, "blogs", "publish");
```

## Authentication State

### Listening to Auth Changes

**Function**: `onAuthStateChange(callback)`

**Location**: `lib/api/auth.js`

**Usage**:

```javascript
import { onAuthStateChange } from "../lib/api/auth";

const unsubscribe = onAuthStateChange((user) => {
	if (user) {
		// User is signed in
		console.log("User:", user.email);
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
import { getCurrentUser } from "../lib/api/auth";

const user = await getCurrentUser();
if (user) {
	console.log("Current user:", user.email);
}
```

## Session Management

### Cookies

User session data is stored in cookies for persistence.

**Location**: `lib/utils/cookies.js`

**Functions**:

```javascript
// Set user cookie
setUserCookie(userData);

// Get user cookie
getUserCookie();

// Remove user cookie
removeUserCookie();
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
import { signOutUser } from "../lib/api/auth";

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
import { sendEmailVerification } from "firebase/auth";

await sendEmailVerification(auth.currentUser);
```

## Password Reset

### Sending Reset Email

```javascript
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/firebase";

await sendPasswordResetEmail(auth, "user@example.com");
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
const role = await getUserRole("user@example.com");
console.log("Role:", role);

// Check permissions
const canEdit = hasPermission(role, "blogs", "edit");
console.log("Can edit:", canEdit);
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
