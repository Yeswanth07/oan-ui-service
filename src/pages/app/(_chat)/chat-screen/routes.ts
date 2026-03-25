import { createFileRoute } from "@tanstack/react-router";
import ChatScreen from ".";

export const Route = createFileRoute("/_public-chat/_chat-layout/chat")({
	validateSearch: (search: Record<string, unknown>): { token?: string } => {
		return {
			token: search.token as string,
		};
	},
	component: ChatScreen
});
