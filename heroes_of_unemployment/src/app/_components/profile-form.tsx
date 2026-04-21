"use client";

import { useState, useEffect } from "react";
import { api } from "H_o_R/trpc/react";
import Link from "next/link";

interface ProfileFormProps {
	initialData?: {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
		bio?: string | null;
		website?: string | null;
		twitterHandle?: string | null;
		school?: string | null;
		major?: string | null;
		graduationYear?: number | null;
	};
}

export function ProfileForm({ initialData }: ProfileFormProps) {
	const [formData, setFormData] = useState({
		name: initialData?.name ?? "",
		bio: initialData?.bio ?? "",
		website: initialData?.website ?? "",
		twitterHandle: initialData?.twitterHandle ?? "",
		school: initialData?.school ?? "",
		major: initialData?.major ?? "",
		graduationYear: initialData?.graduationYear ?? "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [successMessage, setSuccessMessage] = useState("");
	const [hasChanges, setHasChanges] = useState(false);

	const updateProfileMutation = api.user.updateProfile.useMutation();

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setHasChanges(true);

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

		if (formData.name && formData.name.length < 2) {
			newErrors.name = "Name must be at least 2 characters";
		}

		if (formData.bio && formData.bio.length > 500) {
			newErrors.bio = "Bio must be less than 500 characters";
		}

		if (formData.website) {
			try {
				new URL(formData.website);
			} catch {
				newErrors.website = "Invalid URL";
			}
		}

		if (formData.twitterHandle) {
			if (!/^[A-Za-z0-9_]{1,15}$/.test(formData.twitterHandle)) {
				newErrors.twitterHandle = "Invalid Twitter handle";
			}
		}

		if (formData.graduationYear) {
			const year = parseInt(String(formData.graduationYear), 10);
			if (year < 2020 || year > 2040) {
				newErrors.graduationYear = "Graduation year must be between 2020 and 2040";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSuccessMessage("");

		if (!validateForm()) {
			return;
		}

		try {
			const updateData: Record<string, unknown> = {};

			if (formData.name) updateData.name = formData.name;
			if (formData.bio) updateData.bio = formData.bio;
			if (formData.website) updateData.website = formData.website;
			if (formData.twitterHandle) updateData.twitterHandle = formData.twitterHandle;
			if (formData.school) updateData.school = formData.school;
			if (formData.major) updateData.major = formData.major;
			if (formData.graduationYear) {
				updateData.graduationYear = parseInt(String(formData.graduationYear), 10);
			}

			await updateProfileMutation.mutateAsync(updateData as any);

			setSuccessMessage("Profile updated successfully!");
			setHasChanges(false);

			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			if (error instanceof Error) {
				setErrors({ form: error.message || "Failed to update profile" });
			} else {
				setErrors({ form: "An unexpected error occurred" });
			}
		}
	};

	return (
		<div className="w-full rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
			<h1 className="mb-6 text-2xl font-bold text-white">Edit Profile</h1>

			{errors.form && (
				<div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
					{errors.form}
				</div>
			)}

			{successMessage && (
				<div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-200">
					{successMessage}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-gray-200"
					>
						Full Name
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

				<div>
					<label
						htmlFor="bio"
						className="block text-sm font-medium text-gray-200"
					>
						Bio
					</label>
					<textarea
						id="bio"
						name="bio"
						value={formData.bio}
						onChange={handleInputChange}
						placeholder="Tell us about yourself..."
						rows={4}
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
					<p className="mt-1 text-xs text-gray-400">
						{formData.bio.length}/500 characters
					</p>
					{errors.bio && (
						<p className="text-xs text-red-400">{errors.bio}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="website"
						className="block text-sm font-medium text-gray-200"
					>
						Website
					</label>
					<input
						type="url"
						id="website"
						name="website"
						value={formData.website}
						onChange={handleInputChange}
						placeholder="https://example.com"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
					{errors.website && (
						<p className="mt-1 text-xs text-red-400">{errors.website}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="twitterHandle"
						className="block text-sm font-medium text-gray-200"
					>
						Twitter Handle
					</label>
					<div className="flex items-center">
						<span className="text-gray-400">@</span>
						<input
							type="text"
							id="twitterHandle"
							name="twitterHandle"
							value={formData.twitterHandle}
							onChange={handleInputChange}
							placeholder="username"
							className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
						/>
					</div>
					{errors.twitterHandle && (
						<p className="mt-1 text-xs text-red-400">{errors.twitterHandle}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="school"
						className="block text-sm font-medium text-gray-200"
					>
						School
					</label>
					<input
						type="text"
						id="school"
						name="school"
						value={formData.school}
						onChange={handleInputChange}
						placeholder="e.g., University of California, Berkeley"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
				</div>

				<div>
					<label
						htmlFor="major"
						className="block text-sm font-medium text-gray-200"
					>
						Major
					</label>
					<input
						type="text"
						id="major"
						name="major"
						value={formData.major}
						onChange={handleInputChange}
						placeholder="e.g., Computer Science"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
				</div>

				<div>
					<label
						htmlFor="graduationYear"
						className="block text-sm font-medium text-gray-200"
					>
						Graduation Year
					</label>
					<input
						type="number"
						id="graduationYear"
						name="graduationYear"
						value={formData.graduationYear}
						onChange={handleInputChange}
						placeholder="e.g., 2026"
						min="2020"
						max="2040"
						className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 outline-none transition hover:border-white/30 focus:border-purple-500/50 focus:bg-white/20"
					/>
					{errors.graduationYear && (
						<p className="mt-1 text-xs text-red-400">{errors.graduationYear}</p>
					)}
				</div>

				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						disabled={
							!hasChanges || updateProfileMutation.isPending
						}
						className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 font-medium text-white transition hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{updateProfileMutation.isPending
							? "Saving..."
							: "Save Changes"}
					</button>
					<Link
						href="/profile"
						className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-center font-medium text-white transition hover:border-white/30"
					>
						Cancel
					</Link>
				</div>
			</form>
		</div>
	);
}
