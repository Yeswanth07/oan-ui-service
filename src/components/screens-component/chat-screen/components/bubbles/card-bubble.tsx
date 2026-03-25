import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ThumbsDown, ThumbsUp, Volume2, Check, Pause, Play } from "lucide-react";
import { CardMessage } from "./chat-types";
import { FeedbackModal } from "../feedback-modal";
import { useChatStore } from "@/hooks/store/chat";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";
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

export function CardBubble({ message }: { readonly message: CardMessage }) {
	const { language } = useLanguage();
	const playTTS = useChatStore((s) => s.playTTS);
	const pauseTTS = useChatStore((s) => s.pauseTTS);
	const resumeTTS = useChatStore((s) => s.resumeTTS);
	const currentlyPlayingId = useChatStore((s) => s.currentlyPlayingId);
	const ttsStatus = useChatStore((s) => s.ttsStatus);
	const submitFeedback = useChatStore((s) => s.submitMessageFeedback);
	const setToast = useChatStore((s) => s.setToast);

	const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showCopySuccess, setShowCopySuccess] = useState(false);
	const [showThumbsUpSuccess, setShowThumbsUpSuccess] = useState(false);
	const [showThumbsDownSuccess, setShowThumbsDownSuccess] = useState(false);

	const isThisPlaying = currentlyPlayingId === message.id && ttsStatus === "playing";
	const isThisPaused = currentlyPlayingId === message.id && ttsStatus === "paused";

	const handleListen = async () => {
		try {
			if (isThisPlaying) {
				pauseTTS();
			} else if (isThisPaused) {
				await resumeTTS();
			} else {
				await playTTS(message.body, language, message.id);
			}
		} catch (error) {
			console.error("TTS action failed:", error);
		}
	};

	const handleThumbsUp = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);

		try {
			await submitFeedback(message.id, true);
			setShowThumbsUpSuccess(true);
		} catch (error) {
			console.error("Thumbs up failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleThumbsDown = () => {
		setFeedbackModalOpen(true);
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(message.body);
			setShowCopySuccess(true);
			setTimeout(() => setShowCopySuccess(false), 1000);
			// setToast({ message: "The message has been copied to your clipboard", type: "success" });
		} catch (error) {
			console.error(error);
			setToast({ message: "Failed to copy to clipboard. Please try again", type: "error" });
		}
	};

	const handleFeedbackSubmit = async (
		reason: string,
		feedbackMessage: string
	) => {
		setIsSubmitting(true);
		setFeedbackModalOpen(false);

		try {
			await submitFeedback(message.id, false, reason, feedbackMessage);
			setShowThumbsDownSuccess(true);
		} catch (error) {
			console.error("Feedback submission failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// AI Messages are always cards in this design
	return (
		<>
			<div className="w-full max-w-[95%] sm:max-w-[90%] mb-8">
				<Card className="relative rounded-2xl border-none bg-white p-4 shadow-sm overflow-hidden dark:bg-[var(--aiBubble-dark)] dark:border-[var(--border-dark)]">
					{/* Content */}
					<div>
						{message.title ? (
							<div className="mb-2 text-base font-bold">{message.title}</div>
						) : null}

						<div className={cn("prose prose-sm dark:prose-invert max-w-none text-base leading-relaxed text-foreground dark:text-[var(--aiBubbleText-dark)] break-words overflow-wrap-anywhere", message.isError && "text-red-500 font-medium")}>
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeRaw]}
							components={markdownComponents}
						>
							{message.body}
						</ReactMarkdown>
					</div>

						{/* Action Chips */}
						{message.actions?.length ? (
							<div className="mt-3 flex flex-wrap gap-2 pt-1">
								{message.actions.map((a) => (
									<Button
										key={a.id}
										variant="outline"
										className="h-8 rounded-full border-indigo-200 bg-white px-4 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
									>
										{a.label}
									</Button>
								))}
							</div>
						) : null}
					</div>

					{/* Footer Row */}
					{message.showListenRow && (
						<div className="flex flex-col gap-3">
							<div className="mx-[-1rem] h-px bg-gray-200 dark:bg-indigo-800/20" />
							<div className="flex items-center justify-start -ml-3">
							<div className="flex items-center gap-0">
								<Button
									variant="ghost"
									className="group h-10 gap-2 rounded-none pl-6 pr-4 text-sm font-bold text-[var(--primary)] transition-all hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 cursor-pointer"
									onClick={handleListen}
								>
									{isThisPlaying ? (
										<Pause className="h-4 w-4 text-[var(--primary)] group-hover:scale-110 transition-transform" />
									) : isThisPaused ? (
										<Play className="h-4 w-4 text-[var(--primary)] group-hover:scale-110 transition-transform" />
									) : (
										<Volume2 className="h-4 w-4 text-[var(--primary)] group-hover:scale-110 transition-transform" />
									)}
									<span>{isThisPlaying ? "Pause" : isThisPaused ? "Resume" : "Listen"}</span>
								</Button>

								<div className="h-5 w-px self-center bg-gray-200 dark:bg-indigo-800/30" />

								<Button
									variant="ghost"
									size="icon"
									className="flex-1 h-10 w-12 rounded-none text-foreground/60 transition-all hover:bg-indigo-50 hover:text-[var(--primary)] dark:text-gray-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300 cursor-pointer"
									title="Copy"
									onClick={handleCopy}
								>
									{showCopySuccess ? (
										<Check className="h-4 w-4 text-[var(--primary)]" />
									) : (
										<Copy className="h-4 w-4 text-[var(--primary)]" />
									)}
								</Button>

								<div className="h-5 w-px self-center bg-gray-200 dark:bg-indigo-800/30" />

								{!showThumbsDownSuccess && (
									<>
										<div className="flex-1 flex items-center justify-center">
											<Button
												variant="ghost"
												size="icon"
												className={cn(
													"h-10 w-12 rounded-none text-foreground/60 transition-all hover:bg-indigo-50 hover:text-[var(--primary)] dark:text-gray-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300 cursor-pointer disabled:opacity-100",
													showThumbsUpSuccess && "pointer-events-none"
												)}
												title="Helpful"
												onClick={handleThumbsUp}
												disabled={isSubmitting || showThumbsUpSuccess}
											>
												<ThumbsUp 
													className={cn("h-4 w-4 text-[var(--primary)]")} 
													fill={showThumbsUpSuccess ? "var(--primary)" : "none"}
												/>
											</Button>
										</div>
										{!showThumbsUpSuccess && <div className="h-5 w-px self-center bg-gray-200 dark:bg-indigo-800/30" />}
									</>
								)}

								{!showThumbsUpSuccess && (
									<div className="flex-1 flex items-center justify-center">
										<Button
											variant="ghost"
											size="icon"
											className={cn(
												"h-10 w-12 rounded-none text-foreground/60 transition-all hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 cursor-pointer disabled:opacity-100",
												showThumbsDownSuccess && "pointer-events-none"
											)}
											title="Not Helpful"
											onClick={handleThumbsDown}
											disabled={isSubmitting || showThumbsDownSuccess}
										>
											<ThumbsDown 
												className={cn("h-4 w-4 text-[var(--primary)]")} 
												fill={showThumbsDownSuccess ? "var(--primary)" : "none"}
											/>
										</Button>
									</div>
								)}
							</div>
							</div>
						</div>
					)}
				</Card>
			</div>

			{/* Feedback Modal */}
			<FeedbackModal
				open={feedbackModalOpen}
				onClose={() => setFeedbackModalOpen(false)}
				onSubmit={handleFeedbackSubmit}
			/>
		</>
	);
}
