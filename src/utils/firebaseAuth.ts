import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Workspace Scopes for Gmail
export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
];

/**
 * Creates a configured GoogleAuthProvider instance.
 * Using prompt: 'consent select_account' forces Google to show the consent dialog
 * so the user can grant permission to access Gmail inbox.
 */
export const createGoogleAuthProvider = () => {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach((scope) => provider.addScope(scope));
  provider.setCustomParameters({
    prompt: 'consent select_account',
  });
  return provider;
};

// Flag to track ongoing sign in flow to prevent concurrent popups
let isSigningIn = false;

// In-memory cache for OAuth access token (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

/**
 * Inspect scopes granted to an OAuth access token using Google TokenInfo API
 */
export const inspectTokenScopes = async (accessToken: string): Promise<string[]> => {
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.scope === 'string') {
        return data.scope.split(' ').map((s: string) => s.trim()).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('Could not inspect token scopes via tokeninfo endpoint:', err);
  }
  return [];
};

/**
 * Initialize auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Cached token cleared on page reload; user is still authenticated in Firebase Auth
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform Google Sign-In with popup to request Gmail OAuth scopes.
 * Caches access token strictly in-memory.
 */
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
  scopes: string[];
} | null> => {
  if (isSigningIn) {
    console.warn('Google Sign-In is already running. Please complete or dismiss the open window.');
    return null;
  }

  isSigningIn = true;
  try {
    const provider = createGoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from OAuth credential');
    }

    const token = credential.accessToken;
    cachedAccessToken = token;

    // Check granted scopes to verify if user checked the Gmail permission box
    const grantedScopes = await inspectTokenScopes(token);
    const hasGmailScope =
      grantedScopes.length === 0 || // If inspection failed or endpoint didn't respond, let Gmail API check proceed
      grantedScopes.some(
        (s) =>
          s.includes('gmail.readonly') ||
          s.includes('mail.google.com') ||
          s.includes('gmail.modify')
      );

    if (grantedScopes.length > 0 && !hasGmailScope) {
      cachedAccessToken = null;
      throw new Error(
        'Gmail permission was not granted. When the Google window appears, please make sure the checkbox for "View your email messages and settings" is checked.'
      );
    }

    return { user: result.user, accessToken: token, scopes: grantedScopes };
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      console.info('Google Sign-In popup was closed or cancelled by the user.');
    } else {
      console.error('Google Sign-In error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve cached in-memory access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Check if active token exists in memory.
 */
export const hasCachedToken = (): boolean => {
  return Boolean(cachedAccessToken);
};

/**
 * Invalidate cached in-memory access token.
 */
export const clearCachedToken = (): void => {
  cachedAccessToken = null;
};

/**
 * Sign out of Firebase Auth and clear in-memory token.
 */
export const logoutGoogle = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
  }
};
