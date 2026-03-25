import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export type ToastProps = {
	message: string;
	type: ToastType;
	onClose: () => void;
	duration?: number;
};

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const isSuccess = type === "success";

	return (
		<div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
			<div
				className={`flex items-center gap-3 rounded-full px-4 py-3 shadow-lg ${
					isSuccess
						? "bg-green-100 text-green-900"
						: "bg-red-50 text-red-900 border border-red-200"
				}`}
				style={{
					minWidth: "300px",
					maxWidth: "90vw"
				}}
			>
				{isSuccess ? (
					<CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
				) : (
					<AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
				)}
				<span className="text-sm font-medium flex-1">{message}</span>
				<button
					onClick={onClose}
					className="flex-shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
					aria-label="Close"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
