import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Suggestion } from "../api/suggestions-api";

interface SuggestionsProps {
	suggestions: Suggestion[];
	onSuggestionClick: (text: string) => void;
	className?: string;
}

export function Suggestions({
	suggestions,
	onSuggestionClick,
	className
}: SuggestionsProps) {
	if (!suggestions.length) return null;

	return (
		<div
			className={cn(
				"flex w-full gap-2 overflow-x-auto pb-3 sm:pb-4 scrollbar-none relative z-30",
				className
			)}
		>
			<div className="flex gap-3 px-2 mt-2">
				{suggestions.map((suggestion) => (
					<Button
						key={suggestion.id}
						variant="outline"
						size="sm"
						className="h-auto min-h-[44px] shrink-0 whitespace-normal rounded-xl border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-black shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-[var(--border-dark)] dark:bg-[var(--suggestionBg-dark)] dark:text-[var(--suggestionText-dark)] dark:hover:bg-[var(--suggestionBg-dark)]/90 cursor-pointer"
						onClick={() => onSuggestionClick(suggestion.text)}
					>
						{suggestion.text}
					</Button>
				))}
			</div>
		</div>
	);
}
