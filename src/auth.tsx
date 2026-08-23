import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from './lib/api';
import { isSupabaseConfigured } from './lib/supabase';
import LoginModal from './LoginModal';

type AuthValue = {
  userId: string | null;
  profile: api.UserProfile | null;
  /** True once the initial session check has finished. */
  ready: boolean;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  signOut: () => void;
  /**
   * Gate for anything that writes. Returns true when signed in; otherwise
   * opens the login modal and returns false so the caller can bail out.
   */
  requireAuth: () => boolean;
};

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<api.UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    api
      .getSession()
      .then((session) => setUserId(session?.user.id ?? null))
      .finally(() => setReady(true));
    return api.onAuthStateChange(setUserId);
  }, []);

  // Keep the profile in step with whoever is signed in.
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    api.getCurrentUser().then((p) => {
      if (!cancelled) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Close the modal as soon as sign-in succeeds.
  useEffect(() => {
    if (userId) setIsLoginOpen(false);
  }, [userId]);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const signOut = useCallback(() => {
    api.signOut().catch((err) => console.error('[NoteBox] 로그아웃 실패:', err));
  }, []);

  const requireAuth = useCallback(() => {
    if (userId) return true;
    setIsLoginOpen(true);
    return false;
  }, [userId]);

  const value = useMemo(
    () => ({ userId, profile, ready, isLoginOpen, openLogin, closeLogin, signOut, requireAuth }),
    [userId, profile, ready, isLoginOpen, openLogin, closeLogin, signOut, requireAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoginOpen && <LoginModal onClose={closeLogin} />}
    </AuthContext.Provider>
  );
}
