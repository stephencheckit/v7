'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import * as Sentry from '@sentry/nextjs';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  workspaceId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (firstName: string, lastName: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => {
    // Optimistically load from cache for instant UI
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_workspace_id');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserWorkspace(session.user.id);
        // Set Sentry user context
        Sentry.setUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.email?.split('@')[0],
        });
      } else {
        // No user, clear cached workspace
        setWorkspaceId(null);
        localStorage.removeItem('current_workspace_id');
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserWorkspace(session.user.id);
        // Set Sentry user context on sign in
        Sentry.setUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.email?.split('@')[0],
        });
      } else {
        setWorkspaceId(null);
        localStorage.removeItem('current_workspace_id');
        // Clear Sentry user context on sign out
        Sentry.setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserWorkspace = async (userId: string) => {
    try {
      // Get user's primary workspace
      const { data, error } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .order('joined_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        // If no workspace found, wait a moment and try again (trigger might be processing)
        if (error.code === 'PGRST116') {
          console.log('No workspace found yet, retrying in 1 second...');
          setTimeout(() => loadUserWorkspace(userId), 1000);
          return;
        }
        console.error('Error loading workspace:', error);
        return;
      }

      if (data) {
        setWorkspaceId(data.workspace_id);
        // Store in localStorage for quick access
        localStorage.setItem('current_workspace_id', data.workspace_id);
        // Add workspace context to Sentry
        Sentry.setContext('workspace', {
          workspace_id: data.workspace_id,
        });
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || '',
          last_name: lastName || '',
        }
      }
    });
    if (error) throw error;
  };

  const updateProfile = async (firstName: string, lastName: string, phone?: string) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || '',
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('current_workspace_id');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        workspaceId,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

