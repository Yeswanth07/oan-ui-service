
import { createFileRoute } from "@tanstack/react-router";
import Login from "./index";

export const Route = createFileRoute("/_restrict-login-signup/login")({
  component: Login,
});
