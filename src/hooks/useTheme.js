// src/hooks/useTheme.js
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, setColorScheme } from '../app/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const { mode, colorScheme } = useSelector((s) => s.theme);

  return {
    isDark:      mode === 'dark',
    colorScheme,
    toggleDark:  () => dispatch(toggleDarkMode()),
    setColor:    (c) => dispatch(setColorScheme(c)),
  };
};