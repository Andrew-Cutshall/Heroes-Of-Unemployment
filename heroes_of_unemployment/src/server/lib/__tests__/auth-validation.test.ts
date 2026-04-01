import { describe, it, expect } from "vitest";
import { signUpSchema } from "../auth-schemas";

describe("signUpSchema", () => {
	it("accepts valid input", () => {
		const result = signUpSchema.safeParse({
			name: "Test User",
			email: "test@example.com",
			password: "password123",
			confirmPassword: "password123",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty name", () => {
		const result = signUpSchema.safeParse({
			name: "",
			email: "test@example.com",
			password: "password123",
			confirmPassword: "password123",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid email", () => {
		const result = signUpSchema.safeParse({
			name: "Test",
			email: "not-an-email",
			password: "password123",
			confirmPassword: "password123",
		});
		expect(result.success).toBe(false);
	});

	it("rejects password under 6 characters", () => {
		const result = signUpSchema.safeParse({
			name: "Test",
			email: "test@example.com",
			password: "12345",
			confirmPassword: "12345",
		});
		expect(result.success).toBe(false);
	});

	it("rejects mismatched passwords", () => {
		const result = signUpSchema.safeParse({
			name: "Test",
			email: "test@example.com",
			password: "password123",
			confirmPassword: "differentpassword",
		});
		expect(result.success).toBe(false);
	});
});
