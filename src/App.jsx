import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import AppRouter from './routes/AppRouter';

export default function App() {
  const { theme, colorScheme } = useSelector((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    // Apply dark mode
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply color scheme (green or blue)
    if (colorScheme === 'blue') {
      root.classList.add('theme-blue');
    } else {
      root.classList.remove('theme-blue');
    }
  }, [theme, colorScheme]);

  return (
    <>
      <AppRouter />

      {/* Toast Notifications — color-coded */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
          },
          success: {
            style: {
              background: '#22c55e',
              color: '#ffffff',
            },
            iconTheme: { primary: '#fff', secondary: '#22c55e' },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#ffffff',
            },
            iconTheme: { primary: '#fff', secondary: '#ef4444' },
          },
          // For info/warning, use toast.custom() — see useToast.js
        }}
      />
    </>
  );
}