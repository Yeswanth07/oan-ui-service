import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/components/screens-component/chat-screen/config";

type LanguageStore = {
	selectedLanguage: LanguageCode;
	setLanguage: (code: LanguageCode) => void;
};

export const useLanguageStore = create<LanguageStore>()(
	persist(
		(set) => ({
			selectedLanguage: DEFAULT_LANGUAGE,
			setLanguage: (code) => set({ selectedLanguage: code })
		}),
		{
			name: "language-storage"
		}
	)
);
