import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('cm360_theme') || 'light';
const savedColor = localStorage.getItem('cm360_color') || 'green';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode:        savedTheme,  // 'light' | 'dark'
    colorScheme: savedColor,  // 'green' | 'blue'
  },
  reducers: {
    toggleDarkMode(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('cm360_theme', state.mode);
    },
    setColorScheme(state, action) {
      state.colorScheme = action.payload;
      localStorage.setItem('cm360_color', state.colorScheme);
    },
  },
});

export const { toggleDarkMode, setColorScheme } = themeSlice.actions;
export default themeSlice.reducer;