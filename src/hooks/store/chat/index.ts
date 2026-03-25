import { create } from "zustand";
import type {
	ChatMessage,
	TextMessage
} from "@/components/screens-component/chat-screen/components/bubbles/chat-types";

import {
	fetchSuggestions,
	type Suggestion
} from "@/components/screens-component/chat-screen/api/suggestions-api";
import apiService from "@/lib/api-service";
import * as telemetry from "@/lib/telemetry";
import { shuffle, randomPick } from "@/lib/qa-utils";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/hooks/store/auth";
import type { ToastType } from "@/components/screens-component/chat-screen/components/toast";
import { environment } from "@/lib/config/environment";

/* eslint-disable no-unused-vars */
export type QuickAction = {
	id: string;
	title: string;
	description: string;
	icon:
		| "tractor"
		| "wheat"
		| "cow"
		| "cloud"
		| "money"
		| "document"
		| "insurance"
		| "alert"
		| "bank"
		| "search"
		| "soil"
		| "card";
	prompt: string;
};

type ChatStore = {
	messages: ChatMessage[];
	quickActions: QuickAction[];
	draft: string;
	suggestions: Suggestion[];
	isAssistantTyping: boolean;
	isListening: boolean;
	isTranscribing: boolean;
	isFetchingSuggestions: boolean;
	sessionId: string | null;
	initializeSession: (user: any) => Promise<void>;
	sendText: (text: string, language: string, t?: any) => Promise<void>;
	sendAudio: (blob: Blob, sessionId: string, language: string) => Promise<void>;
	sendQuickAction: (id: string, language: string, t?: any) => void;
	sendQuickReply: (payload: string, language: string, t?: any) => void;
	setDraft: (value: string) => void;
	startListening: () => void;
	stopListening: () => void;
	clearChat: () => void;
	setIsTranscribing: (value: boolean) => void;
	setSuggestions: (suggestions: Suggestion[]) => void;
	clearSuggestions: () => void;
	fetchSuggestionsForMessage: (messageId: string) => Promise<void>;
	generateQuickActions: (t: any) => void;
	playTTS: (text: string, language: string, messageId: string) => Promise<void>;
	pauseTTS: () => void;
	resumeTTS: () => Promise<void>;
	stopTTS: () => void;
	currentlyPlayingId: string | null;
	ttsStatus: "playing" | "paused" | "stopped";
	submitMessageFeedback: (
		messageId: string,
		isPositive: boolean,
		reason?: string,
		feedback?: string
	) => Promise<void>;
	toast: { message: string; type: ToastType } | null;
	setToast: (toast: { message: string; type: ToastType } | null) => void;
	fetchLocation: () => void; // Disabled - location not being used
};
/* eslint-enable no-unused-vars */

const quickActionSeeds: QuickAction[] = [
	{
		id: "1",
		title: "What is the treatment for Mastitis in cow?",
		description: "",
		icon: "cow",
		prompt: "What is the treatment for Mastitis in cow?"
	},
	{
		id: "2",
		title: "What is the today’s price of amaranth in APMC Mumbai?",
		description: "",
		icon: "wheat",
		prompt: "What is the today’s price of amaranth in APMC Mumbai?"
	},
	{
		id: "3",
		title: "What is the ideal irrigation schedule for muskmelon?",
		description: "",
		icon: "cloud",
		prompt: "What is the ideal irrigation schedule for muskmelon?"
	}
];

function makeUserMessage(text: string): TextMessage {
	return {
		id: crypto.randomUUID(),
		role: "user",
		type: "text",
		text,
		status: "sent",
		createdAt: new Date().toISOString()
	};
}

function makeAssistantMessage(text: string, isError?: boolean, showListenRow = false): ChatMessage {
	return {
		id: crypto.randomUUID(),
		role: "assistant",
		type: "card",
		body: text,
		createdAt: new Date().toISOString(),
		showListenRow,
		isError
	};
}

import { playTTS as playTTSHelper, pauseAudio, resumeAudio, stopAudio } from "@/lib/audio-utils";

