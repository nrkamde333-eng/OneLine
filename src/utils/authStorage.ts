import { UserProfile } from '../types.ts';

const AUTH_KEYS = {
  CURRENT_USER: 'oneline_current_user',
  ALL_USERS: 'oneline_registered_users',
};

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '••••••••';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `*@${domain}`;
  }
  const prefix = localPart.slice(0, 2);
  const suffix = localPart.slice(-1);
  return `${prefix}••••••${suffix}@${domain}`;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-primary',
    name: 'Workspace Owner',
    email: 'nrkamde333@gmail.com',
    role: 'Business Owner & Dispatch',
    avatarInitials: 'NK',
    isEmailMasked: true,
    isPrivateWorkspace: true,
    connectedGmail: true,
  },
  {
    id: 'user-agent-2',
    name: 'Customer Support Desk',
    email: 'care.desk@enterprise.internal',
    role: 'Support Specialist',
    avatarInitials: 'CS',
    isEmailMasked: true,
    isPrivateWorkspace: true,
    connectedGmail: false,
  },
];

export function getRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.ALL_USERS);
    if (!raw) {
      localStorage.setItem(AUTH_KEYS.ALL_USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) return parsed;
    }
  } catch {
    // fallback
  }
  const users = getRegisteredUsers();
  const primary = users[0] || DEFAULT_USERS[0];
  localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(primary));
  return primary;
}

export function setCurrentUser(user: UserProfile): void {
  try {
    localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(user));
    // also update in all users
    const all = getRegisteredUsers();
    const index = all.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      all[index] = user;
    } else {
      all.push(user);
    }
    localStorage.setItem(AUTH_KEYS.ALL_USERS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}

export function signInWithEmail(
  email: string,
  name?: string,
  role?: string,
  maskByDefault: boolean = true
): UserProfile {
  const cleanEmail = email.trim().toLowerCase();
  const all = getRegisteredUsers();
  const existing = all.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    const updated = {
      ...existing,
      name: name || existing.name,
      role: role || existing.role,
      isEmailMasked: maskByDefault !== undefined ? maskByDefault : existing.isEmailMasked,
    };
    setCurrentUser(updated);
    return updated;
  }

  // Derive initials
  const displayName = name || cleanEmail.split('@')[0] || 'User';
  const nameParts = displayName.split(/[\s._-]+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: displayName,
    email: cleanEmail,
    role: role || 'Business User',
    avatarInitials: initials,
    isEmailMasked: maskByDefault,
    isPrivateWorkspace: true,
    connectedGmail: cleanEmail.endsWith('@gmail.com'),
  };

  setCurrentUser(newUser);
  return newUser;
}

export function signInWithGoogleUser(
  email: string,
  displayName?: string | null,
  photoURL?: string | null,
  maskByDefault: boolean = true
): UserProfile {
  const cleanEmail = email.trim().toLowerCase();
  const all = getRegisteredUsers();
  const existing = all.find((u) => u.email.toLowerCase() === cleanEmail);

  const derivedName = displayName || cleanEmail.split('@')[0] || 'Google User';
  const nameParts = derivedName.split(/[\s._-]+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : derivedName.slice(0, 2).toUpperCase();

  const profile: UserProfile = {
    id: existing?.id || `user-google-${Date.now()}`,
    name: derivedName,
    email: cleanEmail,
    role: existing?.role || 'Customer Care & Business Lead',
    avatarInitials: initials,
    avatarUrl: photoURL || undefined,
    isEmailMasked: existing ? existing.isEmailMasked : maskByDefault,
    isPrivateWorkspace: true,
    connectedGmail: true,
    isGoogleAuthenticated: true,
    lastGmailSync: Date.now(),
  };

  setCurrentUser(profile);
  return profile;
}

export function updateUserGmailSync(email: string): void {
  const all = getRegisteredUsers();
  const user = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    const updated = {
      ...user,
      connectedGmail: true,
      lastGmailSync: Date.now(),
    };
    setCurrentUser(updated);
  }
}

export function toggleEmailMasking(currentUser: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...currentUser,
    isEmailMasked: !currentUser.isEmailMasked,
  };
  setCurrentUser(updated);
  return updated;
}

