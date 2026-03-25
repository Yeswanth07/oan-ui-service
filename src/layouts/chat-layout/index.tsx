import { ChatHeader } from "@/components/screens-component/layouts/chat-header";
import { ChatInput, type ChatInputPayload } from "@/components/screens-component/chat-screen/components/chat-input";
import { CHAT_USER } from "@/components/screens-component/chat-screen/config";
import { useChatStore } from "@/hooks/store/chat";
import { Outlet } from "@tanstack/react-router";
import { useLanguage } from "@/components/LanguageProvider";
import { useCallback, useState } from "react";
import { Toast } from "@/components/screens-component/chat-screen/components/toast";
import { SettingsDrawer } from "@/components/screens-component/chat-screen/components/settings-drawer";

function ChatLayout() {
	const sessionId = useChatStore((s) => s.sessionId);
	const clearChat = useChatStore((s) => s.clearChat);
	const draft = useChatStore((s) => s.draft);
	const setDraft = useChatStore((s) => s.setDraft);
	const sendText = useChatStore((s) => s.sendText);
	const sendAudio = useChatStore((s) => s.sendAudio);
	const isListening = useChatStore((s) => s.isListening);
	const isTranscribing = useChatStore((s) => s.isTranscribing);
	const isAssistantTyping = useChatStore((s) => s.isAssistantTyping);
	const startListening = useChatStore((s) => s.startListening);
	const stopListening = useChatStore((s) => s.stopListening);
	const suggestions = useChatStore((s) => s.suggestions);
	const messages = useChatStore((s) => s.messages);
	const toastData = useChatStore((s) => s.toast);
	const setToast = useChatStore((s) => s.setToast);
	// const fetchLocation = useChatStore((s) => s.fetchLocation); // Geolocation disabled

	const { language, t } = useLanguage();
	const [settingsOpen, setSettingsOpen] = useState(false);

	// Geolocation disabled as location is not being used
	// useEffect(() => {
	//	fetchLocation(t);
	// }, [fetchLocation, t]);

	const handleCloseToast = useCallback(() => {
		setToast(null);
	}, [setToast]);

	return (
		<div 
			className="flex h-svh w-full flex-col overflow-hidden text-foreground relative"
			style={{ background: 'var(--background)' }}
		>
			{toastData && (
				<Toast
					message={toastData.message}
					type={toastData.type}
					onClose={handleCloseToast}
				/>
			)}
			<ChatHeader
				title={t("appTitle") as string}
				subtitle="Government assistance and agriculture insights"
				rightAvatarUrl={CHAT_USER.avatar}
				rightLabel={CHAT_USER.name}
				onClearChat={clearChat}
				onOpenSettings={() => setSettingsOpen(true)}
				onBack={() => window.history.back()}
			/>
			{/* Only this area can scroll (via ChatShell/MessageList) */}
			<main className="min-h-0 flex-1 bg-transparent">
				<Outlet />
			</main>
			<div className="relative z-20">
				<ChatInput
					placeholder={t("inputPlaceholder") as string}
					value={draft}
					onValueChange={setDraft}
					onSend={async (payload: ChatInputPayload) => {
						const { text, voice } = payload;
						if (text.trim()) {
							sendText(text, language, t);
						} else if (voice) {
							try {
								await sendAudio(voice, sessionId || '', language);
							} catch (error) {
								console.error(error);
							}
						}
					}}
					onVoiceStart={startListening}
					onVoiceStop={stopListening}
					isListening={isListening}
					isTranscribing={isTranscribing}
					isAssistantTyping={isAssistantTyping}
					suggestions={suggestions}
					onSuggestionClick={(text: string) => sendText(text, language, t)}
					micHint={messages.length > 0 ? undefined : (t("chatMicHint") as string)}
					footerNote={t("disclaimerText") as string}
				/>
			</div>

			<SettingsDrawer 
				open={settingsOpen} 
				onOpenChange={setSettingsOpen} 
			/>
		</div>
	);
}

export default ChatLayout;
