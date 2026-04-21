"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState("");
	const registeredSuccess = searchParams.get("registered") === "true";

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Invalid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setGeneralError("");

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false,
			});

			if (!result?.ok) {
				if (result?.error === "CredentialsSignin") {
					setGeneralError("Invalid email or password");
				} else {
					setGeneralError(result?.error || "Login failed. Please try again.");
				}
				setIsLoading(false);
				return;
			}

			router.push("/");
		} catch (error) {
			setGeneralError("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="rpg-panel rpg-panel-ornate w-full max-w-md p-8">
			<p className="rpg-pixel mb-2 text-center text-[9px] text-[#d4af37]">
				✦ ENTER THE TAVERN ✦
			</p>
			<h1 className="rpg-heading mb-1 text-center text-3xl">Welcome Back</h1>
			<p className="rpg-display mb-6 text-center text-sm text-[#d9c9a6]">
				Present thy credentials to re-enter the realm.
			</p>

			{registeredSuccess && (
				<div className="mb-4 rounded-sm border border-[#10b981]/60 bg-[#10b981]/10 p-3 text-sm text-[#a7f3d0]">
					Thy charter is sealed. Speak thy credentials to proceed.
				</div>
			)}

			{generalError && (
				<div className="mb-4 rounded-sm border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-200">
					{generalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="email"
						className="rpg-pixel block text-[10px] text-[#d4af37]"
					>
						EMAIL
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleInputChange}
						placeholder="you@example.com"
						className="rpg-input mt-1 w-full rounded-sm px-3 py-2 placeholder-[#8a7a5a]"
					/>
					{errors.email && (
						<p className="mt-1 text-xs text-red-300">{errors.email}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="password"
						className="rpg-pixel block text-[10px] text-[#d4af37]"
					>
						PASSWORD
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleInputChange}
						placeholder="••••••••"
						className="rpg-input mt-1 w-full rounded-sm px-3 py-2 placeholder-[#8a7a5a]"
					/>
					{errors.password && (
						<p className="mt-1 text-xs text-red-300">{errors.password}</p>
					)}
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="rpg-button rpg-button-primary mt-6 w-full rounded-sm px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? "Summoning…" : "⚔ Enter the Realm"}
				</button>
			</form>

			<div className="rpg-divider my-6" />
			<p className="rpg-display text-center text-sm text-[#d9c9a6]">
				A wanderer without a charter?{" "}
				<Link
					href="/register"
					className="font-medium text-[#f4c430] hover:text-[#fff0a8]"
				>
					Forge thy legend
				</Link>
			</p>
		</div>
	);
}
