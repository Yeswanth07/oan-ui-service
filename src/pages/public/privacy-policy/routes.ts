import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicy from ".";

export const Route = createFileRoute("/_restrict-login-signup/privacy-policy")({
  component: PrivacyPolicy,
});