import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>): { token?: string } => {
		return {
			token: search.token as string,
		};
	},
	beforeLoad: ({ search }) => {
		throw redirect({ 
			to: "/chat", 
			search: (old: any) => ({
				...old,
				token: search.token,
			}),
			replace: true 
		});
	}
});