export const useChatStore = create<ChatStore>((set, get) => ({
	messages: [],
	quickActions: quickActionSeeds,
	draft: "",
	suggestions: [],
	isAssistantTyping: false,
	isListening: false,
	isTranscribing: false,
	isFetchingSuggestions: false,
	sessionId: null,
	toast: null,
	currentlyPlayingId: null,
	ttsStatus: "stopped",

	setToast: (toast) => set({ toast }),
	initializeSession: async (_user) => {
		const sid = uuidv4();
		set({ sessionId: sid });
		apiService.setSessionId(sid);
	},

	setDraft: (value) => set(() => ({ draft: value })),

	// fetchLocation disabled as location is not being used
	fetchLocation: () => {
		// Geolocation permission request disabled
	},

	setIsTranscribing: (value) => set(() => ({ isTranscribing: value })),
	setSuggestions: (suggestions) => set({ suggestions }),
	clearSuggestions: () => set({ suggestions: [] }),

	startListening: () => {
		get().stopTTS();
		set(() => ({ isListening: true }));
	},
	stopListening: () => set(() => ({ isListening: false })),

	clearChat: () =>
		set(() => ({
			messages: [],
			draft: "",
			suggestions: [],
			isAssistantTyping: false,
			isListening: false,
			isTranscribing: false,
			isFetchingSuggestions: false
		})),

	sendText: async (text, language, t) => {
		const trimmed = text.trim();
		if (!trimmed) return;

		get().stopTTS();

		const userMessage = makeUserMessage(trimmed);
		set((state) => ({
			messages: [...state.messages, userMessage],
			draft: "",
			suggestions: [],
			isAssistantTyping: true
		}));

		const { sessionId } = get();
		const currentSession = sessionId || uuidv4();
		if (!sessionId) {
			set({ sessionId: currentSession });
			apiService.setSessionId(currentSession);
		}

		const questionId = uuidv4();

		// Telemetry: Log Question
		const user = useAuthStore.getState().user;
		const userDetails = {
			preferred_username: user?.username || "guest",
			email: user?.email || ""
		};

		try {
			await telemetry.startTelemetry(currentSession, userDetails);
			telemetry.logQuestionEvent(questionId, currentSession, trimmed);
			telemetry.endTelemetry();
		} catch (e) {
			console.warn("Telemetry question log failed", e);
		}

		try {
			// In a real app we'd detect language, here we use what's passed
			let streamingText = "";

			// Mark request start for telemetry
			telemetry.markServerRequestStart(questionId);

			const response = await apiService.sendUserQuery(
				trimmed,
				currentSession,
				language, // source
				language, // target
				(chunk) => {
					streamingText += chunk;
					set((state) => {
						const lastMsg = state.messages[state.messages.length - 1];
						if (lastMsg && lastMsg.role === "assistant" && lastMsg.type === "card") {
							return {
								messages: [...state.messages.slice(0, -1), { ...lastMsg, body: streamingText }]
							};
						} else {
							return {
								messages: [...state.messages, makeAssistantMessage(streamingText)]
							};
						}
					});
				}
			);

			set((state) => {
				const lastMsg = state.messages[state.messages.length - 1];
				if (lastMsg && lastMsg.role === "assistant" && lastMsg.type === "card") {
					return {
						messages: [...state.messages.slice(0, -1), { ...lastMsg, showListenRow: true }],
						isAssistantTyping: false
					};
				}
				return { isAssistantTyping: false };
			});

			// Telemetry: Log Response
			await telemetry.startTelemetry(currentSession, userDetails);

			telemetry.markAnswerRendered(questionId, () => {
				telemetry.logResponseEvent(questionId, currentSession, trimmed, response.response);
			});

			await telemetry.endTelemetryWithWait(questionId);

			if (!environment.suggestionsDisabled) {
				const suggestions = await apiService.getSuggestions(currentSession, language);
				set({
					suggestions: suggestions.map((s) => ({
						id: uuidv4(),
						text: s.question,
						label: s.question
					}))
				});
			}
		} catch (error: any) {
			console.error("Error sending text:", error);
			set({ isAssistantTyping: false });

			const isRateLimitError =
				error?.status === 429 ||
				error?.response?.status === 429 ||
				(error instanceof Error && error.message.includes("Rate limit"));

			if (isRateLimitError) {
				const limitMessage = t
					? t("limitMessage")
					: "Dear user, you have reached the allotted question limit for today. You may continue to explore the other features of the Bharat-VISTAAR app.";
				set((state) => ({
					messages: [...state.messages, makeAssistantMessage(limitMessage, true, true)]
				}));

				// Telemetry: Log Error (Rate Limit)
				await telemetry.startTelemetry(currentSession, userDetails);
				telemetry.logErrorEvent(questionId, currentSession, "Rate limit error (429)");
				telemetry.endTelemetry();
			} else {
				set({
					toast: {
						message: "Sorry, there was an error processing your request. Please try again.",
						type: "error"
					}
				});

				// Telemetry: Log Error (Generic)
				await telemetry.startTelemetry(currentSession, userDetails);
				telemetry.logErrorEvent(questionId, currentSession, String(error));
				telemetry.endTelemetry();
			}
		}
	},

	fetchSuggestionsForMessage: async (messageId) => {
		set({ isFetchingSuggestions: true });
		try {
			const suggestions = await fetchSuggestions(messageId);
			set({ suggestions, isFetchingSuggestions: false });
		} catch (error) {
			console.error("Error fetching suggestions:", error);
			set({ isFetchingSuggestions: false });
			// set({ toast: { message: "Failed to load suggestions.", type: "error" } });
		}
	},

	sendAudio: async (blob, sessionId, language) => {
		if (!blob) return;

		set({ isTranscribing: true });

		try {
			// Convert raw MediaRecorder audio (WebM) to optimized WAV for ASR
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			const audioContext = new AudioContextClass();
			const arrayBuffer = await blob.arrayBuffer();
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			// Create optimized WAV (16kHz, mono) - same as oan-ui-service
			const offlineContext = new OfflineAudioContext({
				numberOfChannels: 1,
				length: audioBuffer.duration * 16000,
				sampleRate: 16000
			});
			const source = offlineContext.createBufferSource();
			source.buffer = audioBuffer;
			source.connect(offlineContext.destination);
			source.start();
			const renderedBuffer = await offlineContext.startRendering();

			// Convert to WAV blob
			const numChannels = renderedBuffer.numberOfChannels;
			const sampleRate = renderedBuffer.sampleRate;
			const length = renderedBuffer.length;
			const bytesPerSample = 2;
			const blockAlign = numChannels * bytesPerSample;
			const byteRate = sampleRate * blockAlign;
			const dataSize = length * blockAlign;
			const wavBuffer = new ArrayBuffer(44 + dataSize);
			const view = new DataView(wavBuffer);

			// WAV header
			const writeStr = (offset: number, str: string) => {
				for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
			};
			writeStr(0, "RIFF");
			view.setUint32(4, 36 + dataSize, true);
			writeStr(8, "WAVE");
			writeStr(12, "fmt ");
			view.setUint32(16, 16, true);
			view.setUint16(20, 1, true);
			view.setUint16(22, numChannels, true);
			view.setUint32(24, sampleRate, true);
			view.setUint32(28, byteRate, true);
			view.setUint16(32, blockAlign, true);
			view.setUint16(34, 16, true);
			writeStr(36, "data");
			view.setUint32(40, dataSize, true);

			const channelData = renderedBuffer.getChannelData(0);
			for (let i = 0; i < length; i++) {
				const sample = Math.max(-1, Math.min(1, channelData[i]!));
				view.setInt16(
					44 + i * bytesPerSample,
					sample < 0 ? sample * 0x8000 : sample * 0x7fff,
					true
				);
			}

			const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
			const base64Audio = await apiService.blobToBase64(wavBlob);
			const transcription = await apiService.transcribeAudio(
				base64Audio,
				"bhashini",
				sessionId,
				language
			);

			if (transcription && transcription.text) {
				set((state) => ({
					draft: state.draft ? `${state.draft} ${transcription.text}` : transcription.text,
					isTranscribing: false
				}));
				set({ toast: { message: "Transcribed successfully", type: "success" } });
			} else {
				set({ isTranscribing: false });
			}
		} catch (error) {
			console.error("Transcription error:", error);
			set({ isAssistantTyping: false, isTranscribing: false });
			set({ toast: { message: "Transcription failed. Please try again.", type: "error" } });
			throw error;
		}
	},

	sendQuickAction: (id, language, t) => {
		const action = get().quickActions.find((qa) => qa.id === id);
		if (!action) return;
		get().sendText(action.prompt, language, t);
	},

	sendQuickReply: (payload, language, t) => {
		get().sendText(payload, language, t);
	},

	generateQuickActions: (t) => {
		// Use questions from translations
		if (t("questions") && Array.isArray(t("questions")) && t("questions").length > 0) {
			const questions = t("questions") as Array<{ key: string; text: string; vars?: string[] }>;
			// Shuffle and select 3 random questions
			const selectedQuestions = shuffle([...questions]).slice(0, 3);

			// Substitute variable placeholders with random values from translations
			const resolveVars = (q: { key: string; text: string; vars?: string[] }): string => {
				let resolved = q.text;
				if (q.vars && q.vars.length > 0) {
					for (const varName of q.vars) {
						const values = t(`variables.${varName}`) as string[] | undefined;
						if (Array.isArray(values) && values.length > 0) {
							resolved = resolved.replace(`[${varName}]`, randomPick(values));
						}
					}
				}
				return resolved;
			};

			// Function to determine icon based on question key (dot notation)
			const getIconForKey = (
				key: string
			):
				| "tractor"
				| "wheat"
				| "cow"
				| "cloud"
				| "money"
				| "document"
				| "insurance"
				| "alert"
				| "bank"
				| "search"
				| "soil"
				| "card" => {
				const [category, subcategory, detail] = key.split(".");

				// Schemes category
				if (category === "schemes") {
					if (detail === "pm_kisan") return "money";
					if (detail === "kisan_credit_card") return "card";
					if (detail === "fasal_bima") return "insurance";
					if (detail === "soil_health_card") return "document";
					if (detail === "pmksy") return "document";
					if (detail === "enam_platform") return "wheat";
					if (detail === "seed_authentication") return "document";
					if (detail === "agriculture_fund") return "bank";
					if (detail === "coverage") return "insurance";
					if (subcategory === "general") return "tractor";
					if (subcategory === "insurance") return "insurance";
					return "tractor";
				}

				// Status category
				if (category === "status") {
					if (subcategory === "payment") return "money";
					if (subcategory === "claims") return "insurance";
					if (subcategory === "card") return "document";
					if (subcategory === "grievance") return "alert";
					return "search";
				}

				// Grievance category
				if (category === "grievance") {
					if (subcategory === "payment") return "money";
					if (subcategory === "claims") return "insurance";
					if (subcategory === "card") return "document";
					if (subcategory === "benefits") return "alert";
					return "alert";
				}

				// Soil category
				if (category === "soil") {
					return "soil";
				}

				// Loan category
				if (category === "loan") {
					return "bank";
				}

				// Mandi / market price category
				if (category === "mandi") {
					return "wheat";
				}

				// Weather category
				if (category === "weather") {
					return "cloud";
				}

				// Livestock and market
				if (category === "livestock") return "cow";
				if (category === "market") return "wheat";

				// Default to tractor for scheme-related app
				return "tractor";
			};

			// Create quick actions from selected questions with variable substitution
			const newActions: QuickAction[] = selectedQuestions.map((q, index) => {
				const resolvedText = resolveVars(q);
				return {
					id: `question-${index}`,
					title: resolvedText,
					description: "",
					icon: getIconForKey(q.key),
					prompt: resolvedText
				};
			});
			set({ quickActions: newActions });
		} else {
			// Fallback to seed questions if no questions in translations
			set({ quickActions: quickActionSeeds });
		}
	},

	playTTS: async (text, language, messageId) => {
		const { sessionId } = get();
		if (!sessionId) return;

		set({ currentlyPlayingId: messageId, ttsStatus: "playing" });

		try {
			await playTTSHelper(text, language, sessionId, () => {
				// Only reset if it's the SAME message that just finished
				if (get().currentlyPlayingId === messageId) {
					set({ currentlyPlayingId: null, ttsStatus: "stopped" });
				}
			});
		} catch (error) {
			console.error("TTS Playback failed:", error);
			set({ currentlyPlayingId: null, ttsStatus: "stopped" });
			set({ toast: { message: "Error Playing Audio. Please try again.", type: "error" } });
		}
	},

	pauseTTS: () => {
		pauseAudio();
		set({ ttsStatus: "paused" });
	},

	resumeTTS: async () => {
		try {
			await resumeAudio();
			set({ ttsStatus: "playing" });
		} catch (error) {
			console.error("TTS Resume failed:", error);
		}
	},

	stopTTS: () => {
		stopAudio();
		set({ currentlyPlayingId: null, ttsStatus: "stopped" });
	},

	submitMessageFeedback: async (messageId, isPositive, reason, feedback) => {
		const { sessionId, messages } = get();
		if (!sessionId) return;

		const msg = messages.find((m) => m.id === messageId);
		if (!msg) return;

		const userMsg = messages.findLast((m) => m.role === "user");
		const questionText = userMsg && userMsg.type === "text" ? userMsg.text : "";
		const responseText = msg && msg.type === "card" ? msg.body : "";
		const feedbackType = isPositive ? "like" : "dislike";
		const feedbackMsg = isPositive
			? "Liked the response"
			: feedback || reason || "Negative feedback";

		try {
			// Telemetry-only flow as per user request
			const user = useAuthStore.getState().user;
			await telemetry.startTelemetry(sessionId, {
				preferred_username: user?.user_metadata?.name || user?.email || "guest",
				email: user?.email || ""
			});

			telemetry.logFeedbackEvent(
				messageId,
				sessionId,
				feedbackMsg,
				feedbackType,
				questionText,
				responseText
			);

			telemetry.endTelemetry();

			// Logic from user code: show success toast
			// if (isPositive) {
			// 	set({ toast: { message: "Thank you for your feedback! We're glad this response was helpful.", type: "success" } });
			// } else {
			// 	set({ toast: { message: "Thank you for your feedback. We'll use it to improve our responses.", type: "success" } });
			// }
		} catch (error) {
			console.error("Feedback telemetry error:", error);
			set({ toast: { message: "Failed to submit feedback. Please try again.", type: "error" } });
		}
	}
}));
