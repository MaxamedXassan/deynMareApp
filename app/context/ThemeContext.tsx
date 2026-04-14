import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Midabada aan isticmaalayno
export const Colors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    subText: '#64748B',
    border: '#E2E8F0',
    primary: '#3B82F6',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    subText: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
  }
};

const ThemeContext = createContext({
  isDark: false,
  theme: Colors.light,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    // Ka soo aqri AsyncStorage haddii uu horey u doortay Dark Mode
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('user_theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('user_theme', newTheme ? 'dark' : 'light');
  };

  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);