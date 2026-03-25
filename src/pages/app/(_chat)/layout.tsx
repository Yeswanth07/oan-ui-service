import ChatLayout from "@/layouts/chat-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public-chat/_chat-layout")({
	component: ChatLayout
});
