import { Button } from "@/components/ui/button";
import { QuickRepliesMessage } from "./chat-types";

/* eslint-disable no-unused-vars */
type QuickRepliesBubbleProps = {
	message: QuickRepliesMessage;
	onQuickReply?: (payload: string) => void;
};
/* eslint-enable no-unused-vars */

export function QuickRepliesBubble(props: QuickRepliesBubbleProps) {
	const { message, onQuickReply } = props;

	return (
		<div className="max-w-[94%] sm:max-w-[78%]">
			{message.prompt ? (
				<div className="mb-2 rounded-2xl border bg-card px-3 py-2 text-sm">{message.prompt}</div>
			) : null}

			<div className="flex flex-wrap gap-2">
				{message.replies.map((r) => (
					<Button
						key={r.id}
						variant="outline"
						className="h-9 rounded-full px-4 text-sm text-[#077439]"
						onClick={() => onQuickReply?.(r.payload ?? r.label)}
					>
						{r.label}
					</Button>
				))}
			</div>
		</div>
	);
}
