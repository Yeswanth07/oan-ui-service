import { createFileRoute } from "@tanstack/react-router";
import Profile from "./index";

export const Route = createFileRoute("/_authenticate/_app-layout/profile")({
	component: Profile
});
