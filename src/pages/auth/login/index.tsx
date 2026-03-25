import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/store/auth";
import { useLogin } from "@/hooks";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
	const navigate = useNavigate();
	const { isAuthed } = useAuthStore();
	const { mutateAsync, isPending } = useLogin();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	useEffect(() => {
		if (isAuthed()) {
			navigate({ to: "/chat", search: (old) => old });
		}
	}, [isAuthed, navigate]);

	const onSubmit = async (values: LoginForm) => {
		setError(null);
		try {
			await mutateAsync(values);
			toast.success("Logged in successfully!");
			navigate({ to: "/chat", search: (old) => old });
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
			toast.error(message);
			setError(message);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
			<div className="relative hidden flex-1 items-center justify-center overflow-hidden md:flex">
				<div className="absolute inset-0 bg-gradient-to-br from-[#281461] via-[#4f27b0] to-[#683bd4]" />
				<div className="absolute inset-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur" />
				<div className="relative z-10 flex flex-col items-center gap-4 text-center text-white"></div>
			</div>

			<div className="flex flex-1 items-center justify-center px-6 py-12">
				<div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-lg shadow-[#281461]/5">
					<div className="mb-8 space-y-2">
						<h2 className="text-2xl font-semibold text-foreground">Hi, Welcome</h2>
						<p className="text-sm text-muted-foreground">
							Please sign in to continue to your chat dashboard.
						</p>
					</div>

					<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
						<div className="space-y-2">
							<label className="text-sm font-medium text-foreground" htmlFor="email">
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								{...form.register("email")}
								aria-invalid={Boolean(form.formState.errors.email)}
							/>
							{form.formState.errors.email && (
								<p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-foreground" htmlFor="password">
								Password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								autoComplete="current-password"
								{...form.register("password")}
								aria-invalid={Boolean(form.formState.errors.password)}
							/>
							{form.formState.errors.password && (
								<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
							)}
						</div>

						{error ? <p className="text-sm text-destructive">{error}</p> : null}

						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Signing in..." : "Login"}
						</Button>

						<div className="text-center text-sm text-muted-foreground">
							Forgot your password?{" "}
							<a
								className="text-primary underline-offset-4 hover:underline"
								href="/forgot-password"
							>
								Reset it here
							</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
