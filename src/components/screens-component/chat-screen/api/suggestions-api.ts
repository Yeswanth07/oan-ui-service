/**
 * Placeholder API for fetching message suggestions.
 * In a real application, this would call a backend service.
 */

export interface Suggestion {
	id: string;
	text: string;
}

const SAMPLE_SUGGESTIONS: Suggestion[] = [
	{ id: "1", text: "Tell me more about this." },
	{ id: "2", text: "What are the next steps?" },
	{ id: "3", text: "Can you summarize this?" },
	{ id: "4", text: "Explain it like I'm five." }
];

export const fetchSuggestions = async (messageId: string): Promise<Suggestion[]> => {
	console.log("Fetching suggestions for message:", messageId);
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	// Simulate potential error
	if (Math.random() < 0.05) {
		throw new Error("Failed to fetch suggestions");
	}

	// Return a random subset of suggestions
	return SAMPLE_SUGGESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3);
};
