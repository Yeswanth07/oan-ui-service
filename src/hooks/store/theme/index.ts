import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Theme, THEMES } from "@/components/screens-component/chat-screen/config";

interface ThemeStore {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: THEMES.light,
			setTheme: (theme) => {
				set({ theme });
				applyTheme(theme);
			},
			toggleTheme: () => {
				set((state) => {
					const newTheme = state.theme === THEMES.light ? THEMES.dark : THEMES.light;
					applyTheme(newTheme);
					return { theme: newTheme };
				});
			}
		}),
		{
			name: "theme-storage"
		}
	)
);

function applyTheme(theme: Theme) {
	const root = window.document.documentElement;
	root.classList.remove(THEMES.light, THEMES.dark);
	root.classList.add(theme);
}

// Initial theme application
if (typeof window !== "undefined") {
	const storedTheme = localStorage.getItem("theme-storage");
	if (storedTheme) {
		try {
			const parsed = JSON.parse(storedTheme);
			if (parsed.state && parsed.state.theme) {
				applyTheme(parsed.state.theme);
			}
		} catch (e) {
			console.error("Failed to parse theme from storage", e);
		}
	}
}
