"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "H_o_R/trpc/react";
import Link from "next/link";

export function RegisterForm() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState("");

	const registerMutation = api.user.register.useMutation();

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
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/[A-Z]/.test(formData.password)) {
			newErrors.password = "Password must contain at least one uppercase letter";
		} else if (!/[a-z]/.test(formData.password)) {
			newErrors.password = "Password must contain at least one lowercase letter";
		} else if (!/[0-9]/.test(formData.password)) {
			newErrors.password = "Password must contain at least one number";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (formData.name && formData.name.length < 2) {
			newErrors.name = "Name must be at least 2 characters";
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
			// Register the user
			await registerMutation.mutateAsync({
				email: formData.email,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
				name: formData.name || undefined,
			});

			// Redirect to login page
			router.push("/login?registered=true");
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("CONFLICT")) {
					setErrors((prev) => ({
						...prev,
						email: "This email is already registered",
					}));
				} else {
					setGeneralError(error.message || "Registration failed. Please try again.");
				}
			} else {
				setGeneralError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const getPasswordStrength = () => {
		let strength = 0;
		if (formData.password.length >= 8) strength++;
		if (/[A-Z]/.test(formData.password)) strength++;
		if (/[a-z]/.test(formData.password)) strength++;
		if (/[0-9]/.test(formData.password)) strength++;
		if (/[!@#$%^&*]/.test(formData.password)) strength++;

		if (strength === 0) return "";
		if (strength < 2) return "Weak";
		if (strength < 4) return "Fair";
		if (strength < 5) return "Good";
		return "Strong";
	};

	return (
		<div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
			<h1 className="mb-6 text-2xl font-bold text-white">Create Account</h1>

			{generalError && (
				<div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
					{generalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Name Field */}
				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-gray-200"
					>
						Full Name (Optional)
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleInputChange}
						placeholder="John Doe"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
					{errors.name && (
						<p className="mt-1 text-xs text-red-400">{errors.name}</p>
					)}
				</div>

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
					{formData.password && (
						<div className="mt-2 flex items-center justify-between">
							<p className="text-xs text-gray-400">
								Strength: <span className="font-semibold text-gray-300">{getPasswordStrength()}</span>
							</p>
							<div className="flex gap-1">
								{[...Array(5)].map((_, i) => (
									<div
										key={i}
										className={`h-1 w-1 rounded-full transition-colors ${
											i <
											(getPasswordStrength() === "Strong"
												? 5
												: getPasswordStrength() === "Good"
													? 4
													: getPasswordStrength() === "Fair"
														? 3
														: getPasswordStrength() === "Weak"
															? 2
															: 1)
												? "bg-purple-500"
												: "bg-white/20"
										}`}
									/>
								))}
							</div>
						</div>
					)}
					{errors.password && (
						<p className="mt-1 text-xs text-red-400">{errors.password}</p>
					)}
				</div>

				{/* Confirm Password Field */}
				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-gray-200"
					>
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleInputChange}
						placeholder="••••••••"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
					{errors.confirmPassword && (
						<p className="mt-1 text-xs text-red-400">
							{errors.confirmPassword}
						</p>
					)}
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isLoading}
					className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 font-medium text-white transition hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "Creating Account..." : "Create Account"}
				</button>
			</form>

			<p className="mt-4 text-center text-sm text-gray-400">
				Already have an account?{" "}
				<Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">
					Sign in
				</Link>
			</p>
		</div>
	);
}
