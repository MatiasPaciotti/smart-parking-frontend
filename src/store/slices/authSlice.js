import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null, 
    isRegistered: false,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRegisterSuccess: (state, action) => {
      state.user = action.payload;
      state.isRegistered = true;
      state.loading = false;
      state.error = null;
    },
    setRegisterError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isRegistered = false;
      state.error = null;
      localStorage.removeItem('token'); 
    },
  },
});

export const {
  setLoading,
  setRegisterSuccess,
  setRegisterError,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;