import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    unreadCount: 3,
    items: [],
  },
  reducers: {
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    decrementUnread(state) {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
  },
});

export const { setUnreadCount, decrementUnread, clearUnread } = notificationSlice.actions;
export default notificationSlice.reducer;