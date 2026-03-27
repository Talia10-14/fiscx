import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  
  initialize: () => {
    try {
      const savedToken = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      set({
        token: savedToken,
        user: savedUser ? JSON.parse(savedUser) : null,
      });
    } catch (err) {
      console.error('❌ localStorage error:', err);
      set({ token: null, user: null });
    }
  },
  
  login: (token, user) => {
    try {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user });
    } catch (err) {
      console.error('❌ Login error:', err);
    }
  },
  
  logout: () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      set({ token: null, user: null });
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  },
  
  setUser: (user) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      console.error('❌ setUser error:', err);
    }
  }
}));
