import { useAuthStore } from "@/hooks/store/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticate")({
  beforeLoad: ({ location }) => {
    const {isAuthed} = useAuthStore.getState();
    if (!isAuthed()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href }, // optional
        replace: true,
      });
    }
  },
  component: Outlet,
});
