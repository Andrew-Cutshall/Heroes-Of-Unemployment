"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignInPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const result = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		setLoading(false);

		if (result?.error) {
			setError("Invalid email or password");
		} else {
			router.push("/");
			router.refresh();
		}
	};

	return (
		<div className="mx-auto max-w-md py-12">
			<h1 className="mb-6 text-center text-2xl font-bold text-white">
				Sign In
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
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
				/>
				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:opacity-50"
				>
					{loading ? "Signing in..." : "Sign In"}
				</button>
				<p className="text-center text-sm text-gray-400">
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="text-purple-400 hover:text-purple-300">
						Sign up
					</Link>
				</p>
			</form>
		</div>
	);
}
