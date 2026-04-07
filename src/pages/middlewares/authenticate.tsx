import { useAuthStore } from "@/hooks/store/auth";
import { env } from "@/config/env";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticate")({
  beforeLoad: ({ location }) => {
    const { isAuthed, setSession } = useAuthStore.getState();
    if (!isAuthed()) {
      // DEV BYPASS: skip login in development mode
      if (env.mode === "development") {
        setSession({
          access_token: "dev-bypass-token",
          refresh_token: "dev-bypass-refresh",
          expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
          user: {
            id: "dev-user",
            email: "dev@localhost",
            name: "Dev User",
            role: "admin",
            user_metadata: { is_admin: true },
          },
        });
        return; // allow through
      }

      throw redirect({
        to: "/login",
        search: { redirect: location.href }, // optional
        replace: true,
      });
    }
  },
  component: Outlet,
});

