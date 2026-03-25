/* import { useAuthStore } from "@/hooks/store/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { is } from "zod/v4/locales";

export const Route = createFileRoute("/_authenticate/_app-layout/_require-admin")({
  beforeLoad: ({ location }) => {
    const {isAdmin} = useAuthStore.getState();
    if (isAdmin ()) {
      throw redirect({
        to: "/403",
        search: { from: location.pathname },
        replace: true,
      });
    }
  },
  component: Outlet,
}); */
