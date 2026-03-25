import { SystemMessage } from "./chat-types";

export function SystemBubble({ message }: { message: SystemMessage }) {
	return (
		<div className="flex w-full justify-center">
			<div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
				{message.text}
			</div>
		</div>
	);
}
