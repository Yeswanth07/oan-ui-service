import { createFileRoute } from "@tanstack/react-router";
import ForgotPassword from "./index";

export const Route = createFileRoute("/_restrict-login-signup/forgot-password")({
  component: ForgotPassword,
});
