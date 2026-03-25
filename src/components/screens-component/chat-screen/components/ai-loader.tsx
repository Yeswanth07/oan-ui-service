import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import dotLoader from "@/assets/Dot loader.json";
import { useLanguage } from "@/components/LanguageProvider";

interface AILoaderProps {
	className?: string;
}

export function AILoader({ className }: AILoaderProps) {
	const { t } = useLanguage();
	const [messageIndex, setMessageIndex] = useState(0);

	const messages = useMemo(() => {
		const msgs = t("aiLoaderMessages");
		return Array.isArray(msgs) ? (msgs as string[]) : [
			"Understanding your question...",
			"Finding Right information...",
			"Preparing the Answer..."
		];
	}, [t]);

	useEffect(() => {
		const timers = [
			setTimeout(() => setMessageIndex(1), 3000),
			setTimeout(() => setMessageIndex(2), 6000)
		];

		return () => timers.forEach(clearTimeout);
	}, []);

	return (
		<div className={cn("flex items-center gap-4 py-3 px-2", className)}>
			{/* Lottie Dot Loader */}
			<div className="h-8 w-8 shrink-0">
				<Lottie animationData={dotLoader} loop={true} />
			</div>

			{/* Message */}
			<span className="text-base text-gray-500 font-medium dark:text-[#B0B0B0]">
				{messages[messageIndex] || messages[0]}
			</span>
		</div>
	);
}
