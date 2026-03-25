import { MessageChrome } from "./message-chrome";
import { CHAT_ASSISTANT } from "../config";

export function ListeningIndicator() {
	return (
		<MessageChrome role="assistant" showLabel={false}>
			<div className="flex flex-col gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm">
				<div className="text-sm font-medium text-primary">{CHAT_ASSISTANT.name} is listening...</div>
				<div className="flex items-end gap-1">
					{Array.from({ length: 14 }).map((_, idx) => {
						const height = 6 + ((idx * 7) % 18);
						return (
							<span
								key={`bar-${idx}`}
								className="w-[3px] animate-pulse rounded-full bg-primary"
								style={{
									height,
									animationDelay: `${idx * 60}ms`
								}}
							/>
						);
					})}
				</div>
			</div>
		</MessageChrome>
	);
}
