import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState(null);
  const navigate = useNavigate();

  const loadOrganizations = async (user) => {
    if (!user) {
      setOrganizations([]);
      setActiveOrganizationId(null);
      return;
    }

    if (user.role !== 'super_admin') {
      const organization = user.organization_id
        ? (await supabase.from('organizations').select('*').eq('id', user.organization_id).maybeSingle()).data
        : null;
      setOrganizations(organization ? [organization] : []);
      setActiveOrganizationId(organization?.id || null);
      return;
    }

    const { data: records = [], error } = await supabase.from('organizations').select('*').order('name');
    if (error) throw error;
    const storedId = localStorage.getItem(`worshipstage:active-organization:${user.id}`);
    const nextId = records.some((organization) => organization.id === storedId)
      ? storedId
      : (records.some((organization) => organization.id === user.organization_id)
        ? user.organization_id
        : records[0]?.id || null);

    setOrganizations(records);
    setActiveOrganizationId(nextId);
  };

  useEffect(() => {
    const loadSession = async (session) => {
      try {
        if (!session?.user) {
          setCurrentUser(null);
          await loadOrganizations(null);
          return;
        }
        const { data: profile, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (error) throw error;
        if (profile.status !== 'active') {
          await supabase.auth.signOut();
          throw new Error('This account is inactive.');
        }
        setCurrentUser(profile);
        await loadOrganizations(profile);
      } catch (error) {
        console.error('Supabase session load failed:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => loadSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => loadSession(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase.from('users').select('*').eq('id', authData.user.id).single();
      if (profileError) throw profileError;
      setCurrentUser(profile);
      await loadOrganizations(profile);
      toast.success('Welcome back!');
      navigate('/dashboard');
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials.');
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setOrganizations([]);
    setActiveOrganizationId(null);
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const selectOrganization = (organizationId) => {
    if (currentUser?.role !== 'super_admin') return;
    if (!organizationId) return;

    localStorage.setItem(`worshipstage:active-organization:${currentUser.id}`, organizationId);
    setActiveOrganizationId(organizationId);
  };

  const refreshOrganizations = async () => {
    await loadOrganizations(currentUser);
  };

  const activeOrganization = organizations.find(
    (organization) => organization.id === activeOrganizationId
  ) || null;

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent.');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to send reset email.');
      throw error;
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    resetPassword,
    organizations,
    activeOrganizationId,
    activeOrganization,
    selectOrganization,
    refreshOrganizations,
    isAuthenticated: !!currentUser,
    updatePassword: async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
