import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = any;

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setUser, setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
