export function createRouteProgress() {
	let el: HTMLDivElement | null = null;
	let value = 0;
	let raf: number | null = null;
	let doneTimer: number | null = null;

	const ensureEl = () => {
		if (el) return;
		el = document.createElement("div");
		el.className = "route-progress";
		document.body.appendChild(el);
	};

	const tick = () => {
		value += (100 - value) * 0.035;
		if (value > 95) value = 95;
		el!.style.width = `${value}%`;
		raf = requestAnimationFrame(tick);
	};

	return {
		start() {
			ensureEl();
			if (raf) return;

			value = Math.max(value, 12);
			el!.classList.add("active");
			el!.style.width = `${value}%`;
			raf = requestAnimationFrame(tick);

			// ⛑ safety auto-complete (same as your 2s timeout)
			doneTimer = window.setTimeout(() => {
				this.done();
			}, 2000);
		},

		done() {
			if (!el) return;

			if (raf) cancelAnimationFrame(raf);
			if (doneTimer) clearTimeout(doneTimer);

			raf = null;
			doneTimer = null;

			value = 100;
			el.style.width = "100%";

			setTimeout(() => {
				el!.classList.remove("active");
				el!.style.width = "0%";
				value = 0;
			}, 250);
		}
	};
}
