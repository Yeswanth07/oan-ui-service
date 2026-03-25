import { cn } from "@/lib/utils";
import { TextMessage } from "./chat-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
	p: ({ children }) => <p className="m-0 leading-relaxed">{children}</p>,
	a: ({ href, children }) => (
		<a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
			{children}
		</a>
	),
	pre: ({ children }) => (
		<pre className="bg-muted/50 p-2 rounded-lg overflow-x-auto">{children}</pre>
	),
	code: ({ className, children, ...props }) => {
		const match = /language-(\w+)/.exec(className || "");
		const isInline = !match;
		return isInline ? (
			<code className="bg-muted/50 rounded px-1 py-0.5" {...props}>{children}</code>
		) : (
			<code className={className} {...props}>{children}</code>
		);
	},
	hr: () => (
		<hr className="border-none h-px my-4 bg-primary/30 dark:bg-primary/40" />
	),
};

export function TextBubble({ message }: { message: TextMessage }) {
	const isUser = message.role === "user";

	return (
		<div
			className={cn(
				"max-w-full rounded-[20px] px-4 py-3 text-base shadow-sm sm:max-w-[85%]",
				isUser
					? "rounded-tr-md bg-[var(--secondary)] text-black dark:bg-[var(--userBubble-dark)] dark:text-[var(--userBubbleText-dark)]"
					: "rounded-tl-md border bg-card text-card-foreground dark:bg-[var(--aiBubble-dark)] dark:text-[var(--aiBubbleText-dark)] dark:border-[var(--border-dark)]"
			)}
		>
			<div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeRaw]}
					components={markdownComponents}
				>
					{message.text}
				</ReactMarkdown>
			</div>
		</div>
	);
}
