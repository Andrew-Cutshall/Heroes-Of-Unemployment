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
		// Clear error for this field when user starts typing
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

			// Redirect to home page
			router.push("/");
		} catch (error) {
			setGeneralError("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
			<h1 className="mb-6 text-2xl font-bold text-white">Sign In</h1>

			{registeredSuccess && (
				<div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-200">
					Account created successfully! Please sign in with your credentials.
				</div>
			)}

			{generalError && (
				<div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
					{generalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Email Field */}
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-200"
					>
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleInputChange}
						placeholder="you@example.com"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
					{errors.email && (
						<p className="mt-1 text-xs text-red-400">{errors.email}</p>
					)}
				</div>

				{/* Password Field */}
				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-200"
					>
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleInputChange}
						placeholder="••••••••"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
					{errors.password && (
						<p className="mt-1 text-xs text-red-400">{errors.password}</p>
					)}
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isLoading}
					className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 font-medium text-white transition hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "Signing in..." : "Sign In"}
				</button>
			</form>

			<p className="mt-4 text-center text-sm text-gray-400">
				Don't have an account?{" "}
				<Link
					href="/register"
					className="font-medium text-purple-400 hover:text-purple-300"
				>
					Create one
				</Link>
			</p>
		</div>
	);
}
