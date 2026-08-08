import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Default to light, but respect localStorage if present
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button 
      onClick={() => setIsDark(!isDark)} 
      className="nav-item"
      title="Toggle Theme"
    >
      {isDark ? <SunIcon style={{ width: 24, height: 24 }} /> : <MoonIcon style={{ width: 24, height: 24 }} />}
    </button>
  );
}
