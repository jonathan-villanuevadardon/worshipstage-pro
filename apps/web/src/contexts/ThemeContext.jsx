import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/supabaseClient';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState(() => {
    // Default to system, check local storage
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    // Sync from user preference if available
    if (currentUser?.theme_preference && currentUser.theme_preference !== theme) {
      setTheme(currentUser.theme_preference);
      localStorage.setItem('theme', currentUser.theme_preference);
    }
  }, [currentUser]);

  useEffect(() => {
    const applyTheme = (currentTheme) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      let actualTheme = currentTheme;
      if (currentTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        actualTheme = systemTheme;
      }

      root.classList.add(actualTheme);
      setResolvedTheme(actualTheme);
    };

    applyTheme(theme);

    // Listen for system theme changes if set to system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = async () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (currentUser) {
      try {
        await pb.collection('users').update(currentUser.id, {
          theme_preference: newTheme
        }, { $autoCancel: false });
      } catch (err) {
        console.error('Failed to save theme preference', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};