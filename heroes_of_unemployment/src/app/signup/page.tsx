"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "H_o_R/trpc/react";

export default function SignUpPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");

	const signUp = api.auth.signUp.useMutation({
		onSuccess: () => {
			router.push("/signin");
		},
		onError: (err) => {
			setError(err.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		signUp.mutate({ name, email, password, confirmPassword });
	};

	return (
		<div className="mx-auto max-w-md py-12">
			<h1 className="mb-6 text-center text-2xl font-bold text-white">
				Create Account
			</h1>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6"
			>
				{error && (
					<p className="rounded bg-red-500/20 px-3 py-2 text-sm text-red-400">
						{error}
					</p>
				)}
				<input
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
				/>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
				/>
				<input
					type="password"
					placeholder="Password (min 6 characters)"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={6}
					className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
				/>
				<input
					type="password"
					placeholder="Confirm Password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
					className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
				/>
				<button
					type="submit"
					disabled={signUp.isPending}
					className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:opacity-50"
				>
					{signUp.isPending ? "Creating account..." : "Sign Up"}
				</button>
				<p className="text-center text-sm text-gray-400">
					Already have an account?{" "}
					<Link href="/signin" className="text-purple-400 hover:text-purple-300">
						Sign in
					</Link>
				</p>
			</form>
		</div>
	);
}
