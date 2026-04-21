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
			await registerMutation.mutateAsync({
				email: formData.email,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
				name: formData.name || undefined,
			});

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
		<div className="rpg-panel rpg-panel-ornate w-full max-w-md p-8">
			<p className="rpg-pixel mb-2 text-center text-[9px] text-[#d4af37]">
				✦ FORGE A NEW LEGEND ✦
			</p>
			<h1 className="rpg-heading mb-1 text-center text-3xl">Begin Thy Quest</h1>
			<p className="rpg-display mb-6 text-center text-sm text-[#d9c9a6]">
				Pledge thy name to the great ledger of heroes.
			</p>

			{generalError && (
				<div className="mb-4 rounded-sm border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-200">
					{generalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="name"
						className="rpg-pixel block text-[10px] text-[#d4af37]"
					>
						HERO NAME (OPTIONAL)
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleInputChange}
						placeholder="Sir Lancelot"
						className="rpg-input mt-1 w-full rounded-sm px-3 py-2 placeholder-[#8a7a5a]"
					/>
					{errors.name && (
						<p className="mt-1 text-xs text-red-300">{errors.name}</p>
					)}
				</div>

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
						PASSPHRASE
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
					{formData.password && (
						<div className="mt-2 flex items-center justify-between">
							<p className="rpg-pixel text-[9px] text-[#8a7a5a]">
								STRENGTH:{" "}
								<span className="text-[#f4c430]">{getPasswordStrength()}</span>
							</p>
							<div className="flex gap-1">
								{[...Array(5)].map((_, i) => (
									<div
										key={i}
										className={`h-1.5 w-3 transition-colors ${
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
												? "bg-[#f4c430]"
												: "bg-white/10"
										}`}
									/>
								))}
							</div>
						</div>
					)}
					{errors.password && (
						<p className="mt-1 text-xs text-red-300">{errors.password}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="rpg-pixel block text-[10px] text-[#d4af37]"
					>
						CONFIRM PASSPHRASE
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleInputChange}
						placeholder="••••••••"
						className="rpg-input mt-1 w-full rounded-sm px-3 py-2 placeholder-[#8a7a5a]"
					/>
					{errors.confirmPassword && (
						<p className="mt-1 text-xs text-red-300">
							{errors.confirmPassword}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="rpg-button rpg-button-primary mt-6 w-full rounded-sm px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? "Inscribing…" : "⚜ Sign the Ledger"}
				</button>
			</form>

			<div className="rpg-divider my-6" />
			<p className="rpg-display text-center text-sm text-[#d9c9a6]">
				Already sworn to the cause?{" "}
				<Link
					href="/login"
					className="font-medium text-[#f4c430] hover:text-[#fff0a8]"
				>
					Return to the tavern
				</Link>
			</p>
		</div>
	);
}
