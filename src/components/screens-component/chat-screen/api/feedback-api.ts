// Placeholder API functions for feedback

export type FeedbackReason =
	| "incorrect"
	| "not_helpful"
	| "irrelevant"
	| "inappropriate"
	| "other";

export type NegativeFeedbackData = {
	messageId: string;
	reason: FeedbackReason;
	message?: string;
};

export type PositiveFeedbackData = {
	messageId: string;
};

// Simulate API call for negative feedback
export async function submitNegativeFeedback(
	data: NegativeFeedbackData
): Promise<void> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// TODO: Replace with actual API call
	console.log("Submitting negative feedback:", data);

	// Simulate success (90% success rate for testing)
	if (Math.random() > 0.1) {
		return Promise.resolve();
	} else {
		return Promise.reject(new Error("Failed to submit feedback"));
	}
}

// Simulate API call for positive feedback
export async function submitPositiveFeedback(
	data: PositiveFeedbackData
): Promise<void> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// TODO: Replace with actual API call
	console.log("Submitting positive feedback:", data);

	// Simulate success (90% success rate for testing)
	if (Math.random() > 0.1) {
		return Promise.resolve();
	} else {
		return Promise.reject(new Error("Failed to submit feedback"));
	}
}
