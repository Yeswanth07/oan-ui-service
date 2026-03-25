import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { AudioMessage } from "./chat-types";

// Helper to format duration text (mm:ss)
function formatDuration(sec: number) {
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioBubble({ message, isMine }: { message: AudioMessage; isMine: boolean }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [currentPayloadTime, setCurrentPayloadTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const onTimeUpdate = () => {
        if (!audioRef.current) return;
        const cur = audioRef.current.currentTime;
        setCurrentPayloadTime(cur);
        if (message.duration > 0) {
            setProgress(cur / message.duration);
        }
    };

    const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentPayloadTime(0);
    };

    return (
        <div className={cn(
            "flex w-full max-w-[70%] items-center gap-2 rounded-[20px] px-3 py-3 shadow-sm",
            isMine ? "bg-[#bbf7d0] text-black" : "bg-muted text-foreground"
        )}>
             <audio
                ref={audioRef}
                src={message.audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                className="hidden"
            />
             
             <button
                type="button"
                onClick={togglePlay}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
             >
                 {isPlaying ? <Pause className="h-5 w-5 fill-current text-black" /> : <Play className="h-5 w-5 fill-current ml-0.5 text-black" />}
             </button>

             <div className="flex flex-1 items-center gap-2 overflow-hidden">
                 {/* Waveform Visualization (Mock - Black Bars) */}
                 <div className="flex flex-1 items-center justify-center gap-[2px] h-6 overflow-hidden">
                      {Array.from({ length: 45 }).map((_, i) => {
                          const height = 30 + Math.random() * 50; 
                          // Highlight bars based on progress
                          const isPlayed = (i / 35) < progress;
                          
                          return (
                            <div 
                                key={i} 
                                className={cn(
                                    "w-[2px] rounded-full transition-colors bg-black",
                                )}
                                style={{ 
                                    height: `${height}%`,
                                    opacity: isPlayed ? 1 : 0.4
                                }}
                            />
                          );
                      })}
                 </div>
                 
                 <div className="text-right text-sm font-medium text-black/70 min-w-[32px]">
                     <span>{formatDuration(currentPayloadTime || message.duration)}</span>
                 </div>
             </div>
        </div>
    );
}
