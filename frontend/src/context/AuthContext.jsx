import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseLive } from '../services/supabaseClient';

const AuthContext = createContext(null);

const DEMO_USER_STORAGE_KEY = 'agriadviser_demo_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseLive && supabase) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (initialSession) {
            setSession(initialSession);
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email,
              fullName: initialSession.user.user_metadata?.full_name || 'Agronomist',
              farmLocation: initialSession.user.user_metadata?.farm_location || 'Field Station',
              isDemo: false
            });
          }
        } catch (err) {
          console.warn('[Auth] Failed to restore Supabase session:', err);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
          if (currentSession) {
            setSession(currentSession);
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              fullName: currentSession.user.user_metadata?.full_name || 'Agronomist',
              farmLocation: currentSession.user.user_metadata?.farm_location || 'Field Station',
              isDemo: false
            });
          } else {
            // Check if demo user is active in storage
            restoreDemoUserIfAny();
          }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Fallback / Demo Mode
        restoreDemoUserIfAny();
        setLoading(false);
      }
    }

    function restoreDemoUserIfAny() {
      const stored = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setSession({
            access_token: `demo-token-${parsed.id}`,
            user: parsed
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        // Auto-seed default demo account for immediate zero-friction evaluation
        loginAsDemo();
      }
    }

    initAuth();
  }, []);

  const loginAsDemo = () => {
    const demoUser = {
      id: 'demo-farmer-01',
      email: 'agronomist@agriadviser.local',
      fullName: 'Dr. Elena Rostova, Lead Agronomist',
      farmLocation: 'Green Valley Organic Research Farm, OR',
      isDemo: true
    };
    setUser(demoUser);
    setSession({
      access_token: 'demo-token-demo-farmer-01',
      user: demoUser
    });
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    return { success: true, user: demoUser };
  };

  const signIn = async (email, password) => {
    if (isSupabaseLive && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } else {
      // In demo mode, sign in with email directly
      const mockUser = {
        id: 'user-' + btoa(email).slice(0, 8),
        email,
        fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
        farmLocation: 'Private Agricultural Holding',
        isDemo: true
      };
      setUser(mockUser);
      setSession({
        access_token: `demo-token-${mockUser.id}`,
        user: mockUser
      });
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(mockUser));
      return { user: mockUser };
    }
  };

  const signUp = async (email, password, { fullName, farmLocation }) => {
    if (isSupabaseLive && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            farm_location: farmLocation
          }
        }
      });
      if (error) throw error;
      return data;
    } else {
      const mockUser = {
        id: 'user-' + btoa(email).slice(0, 8),
        email,
        fullName: fullName || email.split('@')[0],
        farmLocation: farmLocation || 'Regional Farm Hub',
        isDemo: true
      };
      setUser(mockUser);
      setSession({
        access_token: `demo-token-${mockUser.id}`,
        user: mockUser
      });
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(mockUser));
      return { user: mockUser };
    }
  };

  const signOut = async () => {
    if (isSupabaseLive && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    isSupabaseLive,
    signIn,
    signUp,
    signOut,
    loginAsDemo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

