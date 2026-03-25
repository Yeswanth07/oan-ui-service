// Placeholder API for Speech-to-Text (STT)

export async function transcribeAudio(blob: Blob): Promise<string> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1500));

	console.log("Transcribing audio blob of size:", blob.size);

	// Simulate success (90% success rate)
	if (Math.random() > 0.1) {
		const dummySentences = [
			"What is the subsidy for a 45HP tractor in Maharashtra?",
			"How to apply for the dairy farming scheme?",
			"What are today's mandi prices for wheat in Nagpur?",
			"Tell me about the PM-Kisan Samman Nidhi Yojana."
		];
		const randomTranscribedText =
			dummySentences[Math.floor(Math.random() * dummySentences.length)] || "";
		return Promise.resolve(randomTranscribedText);
	} else {
		return Promise.reject(new Error("Transcription service failed"));
	}
}
