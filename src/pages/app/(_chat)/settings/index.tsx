import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ChevronUp, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/hooks/store/theme";
import { THEMES, FAQ_DATA } from "@/components/screens-component/chat-screen/config";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from "@/components/ui/collapsible";

export default function SettingsPage() {
	const navigate = useNavigate();
	const { theme, setTheme } = useThemeStore();
	const [faqOpen, setFaqOpen] = useState(true);
	const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({ "1": true });

	const toggleFaq = (id: string) => {
		setExpandedFaqs((prev) => ({
			...prev,
			[id]: !prev[id]
		}));
	};

	return (
		<div className="flex flex-col h-full bg-background transition-colors duration-300">
			{/* Settings Header */}
			<div className="flex items-center gap-4 px-4 h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/chat", search: (old) => old })}
					className="h-10 w-10 text-gray-900 dark:text-gray-100"
				>
					<ArrowLeft className="h-6 w-6" />
				</Button>
				<h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Settings</h1>
			</div>

			<div className="p-5 flex-1 overflow-y-auto space-y-6">
				{/* Theme Toggle */}
				<div className="flex gap-4">
					<button
						onClick={() => setTheme(THEMES.light)}
						className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 transition-all ${
							theme === THEMES.light
								? "border-[#00a651] text-[#00a651] bg-white dark:bg-gray-900"
								: "border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950"
						}`}
					>
						<Sun className={`h-5 w-5 ${theme === THEMES.light ? "text-[#00a651]" : "text-gray-400 dark:text-gray-500"}`} />
						<span className="font-semibold text-sm">Light mode</span>
					</button>

					<button
						onClick={() => setTheme(THEMES.dark)}
						className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 transition-all ${
							theme === THEMES.dark
								? "border-[#00a651] text-[#00a651] bg-white dark:bg-gray-900"
								: "border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950"
						}`}
					>
						<Moon className={`h-5 w-5 ${theme === THEMES.dark ? "text-[#00a651]" : "text-gray-400 dark:text-gray-500"}`} />
						<span className="font-semibold text-sm">Dark mode</span>
					</button>
				</div>

				{/* FAQ Section */}
				<Collapsible
					open={faqOpen}
					onOpenChange={setFaqOpen}
					className="w-full border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-950"
				>
					<CollapsibleTrigger asChild>
						<button className="w-full flex items-center justify-between px-5 py-4 text-left">
							<span className="font-medium text-base text-gray-900 dark:text-gray-100">
								Frequently Asked Questions (FAQs)
							</span>
							{faqOpen ? (
								<ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
							) : (
								<ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
							)}
						</button>
					</CollapsibleTrigger>
					<CollapsibleContent className="px-5 pb-5 space-y-3">
						<div className="border-t border-gray-100 dark:border-gray-900 pt-5 space-y-3">
							{FAQ_DATA.map((faq, index) => (
								<div
									key={faq.id}
									className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
								>
									<button
										onClick={() => toggleFaq(faq.id)}
										className="w-full flex items-start gap-3 px-4 py-4 text-left"
									>
										<span className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 min-w-[20px]">
											{index + 1}.
										</span>
										<span className="font-medium text-gray-900 dark:text-gray-100 flex-1 leading-snug">
											{faq.question}
										</span>
										{expandedFaqs[faq.id] ? (
											<ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
										) : (
											<ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
										)}
									</button>
									{expandedFaqs[faq.id] && (
										<div className="px-4 pb-4 space-y-4">
											{/* {faq.image && (
												<div className="relative w-full aspect-[2/1] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
													<img
														src={faq.image}
														alt={faq.question}
														className="w-full h-full object-cover"
														onError={(e) => {
															// Optional: generic agricultural image fallback for demo
															// (e.target as HTMLImageElement).src = "/images/fallback-farm.jpg";
														}}
													/>
												</div>
											)} */}
											<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
												{faq.answer}
											</p>
										</div>
									)}
								</div>
							))}
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>
		</div>
	);
}
