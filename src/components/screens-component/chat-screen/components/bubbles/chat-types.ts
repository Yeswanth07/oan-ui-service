export type MessageRole = "user" | "assistant" | "system";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

export type QuickReply = { id: string; label: string; payload?: string };

export type MessageBase = {
	id: string;
	role: MessageRole;
	createdAt: string;
	status?: DeliveryStatus;
};

export type TextMessage = MessageBase & {
	type: "text";
	text: string;
};

export type CardMessage = MessageBase & {
	type: "card";
	title?: string;
	body: string;
	actions?: { id: string; label: string }[];
	showListenRow?: boolean;
	isError?: boolean;
};

export type QuickRepliesMessage = MessageBase & {
	type: "quick_replies";
	prompt?: string;
	replies: QuickReply[];
};

export type SystemMessage = MessageBase & {
	type: "system";
	text: string;
};

export type AudioMessage = MessageBase & {
	type: "audio";
	audioUrl: string;
	duration: number;
};

export type ChatMessage = TextMessage | CardMessage | QuickRepliesMessage | SystemMessage | AudioMessage;
