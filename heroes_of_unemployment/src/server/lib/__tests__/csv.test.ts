import { describe, it, expect } from "vitest";
import { escapeCsvField, toCsv } from "../csv";

describe("escapeCsvField", () => {
	it("passes plain values through", () => {
		expect(escapeCsvField("hello")).toBe("hello");
		expect(escapeCsvField(42)).toBe("42");
	});

	it("returns empty string for null/undefined", () => {
		expect(escapeCsvField(null)).toBe("");
		expect(escapeCsvField(undefined)).toBe("");
	});

	it("quotes and doubles quotes inside fields", () => {
		expect(escapeCsvField('he said "hi"')).toBe('"he said ""hi"""');
	});

	it("quotes fields containing commas", () => {
		expect(escapeCsvField("a,b")).toBe('"a,b"');
	});

	it("quotes fields containing newlines", () => {
		expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
	});
});

describe("toCsv", () => {
	it("produces header-only output for empty input", () => {
		const out = toCsv([], [{ header: "A", key: "a" }]);
		expect(out).toBe("A");
	});

	it("renders header and rows in order", () => {
		const rows = [
			{ name: "Alice", age: 30 },
			{ name: "Bob", age: 25 },
		];
		const out = toCsv(rows, [
			{ header: "Name", key: "name" },
			{ header: "Age", key: "age" },
		]);
		expect(out).toBe("Name,Age\nAlice,30\nBob,25");
	});

	it("escapes special characters in rows", () => {
		const out = toCsv(
			[{ text: 'hello, "world"' }],
			[{ header: "Text", key: "text" }],
		);
		expect(out).toBe('Text\n"hello, ""world"""');
	});

	it("supports function-derived columns", () => {
		const out = toCsv(
			[{ a: 2, b: 3 }],
			[{ header: "Sum", key: (row) => row.a + row.b }],
		);
		expect(out).toBe("Sum\n5");
	});
});
