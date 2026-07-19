'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';

interface SettingsContextType {
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('travora_reduce_motion') === 'true';
    setReduceMotionState(saved);
    if (saved) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, []);

  const setReduceMotion = (reduce: boolean) => {
    setReduceMotionState(reduce);
    localStorage.setItem('travora_reduce_motion', String(reduce));
    if (reduce) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  return (
    <SettingsContext.Provider value={{ reduceMotion, setReduceMotion }}>
      <MotionConfig transition={reduceMotion ? { type: 'tween', duration: 0 } : undefined}>
        {children}
      </MotionConfig>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
