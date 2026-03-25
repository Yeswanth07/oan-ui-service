import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* eslint-disable no-unused-vars */
export type MicButtonProps = {
	disabled?: boolean;
	isActive?: boolean;
	onRecorded?: (blob: Blob) => void;
	onStart?: () => void;
	onStop?: () => void;
};
/* eslint-enable no-unused-vars */

export function MicButton({ disabled, isActive, onRecorded, onStart, onStop }: MicButtonProps) {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<BlobPart[]>([]);

	const supported = useMemo(() => {
		return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
	}, []);

	useEffect(() => {
		return () => {
			if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
				mediaRecorderRef.current.stop();
			}
		};
	}, []);

	async function start() {
		if (!supported || disabled) return;

		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const recorder = new MediaRecorder(stream);
		chunksRef.current = [];

		recorder.ondataavailable = (e) => {
			if (e.data.size) chunksRef.current.push(e.data);
		};

		recorder.onstop = () => {
			stream.getTracks().forEach((t) => t.stop());
			const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
			onRecorded?.(blob);
		};

		recorder.start();
		mediaRecorderRef.current = recorder;
		setIsRecording(true);
		onStart?.();
	}

	function stop() {
		const r = mediaRecorderRef.current;
		if (!r) return;
		if (r.state !== "inactive") r.stop();
		setIsRecording(false);
		onStop?.();
	}

	const active = isRecording || isActive;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						size="icon"
						disabled={disabled || !supported}
						onClick={isRecording ? stop : start}
						className={cn(
							"h-11 w-11 rounded-full text-primary-foreground",
							active ? "bg-primary shadow-lg shadow-primary/30" : "bg-primary hover:bg-primary/90"
						)}
						aria-label={isRecording ? "Stop recording" : "Record voice"}
					>
						{isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{!supported ? "Mic not supported" : isRecording ? "Tap to stop" : "Tap to record"}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
