import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "./index";

export const Route = createFileRoute("/_public-chat/_chat-layout/settings")({
	component: SettingsPage
});
