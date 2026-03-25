import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, X } from "lucide-react";
import Lottie from "lottie-react";
import loadingAnim from "@/assets/Loading.json";
import sendIcon from "@/assets/send.svg";
import activeSend from "@/assets/activeSend.svg";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RecordingControls } from "./recording-controls";
import { Suggestions } from "./suggestions";
import type { Suggestion } from "../api/suggestions-api";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";

export type ChatInputPayload = {
	text: string;
	files: File[];
	voice?: Blob | null;
	duration?: number;
};

export type ChatInputProps = {
	placeholder?: string;
	disabled?: boolean;
	value: string;
	onValueChange: (_value: string) => void;
	onSend: (_payload: ChatInputPayload) => void;
	onTypingChange?: (_isTyping: boolean) => void;
	onVoiceStart?: () => void;
	onVoiceStop?: () => void;
	micHint?: string;
	footerNote?: string;
	isListening?: boolean;
	isTranscribing?: boolean;
	isAssistantTyping?: boolean;
	suggestions?: Suggestion[];
	onSuggestionClick?: (text: string) => void;
};

export function ChatInput({
	placeholder = "Type a message…",
	disabled,
	value,
	onValueChange,
	onSend,
	onTypingChange,
	onVoiceStart,
	onVoiceStop,
	micHint,
	footerNote,
	isListening,
	isTranscribing,
	isAssistantTyping,
	suggestions = [],
	onSuggestionClick
}: ChatInputProps) {
	const { t } = useLanguage();
	const { user } = useAuth();
	const isUnauthenticated = !user;
	const [files, setFiles] = useState<File[]>([]);
	const [voice, setVoice] = useState<Blob | null>(null);
	const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused">("idle");
	const [recordingDuration, setRecordingDuration] = useState(0);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<BlobPart[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const taRef = useRef<HTMLTextAreaElement | null>(null);

	const canSend = useMemo(() => value.trim().length > 0 || files.length > 0 || !!voice, [value, files, voice]);
	const isLoading = isTranscribing || isAssistantTyping;

	// Clean up on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
			if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
				mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
			}
		};
	}, []);


	useEffect(() => {
		onTypingChange?.(value.trim().length > 0);
	}, [value]);

	async function startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			chunksRef.current = [];

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};

			recorder.onstop = () => {
				stream.getTracks().forEach((t) => t.stop());
				const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
				setAudioBlob(blob);
			};

			recorder.start();
			mediaRecorderRef.current = recorder;

			setRecordingState("recording");
			setRecordingDuration(0);
			onVoiceStart?.();

			timerRef.current = setInterval(() => {
				setRecordingDuration((prev) => prev + 1);
			}, 1000);
		} catch (error) {
			console.error("Failed to start recording:", error);
		}
	}

	function pauseRecording() {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
			mediaRecorderRef.current.requestData(); 
			const mimeType = mediaRecorderRef.current.mimeType;
			setTimeout(() => {
				const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
				setAudioBlob(blob);
				mediaRecorderRef.current?.pause();
				setRecordingState("paused");
				if (timerRef.current) clearInterval(timerRef.current);
			}, 100); // Increased timeout slightly to be safe
		}
	}

	function resumeRecording() {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
			mediaRecorderRef.current.resume();
			setRecordingState("recording");
			timerRef.current = setInterval(() => {
				setRecordingDuration((prev) => prev + 1);
			}, 1000);
		}
	}

	function stopRecording() {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			if (timerRef.current) clearInterval(timerRef.current);
			onVoiceStop?.();
		}
	}

	function cancelRecording() {
		stopRecording();
		setRecordingState("idle");
		setAudioBlob(null);
		setRecordingDuration(0);
		chunksRef.current = [];
	}

	function finishRecordingAndSend() {
		// Stop recorder if running or paused
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
			mediaRecorderRef.current.stop();
			// Ensure tracks are stopped
			mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
		}

		if (timerRef.current) clearInterval(timerRef.current);

		// Allow small buffer for onvideo/onstop to finalize state
		setTimeout(() => {
			const type = mediaRecorderRef.current?.mimeType || "audio/webm"; 
			const blob = new Blob(chunksRef.current, { type });
			if (blob.size > 0) {
				onSend({ text: "", files: [], voice: blob, duration: recordingDuration });
			}
			// Reset all state
			setRecordingState("idle");
			setAudioBlob(null);
			setRecordingDuration(0);
			chunksRef.current = [];
			onVoiceStop?.();
		}, 50);
	}

	function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
		const list = e.target.files ? Array.from(e.target.files) : [];
		if (list.length) setFiles((prev) => [...prev, ...list]);
		e.target.value = "";
	}

	function removeFile(idx: number) {
		setFiles((prev) => prev.filter((_, i) => i !== idx));
	}

	function clearVoice() {
		setVoice(null);
	}

	function submit() {
		if (!canSend || disabled || isLoading) return;
		onSend({ text: value.trim(), files, voice });
		onValueChange("");
		setFiles([]);
		setVoice(null);
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}

	if (recordingState !== "idle") {
		return (
			<div className="relative bg-[#FFFFFF] dark:bg-[var(--inputBg-dark)] backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF] dark:supports-[backdrop-filter]:bg-[var(--inputBg-dark)]">
				<div className="mx-auto w-full max-w-3xl px-2 py-2 sm:px-4">
					<RecordingControls
						state={recordingState}
						duration={recordingDuration}
						audioBlob={audioBlob}
						onPause={pauseRecording}
						onResume={resumeRecording}
						onDelete={cancelRecording}
						onSend={finishRecordingAndSend}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[#FFFFFF] dark:bg-[var(--inputBg-dark)] backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF] dark:supports-[backdrop-filter]:bg-[var(--inputBg-dark)]">


			<div className="mx-auto w-full max-w-3xl px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] sm:px-4">
				<Suggestions
					suggestions={suggestions}
					onSuggestionClick={(text) => onSuggestionClick?.(text)}
					className="mb-2"
				/>
				{/* Attachment/voice preview row */}
				{(files.length > 0 || voice) && (
					<div className="mb-2 flex flex-wrap items-center gap-2">
						{files.map((f, idx) => (
							<Badge key={`${f.name}-${idx}`} variant="secondary" className="gap-1">
								<span className="max-w-[14rem] truncate">{f.name}</span>
								<button
									type="button"
									onClick={() => removeFile(idx)}
									className="rounded-sm cursor-pointer p-0.5 hover:bg-muted"
									aria-label="Remove file"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							</Badge>
						))}

						{voice && (
							<Badge variant="secondary" className="gap-2">
								<span>Voice message</span>
								<button
									type="button"
									onClick={clearVoice}
									className="cursor-pointer rounded-sm p-0.5 hover:bg-muted"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							</Badge>
						)}
					</div>
				)}

				<div className="flex items-center gap-2">
					<div className="relative">
						{micHint ? (
							<div className="absolute bottom-full left-0 mb-3 animate-[float_3s_ease-in-out_infinite]">
								<div className="relative whitespace-nowrap rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm font-medium text-[var(--primary)] shadow-sm">
									{t("chatMicHint")}
									<div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 bg-[var(--secondary)]"></div>
								</div>
						<style>{`
									@keyframes float {
										0%, 100% { transform: translateY(0); }
										50% { transform: translateY(-5px); }
									}
									@keyframes earthquake {
										0%, 50%, 100% { transform: translate(0, 0) rotate(0deg); }
										10% { transform: translate(-1px, -1px) rotate(-15deg); }
										20% { transform: translate(1px, 1px) rotate(15deg); }
										30% { transform: translate(-1px, -1px) rotate(-15deg); }
										40% { transform: translate(1px, 1px) rotate(15deg); }
									}
									.animate-earthquake {
										animation: earthquake 1.3s ease-in-out infinite;
									}
								`}</style>
							</div>
						) : null}
						<Button
							type="button"
							size="icon"
							disabled={disabled || isLoading || isUnauthenticated}
							onClick={startRecording}
							className={cn(
								"h-11 w-11 shrink-0 rounded-full text-black bg-[var(--primary)] hover:bg-[var(--accent)]/90 dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)]/90 shadow-md",
								isListening ? "animate-pulse" : "",
								disabled || isLoading || isUnauthenticated ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
							)}
							aria-label="Record voice"
						>
							<Mic color="white" className="h-5 w-5" />
						</Button>
					</div>

<div
  className={cn(
    "flex flex-1 min-h-[50px] min-w-0 items-stretch gap-2 rounded-[16px] border bg-white dark:bg-[var(--inputBg-dark)] shadow-sm transition-colors duration-200 relative",
    canSend ? "border-black dark:border-[var(--border-dark)]" : "border-gray-300 dark:border-gray-700",
    isLoading || isUnauthenticated ? "bg-gray-50 opacity-80 cursor-not-allowed" : ""
  )}
>
  {isLoading && (
    <div className="absolute inset-0 z-10 flex items-center ml-4 justify-start bg-white dark:bg-[var(--inputBg-dark)] rounded-[16px]">
      <div className="flex items-center gap-1">
        <div className="h-8 w-8">
			{isTranscribing && (
				<Lottie animationData={loadingAnim} loop={true} />
			)}
        </div>
        <span className="text-base text-gray-500">
			{isTranscribing ? "Transcribing..." : ""}
		</span>
      </div>
    </div>
  )}
  <Textarea
    ref={taRef}
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    onKeyDown={onKeyDown}
    disabled={disabled || isLoading || isUnauthenticated}
    placeholder={(isLoading || isUnauthenticated) ? "" : placeholder}
    className={cn(
      "flex-1 min-w-0 max-h-[140px] min-h-[50px] mx-4 resize-none border-0 bg-transparent px-0 py-[13px] text-base leading-6 shadow-none",
      "focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none",
      "placeholder:text-gray-400 placeholder:leading-6 dark:text-[var(--inputText-dark)]",
      "break-words whitespace-pre-wrap overflow-y-auto block",
	  disabled || isLoading || isUnauthenticated ? "cursor-not-allowed" : ""
    )}
  />

  {/* Grey/Green area around send button */}
  <div
    className={cn(
      "flex w-12 items-stretch justify-center transition-colors duration-200",
      "rounded-r-[16px] rounded-l-none bg-[#F6F6F6] dark:bg-[#FFFFFF1A]",
	  canSend && !isLoading ? "brand-gradient" : "bg-gray-200 dark:bg-[#FFFFFF1A]"
    )}
  >
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn(
        "h-full w-12 rounded-r-[16px] rounded-l-none hover:bg-transparent shadow-none",
        "focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none",
        canSend && !isLoading ? "text-white cursor-pointer" : "text-gray-500 cursor-not-allowed"
      )}
      onClick={submit}
      disabled={!canSend || disabled || isLoading}
      aria-label="Send"
    >
      <img 
        src={canSend && !isLoading ? activeSend : sendIcon} 
        alt="Send" 
        className={cn(
          "h-5 w-5",
          canSend && !isLoading ? "animate-earthquake" : ""
        )} 
      />
    </Button>
  </div>

  <input
    ref={fileInputRef}
    type="file"
    className="hidden"
    multiple
    onChange={onFilesPicked}
  />
</div>

				</div>

				{footerNote ? (
					<div className="mt-3 text-center text-[12px] text-muted-foreground dark:text-[var(--inputText-dark)]">{footerNote}</div>
				) : null}

			</div>
		</div>
	);
}
