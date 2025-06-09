import { createSlice } from '@reduxjs/toolkit';

// Initial state for the user slice
// We read from localStorage for username, email, and password to persist them across reloads
const storedUser = JSON.parse(localStorage.getItem('user')) || {};

const initialState = {
  username: storedUser.username || '',
  email: storedUser.email || '',
  is_active: storedUser.is_active || null,
  is_admin: storedUser.is_admin || null,
  login_attempts: storedUser.login_attempts || 0,
  created_at: storedUser.created_at || '',
  updated_at: storedUser.updated_at || '',
};


// Create a Redux slice for the user
const userSlice = createSlice({
  name: 'user',         // The name of the slice (used internally by Redux)
  initialState,         // The default state defined above
  reducers: {

    setUserFromLocalStorage: (state) => {
      state.username = localStorage.getItem('username') || '';
      state.email = localStorage.getItem('email') || '';
      state.password = localStorage.getItem('password') || '';
    },

    // Updates the Redux state using data received from the backend (PostgreSQL)
    setUserFromServer: (state, action) => {
    const {
        username,
        email,
        password,
        is_active,
        is_admin,
        login_attempts,
        created_at,
        updated_at,
    } = action.payload;

    state.username = username;
    state.email = email;
    state.password = password;
    state.is_active = is_active;
    state.is_admin = is_admin;
    state.login_attempts = login_attempts;
    state.created_at = created_at;
    state.updated_at = updated_at;
    },


    // Clears both Redux and localStorage user data during logout
    clearUser: (state) => {
    Object.assign(state, {
        username: '',
        email: '',
        password: '',
        is_active: null,
        is_admin: null,
        login_attempts: 0,
        created_at: '',
        updated_at: '',
    });
    localStorage.clear();
    }

  },
});

export const { setUserFromLocalStorage, setUserFromServer, clearUser } = userSlice.actions;
export default userSlice.reducer;
