import { z } from "zod";

const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number");

export const registerInputSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		password: passwordSchema,
		confirmPassword: z.string(),
		name: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const updateProfileInputSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").optional(),
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
	twitterHandle: z
		.string()
		.regex(/^[A-Za-z0-9_]{1,15}$/, "Invalid Twitter handle")
		.optional()
		.or(z.literal("")),
	school: z.string().optional(),
	major: z.string().optional(),
	graduationYear: z
		.number()
		.int()
		.min(2020, "Graduation year must be 2020 or later")
		.max(2040, "Graduation year must be 2040 or earlier")
		.optional()
		.nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const checkEmailSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export type CheckEmailInput = z.infer<typeof checkEmailSchema>;
