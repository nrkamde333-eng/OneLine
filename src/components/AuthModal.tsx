import React, { useState } from 'react';
import {
  X,
  Mail,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Users,
  Lock,
  RefreshCw,
  LogOut,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserProfile, OfficeMessage } from '../types.ts';
import { maskEmail, signInWithGoogleUser } from '../utils/authStorage.ts';
import {
  googleSignIn,
  getAccessToken,
  logoutGoogle,
  hasCachedToken,
} from '../utils/firebaseAuth.ts';
import {
  fetchGmailInboxMessages,
  fetchGmailProfile,
} from '../utils/gmailService.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  registeredUsers: UserProfile[];
  onSignIn: (email: string, name?: string, role?: string, maskEmail?: boolean) => void;
  onSwitchUser: (user: UserProfile) => void;
  onToggleMasking: () => void;
  onGmailDataLoaded?: (user: UserProfile, emails: OfficeMessage[]) => void;
  onGoogleLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  registeredUsers,
  onSignIn,
  onSwitchUser,
  onToggleMasking,
  onGmailDataLoaded,
  onGoogleLogout,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('Customer Care & Business Lead');
  const [maskOption, setMaskOption] = useState(true);
  const [isolateOption, setIsolateOption] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth flow states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleStatusText, setGoogleStatusText] = useState<string | null>(null);
  const [googleSuccessSummary, setGoogleSuccessSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  // Direct Google OAuth Flow with Gmail API Inbox Fetch
  const handleGoogleSignInFlow = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setGoogleSuccessSummary(null);
    setGoogleStatusText('Opening Google Sign-In...');

    try {
      const result = await googleSignIn();
      if (!result) {
        // Sign-in was already in progress or dismissed
        return;
      }

      setGoogleStatusText('Connecting to Gmail API & fetching profile...');
      const userEmail = result.user.email || '';
      const userName = result.user.displayName || userEmail.split('@')[0] || 'Google User';
      const userPhoto = result.user.photoURL;

      // Fetch profile to verify token permissions
      let profileInfo = null;
      try {
        profileInfo = await fetchGmailProfile(result.accessToken);
      } catch (profileErr) {
        console.warn('Could not fetch profile, continuing to inbox:', profileErr);
      }

      setGoogleStatusText('Fetching recent inbox emails from your Gmail account...');
      const gmailEmails = await fetchGmailInboxMessages(result.accessToken, 15);

      // Create / update authenticated user profile
      const finalEmail = profileInfo?.emailAddress || userEmail;
      const updatedProfile = signInWithGoogleUser(
        finalEmail,
        userName,
        userPhoto,
        maskOption
      );

      setGoogleStatusText(null);
      setGoogleSuccessSummary(
        `Connected as ${maskOption ? maskEmail(finalEmail) : finalEmail}. Loaded ${
          gmailEmails.length
        } inbox emails.`
      );

      // Dispatch to parent workspace
      if (onGmailDataLoaded) {
        onGmailDataLoaded(updatedProfile, gmailEmails);
      }

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        console.info('Google sign-in popup was closed by user.');
        setError('The Google sign-in window was closed. Click "Sign in with Google" when you are ready to connect.');
      } else {
        console.error('Google OAuth & Gmail fetch error:', err);
        let errMsg = 'Failed to authenticate with Google.';
        if (err?.message) {
          errMsg = err.message;
        }
        setError(errMsg);
      }
    } finally {
      setIsGoogleLoading(false);
      setGoogleStatusText(null);
    }
  };

  // Re-sync inbox if already authenticated
  const handleSyncExistingGmail = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setGoogleSuccessSummary(null);
    setGoogleStatusText('Checking Gmail authorization...');

    try {
      let token = await getAccessToken();
      if (!token) {
        // Need to re-prompt for access token
        setGoogleStatusText('Requesting fresh Gmail access token...');
        const res = await googleSignIn();
        if (!res) throw new Error('Authorization cancelled');
        token = res.accessToken;
      }

      setGoogleStatusText('Fetching recent messages from your Gmail inbox...');
      const gmailEmails = await fetchGmailInboxMessages(token, 15);

      const updatedProfile = signInWithGoogleUser(
        currentUser.email,
        currentUser.name,
        currentUser.avatarUrl,
        currentUser.isEmailMasked
      );

      setGoogleSuccessSummary(`Successfully refreshed ${gmailEmails.length} Gmail messages!`);
      if (onGmailDataLoaded) {
        onGmailDataLoaded(updatedProfile, gmailEmails);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Could not sync Gmail inbox.');
    } finally {
      setIsGoogleLoading(false);
      setGoogleStatusText(null);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await logoutGoogle();
      if (onGoogleLogout) {
        onGoogleLogout();
      }
      setGoogleSuccessSummary('Google session disconnected.');
    } catch (err: any) {
      setError(err?.message || 'Failed to disconnect Google.');
    }
  };

  // Standard manual sign-in fallback for custom workspace accounts
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setError('Please enter a valid email address (e.g., nrkamde333@gmail.com).');
      return;
    }
    setError(null);
    onSignIn(
      emailInput.trim(),
      nameInput.trim() || undefined,
      roleInput.trim() || undefined,
      maskOption
    );
    setEmailInput('');
    setNameInput('');
    onClose();
  };

  const isGoogleActive = Boolean(
    currentUser.isGoogleAuthenticated || (currentUser.connectedGmail && hasCachedToken())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-violet-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Account & Real Gmail Integration</h3>
              <p className="text-[11px] text-violet-200">
                Google OAuth sign-in & private workspace protection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-violet-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active User Card & Privacy Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-violet-500/20 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-violet-800 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  {currentUser.avatarInitials}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </span>
                  {isGoogleActive && (
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      Gmail Linked
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                    Active Session
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate">
                    {currentUser.isEmailMasked
                      ? maskEmail(currentUser.email)
                      : currentUser.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Shield Toggle */}
            <button
              type="button"
              onClick={onToggleMasking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                currentUser.isEmailMasked
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Toggle email masking for privacy"
            >
              {currentUser.isEmailMasked ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Masked (Protected)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mask Email ID</span>
                </>
              )}
            </button>
          </div>

          {/* Status and Error Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">Authentication / Permission Required</p>
                  <p className="mt-0.5 leading-relaxed text-rose-700">{error}</p>
                </div>
              </div>

              {(error.toLowerCase().includes('permission') ||
                error.toLowerCase().includes('scope') ||
                error.toLowerCase().includes('gmail')) && (
                <div className="pt-2 border-t border-rose-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-800 font-medium">
                    Ensure the <strong>"View your email messages and settings"</strong> checkbox is checked in the Google window.
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleSignInFlow}
                    disabled={isGoogleLoading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    Grant Permission & Reconnect
                  </button>
                </div>
              )}
            </div>
          )}

          {googleStatusText && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2.5 animate-pulse">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
              <span className="font-medium">{googleStatusText}</span>
            </div>
          )}

          {googleSuccessSummary && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{googleSuccessSummary}</span>
            </div>
          )}

          {/* PRIMARY SECTION: GOOGLE OAUTH & GMAIL INTEGRATION */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Official Google OAuth Flow</span>
                </span>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                Real Gmail API
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sign in with your personal or business Gmail account. The app securely fetches your
              real inbox emails, displays message threads, and enables AI summarization and smart reply drafting.
            </p>

            {/* Official Google Sign-In Button */}
            {!isGoogleActive ? (
              <button
                type="button"
                onClick={handleGoogleSignInFlow}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5 block"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span>
                  {isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google & Fetch Inbox'}
                </span>
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    Connected with Google account: <strong>{currentUser.email}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncExistingGmail}
                    disabled={isGoogleLoading}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGoogleLoading ? 'animate-spin' : ''}`} />
                    <span>Sync Recent Gmail Emails</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectGoogle}
                    className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Disconnect Google session"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>User Isolation & Privacy Guarantee</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              When authenticating with Google or signing into this workspace, other users will{' '}
              <strong>never see your real email address or private emails</strong>. All fetched messages
              are partitioned strictly to your authenticated session.
            </p>
          </div>

          {/* SECONDARY: MANUAL EMAIL SIGN-IN */}
          <div className="pt-2 border-t border-slate-200">
            <details className="group">
              <summary className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none flex items-center justify-between py-1">
                <span>Or Enter Email ID Manually</span>
                <span className="text-[11px] text-slate-400 font-normal lowercase group-open:hidden">
                  (click to expand)
                </span>
              </summary>

              <form onSubmit={handleManualSubmit} className="space-y-4 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. nrkamde333@gmail.com or name@company.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Nitin Kamde"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role
                    </label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                      <option value="Customer Care & Business Lead">Customer Care Lead</option>
                      <option value="Executive Business Owner">Executive Business Owner</option>
                      <option value="Support Operations Desk">Support Operations Desk</option>
                    </select>
                  </div>
                </div>

                {/* Privacy Checkboxes */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maskOption}
                      onChange={(e) => setMaskOption(e.target.checked)}
                      className="mt-0.5 rounded text-violet-700 focus:ring-violet-500"
                    />
                    <span>
                      <strong>Mask email ID by default:</strong> Protect your email address on screen
                      with privacy bullets.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In & Open Workspace</span>
                </button>
              </form>
            </details>
          </div>

          {/* Quick Switcher for Existing User Accounts */}
          {registeredUsers.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Switch to Existing Account on this Device</span>
              </h4>

              <div className="space-y-2">
                {registeredUsers.map((user) => {
                  const isActive = user.id === currentUser.id;
                  return (
                    <div
                      key={user.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                        isActive
                          ? 'bg-violet-50/70 border-violet-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-7 h-7 rounded-md object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-slate-700 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            {user.avatarInitials}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="truncate">{user.name}</span>
                            {user.isGoogleAuthenticated && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded font-bold">
                                Google
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[10px] text-violet-700 font-bold">
                                (Current)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {user.isEmailMasked ? maskEmail(user.email) : user.email}
                          </div>
                        </div>
                      </div>

                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchUser(user);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-violet-800 bg-violet-100 hover:bg-violet-200 rounded transition-colors cursor-pointer shrink-0"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
