export type User = {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
  is_guest_user?: boolean;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // epoch seconds
  user: User | null;

  setSession: (s: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: User;
  }) => void;

  clear: () => void;

  isAuthed: () => boolean;
  isAdmin: () => boolean; 
};