import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '~/services/authService';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Initialize theme from user preferences
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.preferences?.theme) {
      setTheme(currentUser.preferences.theme as Theme);
      applyTheme(currentUser.preferences.theme as Theme);
    } else {
      // Fallback to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      applyTheme(systemTheme);
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Update CSS custom properties based on theme
    if (newTheme === 'dark') {
      root.style.setProperty('--color-background-primary', 'var(--color-background-dark-primary)');
      root.style.setProperty('--color-background-secondary', 'var(--color-background-dark-secondary)');
      root.style.setProperty('--color-background-tertiary', 'var(--color-background-dark-tertiary)');
      root.style.setProperty('--color-text-primary', 'var(--color-text-light)');
      root.style.setProperty('--color-text-secondary', 'var(--color-text-accent)');
      root.style.setProperty('--color-border-primary', 'var(--color-border-dark)');
    } else {
      root.style.setProperty('--color-background-primary', 'var(--color-background-light)');
      root.style.setProperty('--color-background-secondary', 'var(--color-background-light-secondary)');
      root.style.setProperty('--color-background-tertiary', 'var(--color-background-light)');
      root.style.setProperty('--color-text-primary', 'var(--color-text-dark)');
      root.style.setProperty('--color-text-secondary', 'var(--color-text-muted)');
      root.style.setProperty('--color-border-primary', 'var(--color-border-light)');
    }
  };

  // Update theme and save to backend
  const updateTheme = async (newTheme: Theme) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?._id) {
        throw new Error('User not authenticated');
      }

      // Update theme locally first for immediate UI feedback
      setTheme(newTheme);
      applyTheme(newTheme);

      // Update theme in backend
      const result = await authService.updateUserPreferences(currentUser._id, { theme: newTheme });
      
      if (result.success) {
        // Invalidate queries to refresh user data
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      } else {
        // Revert theme change if backend update failed
        const currentUserTheme = currentUser.preferences.theme as Theme;
        setTheme(currentUserTheme);
        applyTheme(currentUserTheme);
        throw new Error(result.error || 'Failed to update theme');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      // Revert to previous theme on error
      const currentUser = authService.getCurrentUser();
      if (currentUser?.preferences?.theme) {
        const currentUserTheme = currentUser.preferences.theme as Theme;
        setTheme(currentUserTheme);
        applyTheme(currentUserTheme);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  return {
    theme,
    isLoading,
    updateTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};
