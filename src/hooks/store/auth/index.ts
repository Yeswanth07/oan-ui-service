import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState } from "./type";
import { tokenService } from "@/lib/utils/tokenServices";



export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,

      setSession: (s) => {
        tokenService.setTokens(s.access_token, s.refresh_token);
        tokenService.setExpiry(s.expires_at);
        set({
          accessToken: s.access_token,
          refreshToken: s.refresh_token,
          expiresAt: s.expires_at,
          user: s.user,
        });
      },

      clear: () => {
        tokenService.clear();
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
        });
      },

      isAuthed: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;
        const now = Math.floor(Date.now() / 1000);
        return expiresAt > now;
      },

      isAdmin: () => {
        const u = get().user;
        return Boolean(u?.user_metadata?.is_admin === true || u?.user_metadata?.role === "admin");
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
        user: s.user,
      }),
    }
  )
);

export const authState = () => useAuthStore.getState();
